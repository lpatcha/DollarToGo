import nodemailer from 'nodemailer';

// Email configuration from environment variables
// HOST and PORT are optional if using 'service'
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465'); // Default to 465 for SSL (more reliable on cloud)
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// More robust transport configuration
const createTransporter = () => {
    // If it's Gmail, using 'service' is more reliable than manual host/port
    if (SMTP_HOST.includes('gmail.com')) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
    }

    // Default SMTP configuration
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

const transporter = createTransporter();

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        if (!SMTP_USER || !SMTP_PASS) {
            console.warn('\n⚠️  EMAIL NOT SENT: Missing SMTP_USER or SMTP_PASS environment variables.');
            console.log('--- MOCK EMAIL ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('------------------\n');
            return;
        }

        await transporter.sendMail({
            from: `"DollarToGo" <${SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error: any) {
        console.error('❌ Email delivery error:', error.message || error);
        // Don't throw if we want the rest of the flow (like registration) to succeed even if email fails, 
        // OR throw to ensure users know their action wasn't fully completed.
        // For activation/reset, we usually want to know if it failed.
        throw new Error('Failed to send email. Please check your SMTP configuration.');
    }
};

/**
 * Robust templates for different verification types
 */
export const getActivationTemplate = (firstName: string, code: string) => {
    const activationLink = `${APP_URL}/activate?code=${code}`;
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #00d084;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Welcome to DollarToGo!</h2>
            <p style="color: #475569; line-height: 1.6;">Hi ${firstName},</p>
            <p style="color: #475569; line-height: 1.6;">Your account has been created. Please click the button below to activate your account and start your journey with us.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${activationLink}" style="background-color: #00d084; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Activate Account</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">Alternatively, copy and paste this link in your browser:</p>
            <p style="color: #0070f3; font-size: 12px; word-break: break-all;">${activationLink}</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">If you did not create this account, you can safely ignore this email.</p>
        </div>
    `;
};

export const getOTPTemplate = (firstName: string, otp: string) => {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #6366f1;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Verification Code</h2>
            <p style="color: #475569; line-height: 1.6;">Hi ${firstName},</p>
            <p style="color: #475569; line-height: 1.6;">Use the following code to verify your action on DollarToGo. This code will expire in 10 minutes.</p>
            <div style="text-align: center; margin: 32px 0;">
                <div style="background-color: #f8fafc; border: 2px dashed #6366f1; color: #6366f1; padding: 16px; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 8px;">
                    ${otp}
                </div>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">If you did not request this code, please secure your account.</p>
        </div>
    `;
};

export const getPasswordResetTemplate = (firstName: string, code: string) => {
    const resetLink = `${APP_URL}/reset-password?code=${code}`;
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; border-top: 4px solid #ef4444;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #475569; line-height: 1.6;">Hi ${firstName},</p>
            <p style="color: #475569; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one. This link will expire in 30 minutes.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
    `;
};
