
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) console.log(error);
    else {
        console.log('Total Auth Users:', users.length);
        const sampleId = 'e560377e-8e67-4ff3-a394-2053b82609da'; // From sample loan
        const found = users.find(u => u.id === sampleId);
        console.log(`User ${sampleId} found?`, !!found);
    }
}

checkAuth();
