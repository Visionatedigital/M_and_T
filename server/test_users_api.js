// using global fetch

async function testUsersApi() {
    try {
        // Login as Admin
        console.log('Logging in as Admin...');
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
        console.log('Login successful.');

        // Fetch Users
        console.log('Fetching users...');
        const res = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error('Failed to fetch users:', res.status, await res.text());
            return;
        }

        const users = await res.json();
        console.log('Users fetched:', users.length);
        console.table(users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.full_name })));

    } catch (err) {
        console.error('Test script error:', err);
    }
}

testUsersApi();
