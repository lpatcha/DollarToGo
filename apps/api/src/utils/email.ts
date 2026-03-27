// Using direct API call to Brevo to avoid buggy SDK constructor issues
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const SMTP_USER = process.env.SMTP_USER || 'no-reply@dollartogo.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);
        
        if (!BREVO_API_KEY) {
            console.warn('\n⚠️  EMAIL NOT SENT: Missing BREVO_API_KEY environment variable.');
            return;
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "DollarToGo", email: SMTP_USER },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            })
        });

        console.log(`📡 Brevo API Response Status: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('❌ Brevo API Error Detail:', JSON.stringify(errorBody));
            throw new Error(errorBody.message || `Brevo API error: ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ Email accepted by Brevo! Message ID: ${result.messageId}`);
    } catch (error: any) {
        console.error('❌ Brevo delivery error:', error.message || error);
        throw new Error('Failed to send email. Please check your Brevo configuration.');
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
