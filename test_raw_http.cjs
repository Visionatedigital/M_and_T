const https = require('https');
const querystring = require('querystring');

const apiKey = 'atsk_bba5416b0505c6e963b4722bbe4db8a2cdcde93c912379bc475eb50601114c48023c9d56';

function testSandbox(username) {
    const data = querystring.stringify({
        username: username,
        to: '+256700000000',
        message: 'Raw HTTP Sandbox Test'
    });

    const options = {
        hostname: 'api.sandbox.africastalking.com',
        port: 443,
        path: '/version1/messaging',
        method: 'POST',
        headers: {
            'apiKey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Accept': 'application/json'
        }
    };

    console.log(`Testing Username: '${username}' on Sandbox...`);

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`Response [${username}]: ${res.statusCode} ${res.statusMessage}`);
            console.log(`Body: ${body}\n`);
        });
    });

    req.on('error', (e) => {
        console.error(`Error [${username}]: ${e.message}`);
    });

    req.write(data);
    req.end();
}

testSandbox('sandbox');
testSandbox('betsure');
