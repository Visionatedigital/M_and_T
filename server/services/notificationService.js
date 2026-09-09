const nodemailer = require('nodemailer');
const db = require('../db.cjs');

// Initialize Africa's Talking
const credentials = {
    apiKey: process.env.AT_API_KEY || 'sandbox',
    username: process.env.AT_USERNAME || 'sandbox'
};

const AfricasTalking = require('africastalking')(credentials);

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendSMS = async (to, message) => {
    if (!to || !message) return;
    if (!process.env.AT_API_KEY) {
        console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
        return { status: 'mocked' };
    }
    try {
        const result = await AfricasTalking.SMS.send({ to, message });
        console.log('SMS sent:', result);
        return result;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { error: error.message };
    }
};

const sendEmail = async (to, subject, text, options = {}) => {
    if (!to || !subject || !text) return;
    const attachments = Array.isArray(options.attachments) ? options.attachments : [];
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${text.slice(0, 200)}… attachments=${attachments.length}`);
        return { status: 'mocked' };
    }
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text,
            html: options.html || undefined,
            attachments,
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
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, title, message, type]
        );
        return rows[0];
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = { sendSMS, sendEmail, createNotification };
