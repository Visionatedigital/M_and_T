const axios = require('axios');

const API_REF = 'http://localhost:5000/api';

async function testEndpoints() {
    try {
        console.log('--- Testing API Endpoints ---');

        // 1. Login
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_REF}/auth/login`, {
            email: 'admin@mandt.placeholder',
            password: 'Admin@2026'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Fetch Dashboard Stats
        console.log('Fetching dashboard stats...');
        const statsRes = await axios.get(`${API_REF}/reports/dashboard-stats`, config);
        console.log('Dashboard stats fetched successfully:', statsRes.data.userName);

        // 3. Fetch Applications
        console.log('Fetching applications...');
        const appsRes = await axios.get(`${API_REF}/applications`, config);
        console.log(`Fetched ${appsRes.data.length} applications.`);

        // 4. Fetch Clients
        console.log('Fetching clients...');
        const clientsRes = await axios.get(`${API_REF}/clients`, config);
        console.log(`Fetched ${clientsRes.data.length} clients.`);

        // 5. Fetch Repayments
        console.log('Fetching repayments...');
        const repsRes = await axios.get(`${API_REF}/repayments`, config);
        console.log(`Fetched ${repsRes.data.length} repayments.`);

        console.log('\n--- All verification points PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('\n--- Verification FAILED ---');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    }
}

testEndpoints();
