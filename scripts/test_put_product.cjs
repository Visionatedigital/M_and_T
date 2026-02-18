async function testPutProduct() {
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const loginPayload = { email: "loanofficer@mandt.placeholder", password: "Officer@2026" };

    try {
        const loginRes = await fetch(loginUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginPayload) });
        const { token } = await loginRes.json();

        // Get products
        const productsRes = await fetch('http://localhost:5000/api/products', { headers: { 'Authorization': `Bearer ${token}` } });
        const products = await productsRes.json();
        if (products.length === 0) { console.log('No products to test update'); return; }

        const id = products[0].id;
        console.log('Testing PUT on product:', id, products[0].name);

        const updateRes = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...products[0], name: products[0].name + " (Test)" })
        });

        if (updateRes.ok) console.log('PUT Product SUCCESS:', await updateRes.json());
        else console.log('PUT Product FAILED:', updateRes.status, await updateRes.text());

    } catch (err) { console.error(err); }
}
testPutProduct();
