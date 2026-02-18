require('dotenv').config({ path: 'server/.env' });
const { sendSMS } = require('./server/services/notificationService');

async function testSMS() {
    console.log('Testing AT Sandbox SMS...');
    try {
        // Africa's Talking Sandbox requires a verified phone number or use of the simulator
        // For sandbox, use a dummy number or your own if verified. 
        // We will try to send to a test number.
        const result = await sendSMS('+256700000000', 'Hello from M&T Growth Gateway Sandbox Test!');
        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

testSMS();
