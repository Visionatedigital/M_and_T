
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listRpcs() {
    // We can query information_schema if we have permission, but RPCs are in pg_proc
    // The service role often has access to see these.
    const { data, error } = await supabase.rpc('exec_sql', { sql: "SELECT routine_name FROM information_schema.routines WHERE routine_type = 'FUNCTION' AND routine_schema = 'public';" });

    if (error) {
        console.error("exec_sql failed, trying direct select via postgrest...");
        const { data: data2, error: error2 } = await supabase.from('_rpc').select('*').limit(1); // This might not work
        console.error(error);
    } else {
        console.log("Available RPCs:", data.map(r => r.routine_name));
    }
}

listRpcs();
