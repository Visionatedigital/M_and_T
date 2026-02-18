const credentials = {
    apiKey: 'atsk_bba5416b0505c6e963b4722bbe4db8a2cdcde93c912379bc475eb50601114c48023c9d56',
    username: 'sandbox'
};

const AfricasTalking = require('africastalking')(credentials);

async function testAuth() {
    console.log('Testing Authentication (Application Data)...');
    try {
        const result = await AfricasTalking.APPLICATION.fetchApplicationData();
        console.log('Success!', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Auth Failed:', error.response ? error.response.status : error.message);
        console.error('Details:', error.response ? error.response.data : '');
    }
}

testAuth();
