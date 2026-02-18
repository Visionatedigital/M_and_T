async function testGlobalPut() {
    try {
        const res = await fetch('http://localhost:5000/api/test-global', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) console.log(await res.json());
        else console.log('Global PUT failed:', res.status, await res.text());

    } catch (err) { console.error(err); }
}
testGlobalPut();
