// const fetch = require('node-fetch'); // Not needed for Node 18+

async function testUpdateWithAuth() {
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const loginPayload = {
        email: "loanofficer@mandt.placeholder",
        password: "Officer@2026"
    };

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful, got token.');

        // 2. Perform Update Test
        const id = '27ba1b12-d4cf-4783-ab1d-f53b203d3839';
        const url = `http://localhost:5000/api/applications/${id}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log(`Fetching current data for ${id}...`);
        const getRes = await fetch(url, { headers });
        if (!getRes.ok) throw new Error(`GET failed: ${getRes.status} ${getRes.statusText}`);
        const currentData = await getRes.json();
        console.log('Current Data:', JSON.stringify(currentData, null, 2));
        console.log('Current Name:', currentData.full_name);

        console.log('Sending PUT request...');
        const payload = {
            ...currentData,
            full_name: currentData.full_name.includes("(Updated)") ? currentData.full_name : currentData.full_name + " (Updated)",
            // Ensure optional JSON fields are arrays, not null, to satisfy backend expectations if any
            guarantors: currentData.guarantors || [],
            group_members: currentData.group_members || []
        };
        console.log('Payload being sent:', JSON.stringify(payload, null, 2));

        const updateRes = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });

        if (!updateRes.ok) {
            const errText = await updateRes.text();
            throw new Error(`PUT failed: ${updateRes.status} ${updateRes.statusText} - ${errText}`);
        }

        const updatedData = await updateRes.json();
        console.log('Update SUCCESS!');
        console.log('New Name:', updatedData.full_name);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testUpdateWithAuth();
