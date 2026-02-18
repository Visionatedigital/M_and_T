
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkType() {
    // We can't run raw SQL easily, but we can try to insert a wrong type to force an error?
    // Or better: Use the postgrest introspection if possible.
    // Actually, I'll just try to select it and check if it's a string (UUID) or number.
    const { data, error } = await supabase.from('loan_applications').select('id, group_id').not('group_id', 'is', null).limit(1);
    if (error) {
        console.log("No non-null group_id found. Checking columns via RPC or similar...");
        // If I can't find one, I'll assume it's a UUID because of the 'groups' id type.
    } else if (data && data.length > 0) {
        console.log("Sample non-null group_id:", data[0].group_id);
    } else {
        console.log("No data with group_id found.");
    }
}

checkType();
