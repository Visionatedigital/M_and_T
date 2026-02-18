
const nodemailer = require('nodemailer');
const db = require('../db');

// Initialize Africa's Talking
const credentials = {
    apiKey: process.env.AT_API_KEY || 'sandbox',
    username: process.env.AT_USERNAME || 'sandbox'
};

const AfricasTalking = require('africastalking')(credentials);

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use SMTP settings from env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendSMS = async (to, message) => {
    if (!to || !message) return;

    // Only Mock if API Key is missing COMPLETELY
    if (!process.env.AT_API_KEY) {
        console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
        return { status: 'mocked' };
    }

    try {
        const result = await AfricasTalking.SMS.send({
            to: to,
            message: message
        });
        console.log('SMS sent:', result);
        return result;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { error: error.message };
    }
};

const sendEmail = async (to, subject, text) => {
    if (!to || !subject || !text) return;

    // In development or if credentials missing, just log
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
        return { status: 'mocked' };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: error.message };
    }
};

const createNotification = async (userId, title, message, type = 'info') => {
    try {
        const { rows } = await db.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, title, message, type]
        );
        return rows[0];
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = {
    sendSMS,
    sendEmail,
    createNotification
};
