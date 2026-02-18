const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ── RAW XML REGEX PARSER ──
// The xlsx library fails on this file because it uses inline strings (<is> tags)
// instead of a shared string table. This regex approach extracts data directly.
function parseExcelXml(filePath) {
    const buf = fs.readFileSync(filePath);
    const text = buf.toString('utf8');

    // Extract cells: <c r="B3" ...>...<is><t>Name</t></is>...</c>  OR  <c r="C3" ...><v>500000</v></c>
    const cRegex = /<c\s+[^>]*r="([A-Z]+\d+)"[^>]*>(.*?)<\/c>/gs;
    const cellData = {};
    let match;

    while ((match = cRegex.exec(text)) !== null) {
        const addr = match[1];
        const content = match[2];

        // Try inline string first: <is><t>...</t></is>
        const isMatch = content.match(/<is[^>]*>.*?<t[^>]*>(.*?)<\/t>.*?<\/is>/s);
        if (isMatch) {
            cellData[addr] = isMatch[1].trim();
            continue;
        }

        // Fallback: numeric value <v>...</v>
        const vMatch = content.match(/<v\s*>(.*?)<\/v>/);
        if (vMatch) {
            cellData[addr] = vMatch[1].trim();
        }
    }

    // Organize into rows
    const rowMap = {};
    for (const addr in cellData) {
        const col = addr.replace(/\d/g, '');
        const row = parseInt(addr.replace(/[A-Z]/g, ''));
        if (!rowMap[row]) rowMap[row] = {};
        rowMap[row][col] = cellData[addr];
    }

    return rowMap;
}

