export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
    // This is a simulated email function.
    // In a real application, you would configure an SMTP server (e.g. SendGrid, Nodemailer) here.
    console.log('\n--- MOCK EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text}`);
    console.log('------------------\n');
};
