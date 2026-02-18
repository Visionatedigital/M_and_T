const axios = require('axios');
const qs = require('querystring');

const apiKey = 'atsk_bba5416b0505c6e963b4722bbe4db8a2cdcde93c912379bc475eb50601114c48023c9d56';
const username = 'sandbox';

async function testAxios() {
    console.log('Testing with Axios...');
    const url = 'https://api.sandbox.africastalking.com/version1/messaging';
    const data = qs.stringify({
        username: username,
        to: '+256700000000',
        message: 'Axios Sandbox Test'
    });

    try {
        const response = await axios.post(url, data, {
            headers: {
                'apiKey': apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });
        console.log('Success:', response.status, response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
        console.error('Body:', error.response ? error.response.data : '');
    }
}

testAxios();
