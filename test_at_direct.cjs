const credentials = {
    apiKey: 'atsk_b8f59689f2fd66d052f8014290d29e14fff8232a971c41abeb6011826be16cd091ab0702',
    username: 'sandbox'
};

// Initialize the SDK
const AfricasTalking = require('africastalking')(credentials);

// Log keys to inspect the object
console.log('AT Object Keys:', Object.keys(AfricasTalking));
console.log('SMS Object:', AfricasTalking.SMS);

async function testDirectSMS() {
    console.log('Testing Direct Sandbox SMS...');
    try {
        const result = await AfricasTalking.SMS.send({
            to: '+256700000000',
            message: 'Direct Sandbox Test from M&T'
        });
        console.log('Success:', result);
    } catch (error) {
        console.error('Error Details:', error);
    }
}

testDirectSMS();
