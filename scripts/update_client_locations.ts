import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Manual location data based on the Excel file
// TODO: Update these with actual data from MT MICROFINANCE Admin 33.xlsx
const clientLocations = [
    {
        name: 'TURINAWE RICHARD',
        phone: '+256759235535',
        district: '', // Update from Excel
        county: '', // Update from Excel
        sub_county: '', // Update from Excel
        parish: '', // Update from Excel
        village: '', // Update from Excel
    },
    {
        name: 'KIZZA RICHARD',
        phone: '+256743494614',
        district: '', // Update from Excel
        county: '', // Update from Excel
        sub_county: '', // Update from Excel
        parish: '', // Update from Excel
        village: '', // Update from Excel
    },
    // Add more clients as needed
];

async function updateClientLocations() {
    try {
        console.log('Fetching loan applications...');

        const { data: loans, error: loansError } = await supabase
            .from('loan_applications')
            .select('*');

        if (loansError) {
            console.error('Error fetching loans:', loansError);
            return;
        }

        console.log(`Found ${loans?.length || 0} loan applications\\n`);

        let updateCount = 0;

        for (const clientLocation of clientLocations) {
            // Find matching loan
            const matchingLoan = loans?.find(loan => {
                const nameMatch = loan.full_name?.toLowerCase().includes(clientLocation.name.toLowerCase());
                const phoneMatch = loan.phone_number?.includes(clientLocation.phone.replace(/\D/g, ''));
                return nameMatch || phoneMatch;
            });

            if (matchingLoan) {
                console.log(`Found: ${matchingLoan.full_name} (${matchingLoan.phone_number})`);

                // Check if location data is provided
                if (!clientLocation.district && !clientLocation.village) {
                    console.log('  ⚠️  No location data provided - skipping\\n');
                    continue;
                }

                console.log(`Updating location:`);
                console.log(`  District: ${clientLocation.district}`);
                console.log(`  Village: ${clientLocation.village}\\n`);

                const { error: updateError } = await supabase
                    .from('loan_applications')
                    .update({
                        district: clientLocation.district || null,
                        county: clientLocation.county || null,
                        sub_county: clientLocation.sub_county || null,
                        parish: clientLocation.parish || null,
                        village: clientLocation.village || null,
                    })
                    .eq('id', matchingLoan.id);

                if (updateError) {
                    console.error(`❌ Error updating: ${updateError.message}\\n`);
                } else {
                    updateCount++;
                    console.log(`✅ Updated successfully\\n`);
                }
            } else {
                console.log(`❌ No match found for: ${clientLocation.name}\\n`);
            }
        }

        console.log('\\n=== Update Summary ===');
        console.log(`Total clients in list: ${clientLocations.length}`);
        console.log(`Successfully updated: ${updateCount}`);
        console.log('=====================\\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

updateClientLocations();
