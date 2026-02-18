// using global fetch


async function testApi() {
    try {
        // Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@mandt.placeholder',
                password: 'Admin@2026'
            })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const { token } = await loginRes.json();
        console.log('Login successful. Token obtained.');

        // Request Failing Endpoint
        const id = '27ba1b12-d4cf-4783-ab1d-f53b203d3839';
        console.log(`Requesting application ${id}...`);

        const res = await fetch(`http://localhost:5000/api/applications/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response Status:', res.status);
        const text = await res.text();
        console.log('Response Body:', text);

    } catch (err) {
        console.error('Test script error:', err);
    }
}

testApi();
