async function testDebugPut() {
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const loginPayload = { email: "loanofficer@mandt.placeholder", password: "Officer@2026" };

    try {
        const loginRes = await fetch(loginUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginPayload) });
        const { token } = await loginRes.json();

        const res = await fetch('http://localhost:5000/api/applications/test', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) console.log(await res.json());
        else console.log('Debug PUT failed:', res.status, await res.text());

    } catch (err) { console.error(err); }
}
testDebugPut();
