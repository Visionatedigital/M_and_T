import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importLocationsFromExcel() {
    try {
        // Read the Excel file
        const excelPath = path.join(process.cwd(), 'public', 'MT MICROFINANCE Admin 33.xlsx');

        if (!fs.existsSync(excelPath)) {
            console.error('Excel file not found at:', excelPath);
            return;
        }

        console.log('Reading Excel file...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Found ${data.length} rows in Excel file`);
        console.log('Sample row:', data[0]);

        // Get all loan applications
        const { data: loans, error: loansError } = await supabase
            .from('loan_applications')
            .select('*');

        if (loansError) {
            console.error('Error fetching loans:', loansError);
            return;
        }

        console.log(`Found ${loans?.length || 0} loan applications in database`);

        let updateCount = 0;
        let matchedCount = 0;

        // Process each Excel row
        for (const row of data as any[]) {
            // Try to find matching loan application by name or phone
            const clientName = row['Client Name'] || row['Name'] || row['CLIENT NAME'] || '';
            const phoneNumber = row['Phone'] || row['Phone Number'] || row['PHONE'] || '';

            // Extract location fields - adjust these based on actual Excel column names
            const district = row['District'] || row['DISTRICT'] || '';
            const county = row['County'] || row['COUNTY'] || '';
            const subCounty = row['Sub County'] || row['SUB COUNTY'] || row['Sub-County'] || '';
            const parish = row['Parish'] || row['PARISH'] || '';
            const village = row['Village'] || row['VILLAGE'] || '';

            if (!clientName && !phoneNumber) continue;

            // Find matching loan application
            const matchingLoan = loans?.find(loan => {
                const nameMatch = clientName && loan.full_name?.toLowerCase().includes(clientName.toLowerCase());
                const phoneMatch = phoneNumber && loan.phone_number?.includes(phoneNumber.replace(/\D/g, ''));
                return nameMatch || phoneMatch;
            });

            if (matchingLoan) {
                matchedCount++;

                // Only update if there's location data and the loan doesn't already have it
                if ((district || village) && !matchingLoan.district) {
                    console.log(`Updating location for: ${matchingLoan.full_name}`);
                    console.log(`  District: ${district}, Village: ${village}`);

                    const { error: updateError } = await supabase
                        .from('loan_applications')
                        .update({
                            district: district || null,
                            county: county || null,
                            sub_county: subCounty || null,
                            parish: parish || null,
                            village: village || null,
                        })
                        .eq('id', matchingLoan.id);

                    if (updateError) {
                        console.error(`Error updating ${matchingLoan.full_name}:`, updateError);
                    } else {
                        updateCount++;
                    }
                }
            }
        }

        console.log('\\n=== Import Summary ===');
        console.log(`Total Excel rows: ${data.length}`);
        console.log(`Matched clients: ${matchedCount}`);
        console.log(`Updated with locations: ${updateCount}`);
        console.log('=====================\\n');

    } catch (error) {
        console.error('Error importing locations:', error);
    }
}

importLocationsFromExcel();