async function repopulate() {
    console.log('=== STARTING RE-POPULATION (RAW XML PARSER) ===');

    // 1. Parse Excel via raw XML regex
    console.log('Parsing Excel via raw XML...');
    const rowMap = parseExcelXml('public/MT MICROFINANCE Admin 33.xlsx');
    const rowNums = Object.keys(rowMap).map(Number).sort((a, b) => a - b);
    console.log(`Found ${rowNums.length} rows (${rowNums[0]} to ${rowNums[rowNums.length - 1]})`);

    // Quick sample
    if (rowMap[3]) console.log('Sample Row 3:', JSON.stringify(rowMap[3]));

    // 2. Cleanup functional tables
    console.log('Clearing functional tables...');
    await supabase.from('repayments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('loan_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Build user lookup map
    console.log('Building user lookup map...');
    let allUsers = [];
    let page = 1;
    while (true) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error || !users || users.length === 0) break;
        allUsers = allUsers.concat(users);
        if (users.length < 1000) break;
        page++;
    }
    const phoneLookup = new Map();
    const emailLookup = new Map();
    allUsers.forEach(u => {
        if (u.phone) phoneLookup.set(u.phone.replace(/\D/g, ''), u.id);
        if (u.email) emailLookup.set(u.email.toLowerCase(), u.id);
    });
    console.log(`Mapped ${allUsers.length} existing auth users.`);

    // 4. Process each data row
    let created = 0, skipped = 0, errors = 0;
    let groupCache = {};

    for (const rowNum of rowNums) {
        if (rowNum <= 2) continue; // Skip header rows

        const data = rowMap[rowNum];
        const name = data.B;
        if (!name || name.toUpperCase().includes('TOTAL')) continue;

        const principal = Number(data.C);
        if (isNaN(principal) || principal <= 0) continue;

        const groupName = data.F || null;
        const rawPhone = data.N || null;
        const nin = data.T || null;
        const paid = Number(data.D) || 0;
        const address = data.L || 'No Address';

        try {
            // A. Group lookup/create
            let groupId = null;
            if (groupName && groupName.trim()) {
                const cleanGroup = groupName.trim();
                if (groupCache[cleanGroup]) {
                    groupId = groupCache[cleanGroup];
                } else {
                    const { data: eg } = await supabase.from('groups').select('id').ilike('group_name', cleanGroup).limit(1).single();
                    if (eg) {
                        groupId = eg.id;
                    } else {
                        const { data: ng } = await supabase.from('groups').insert({ group_name: cleanGroup }).select().single();
                        if (ng) groupId = ng.id;
                    }
                    if (groupId) groupCache[cleanGroup] = groupId;
                }
            }

            // B. User get-or-create
            let userId;
            let formattedPhone = null;
            let cleanPhoneDigits = null;

            if (rawPhone) {
                let p = rawPhone.trim().replace(/\D/g, '');
                if (p.length > 5) {
                    if (p.startsWith('256')) { /* already correct */ }
                    else if (p.startsWith('0')) p = '256' + p.substring(1);
                    else p = '256' + p;
                    formattedPhone = '+' + p;
                    cleanPhoneDigits = p;
                }
            }

            const placeholderEmail = nin
                ? `${nin.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.mtmicrofinance.ug`
                : `row${rowNum}@client.mtmicrofinance.ug`;

            // Check cache first
            if (cleanPhoneDigits && phoneLookup.has(cleanPhoneDigits)) {
                userId = phoneLookup.get(cleanPhoneDigits);
            } else if (emailLookup.has(placeholderEmail)) {
                userId = emailLookup.get(placeholderEmail);
            } else {
                // Create new user
                const createPayload = {
                    password: 'Password123!',
                    user_metadata: { full_name: name, nin: nin }
                };
                if (formattedPhone) {
                    createPayload.phone = formattedPhone;
                    createPayload.phone_confirm = true;
                } else {
                    createPayload.email = placeholderEmail;
                    createPayload.email_confirm = true;
                }

                const { data: nu, error: ue } = await supabase.auth.admin.createUser(createPayload);

                if (ue) {
                    if (ue.message.includes('already registered')) {
                        // Try to find the existing user
                        const { data: { users: fresh } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
                        const found = fresh.find(u =>
                            (formattedPhone && u.phone === formattedPhone) ||
                            (u.email && u.email.toLowerCase() === placeholderEmail)
                        );
                        if (found) {
                            userId = found.id;
                        } else {
                            skipped++;
                            continue;
                        }
                    } else {
                        console.error(`Row ${rowNum}: User error: ${ue.message}`);
                        errors++;
                        continue;
                    }
                } else {
                    userId = nu.user.id;
                }

                // Update caches
                if (cleanPhoneDigits) phoneLookup.set(cleanPhoneDigits, userId);
                emailLookup.set(placeholderEmail, userId);
            }

            // C. Profile upsert
            await supabase.from('profiles').upsert({
                id: userId,
                full_name: name,
                phone_number: formattedPhone || null
            });

            // D. Loan insert
            const { data: loan, error: le } = await supabase.from('loan_applications').insert({
                user_id: userId,
                full_name: name,
                email: placeholderEmail,
                phone_number: formattedPhone || '0000000000',
                id_number: nin || 'MISSING-NIN',
                loan_amount: principal,
                loan_purpose: 'Agricultural Loan',
                loan_product: groupId ? 'Group Loan' : 'Individual Loan',
                loan_duration_months: 4,
                status: 'disbursed',
                address: address,
                date_of_birth: '1900-01-01',
                employment_status: 'Self-Employed',
                approved_at: new Date().toISOString(),
                group_id: groupId,
                amount_paid: paid
            }).select().single();

            if (le) {
                console.error(`Row ${rowNum}: Loan error for ${name}: ${le.message}`);
                errors++;
                continue;
            }

            // E. Repayment
            if (paid > 0) {
                await supabase.from('repayments').insert({
                    loan_application_id: loan.id,
                    amount: paid,
                    payment_date: new Date().toISOString(),
                    payment_method: 'Cash'
                });
            }

            created++;
            if (created % 50 === 0) console.log(`  ...created ${created} records so far...`);

        } catch (err) {
            console.error(`Row ${rowNum}: Exception for ${name}: ${err.message}`);
            errors++;
        }
    }

    console.log('=== RE-POPULATION COMPLETE ===');
    console.log(`  Created: ${created}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors:  ${errors}`);
}

repopulate().catch(console.error);
