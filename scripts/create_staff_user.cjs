/**
 * Create a staff user in Supabase Auth + profiles + user_roles (loan_officer or admin).
 *
 * Usage (from project root):
 *   node scripts/create_staff_user.cjs <email> <full_name> [phone] [role]
 *
 * Password: pass as 5th arg, or set STAFF_PASSWORD in the environment.
 * If omitted, a random password is generated and printed once.
 *
 * Requires in .env: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY
 */
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
const fullName = process.argv[3];
const phone = process.argv[4] || null;
const roleArg = (process.argv[5] || 'loan_officer').toLowerCase().trim();
const passwordArg = process.argv[6] || process.env.STAFF_PASSWORD;

if (!url || !serviceKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

if (!email || !fullName) {
    console.error('Usage: node scripts/create_staff_user.cjs <email> <full_name> [phone] [loan_officer|admin] [password]');
    console.error('Or set STAFF_PASSWORD in the environment (used when password arg omitted).');
    process.exit(1);
}

if (!['loan_officer', 'admin'].includes(roleArg)) {
    console.error('role must be loan_officer or admin');
    process.exit(1);
}

const password = passwordArg && String(passwordArg).length >= 8
    ? String(passwordArg)
    : crypto.randomBytes(16).toString('base64url') + 'aA1!';

const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
        console.error('listUsers:', listErr.message);
        process.exit(1);
    }
    const existing = list.users.find((u) => u.email === email);
    let userId;

    if (existing) {
        userId = existing.id;
        console.log(`User already exists in Auth: ${userId}`);
        const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, phone_number: phone || undefined },
        });
        if (updErr) {
            console.error('updateUserById:', updErr.message);
            process.exit(1);
        }
        console.log('Password and metadata updated.');
    } else {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, phone_number: phone || undefined },
        });
        if (createErr) {
            console.error('createUser:', createErr.message);
            process.exit(1);
        }
        userId = created.user.id;
        console.log(`Created Auth user: ${userId}`);
    }

    const { error: profErr } = await supabase.from('profiles').upsert(
        {
            id: userId,
            full_name: fullName,
            email,
            phone_number: phone,
        },
        { onConflict: 'id' }
    );
    if (profErr) {
        console.warn('profiles upsert (non-fatal):', profErr.message);
    }

    const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('user_id', userId);

    const hasRole = existingRoles?.some((r) => r.role === roleArg);
    if (!hasRole) {
        const { error: roleErr } = await supabase.from('user_roles').insert({
            user_id: userId,
            role: roleArg,
        });
        if (roleErr) {
            console.error('user_roles insert:', roleErr.message);
            process.exit(1);
        }
        console.log(`Assigned role: ${roleArg}`);
    } else {
        console.log(`Role '${roleArg}' already present.`);
    }

    console.log('\n--- Staff login (Staff portal) ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name:     ${fullName}`);
    console.log(`Role:     ${roleArg}`);
    if (!passwordArg && !process.env.STAFF_PASSWORD) {
        console.log('\n(Password was auto-generated; save it now — it will not be shown again.)');
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
