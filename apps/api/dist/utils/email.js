"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const sendEmail = async (to, subject, text) => {
    // This is a simulated email function.
    // In a real application, you would configure an SMTP server (e.g. SendGrid, Nodemailer) here.
    console.log('\n--- MOCK EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text}`);
    console.log('------------------\n');
};
exports.sendEmail = sendEmail;
