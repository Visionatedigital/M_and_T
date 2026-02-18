const axios = require('axios');

async function checkFrontend() {
    try {
        console.log('Checking frontend availability...');
        const res = await axios.get('http://localhost:8080');
        console.log(`Frontend Status: ${res.status}`);

        if (res.status === 200) {
            console.log('Frontend is accessible.');
            process.exit(0);
        } else {
            console.error('Frontend returned non-200 status');
            process.exit(1);
        }
    } catch (err) {
        console.error('Frontend check failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('Connection refused. Ensure Vite server is running.');
        }
        process.exit(1);
    }
}

checkFrontend();
