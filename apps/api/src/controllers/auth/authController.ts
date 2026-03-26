import { Request, Response } from 'express';
import { PrismaClient, Role, VerificationType } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken, verifyToken } from '../../utils/jwt';
import { sendEmail, getActivationTemplate, getOTPTemplate, getPasswordResetTemplate } from '../../utils/email';
import { generateVerificationToken, clearUserTokens } from '../../utils/tokenUtils';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role, firstName, lastName, phone, zipCode, city, driverDetails } = req.body;

        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }

        const passwordHash = await hashPassword(password);
        const userRole = role === 'DRIVER' ? Role.DRIVER : Role.USER;

        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    role: userRole,
                    firstName,
                    lastName,
                    phone,
                    zipCode,
                    city,
                    isActive: false, // Default to inactive
                },
            });

            // Create Driver Profile if necessary
            if (userRole === Role.DRIVER) {
                if (!driverDetails) {
                    throw new Error('Driver details are required when registering as a driver');
                }
                await tx.driverProfile.create({
                    data: {
                        userId: newUser.id,
                        licenseNumber: driverDetails.licenseNumber,
                        vehicleMake: driverDetails.vehicleMake,
                        vehicleModel: driverDetails.vehicleModel,
                        vehicleYear: driverDetails.vehicleYear,
                        vehicleColor: driverDetails.vehicleColor,
                        licensePlate: driverDetails.licensePlate,
                        serviceZipCodes: driverDetails.serviceZipCodes || zipCode || '',
                    },
                });
            }

            // Generate activation code via reusable utility
            const tokenRecord = await generateVerificationToken(
                tx, 
                newUser.id, 
                VerificationType.ACCOUNT_ACTIVATION
            );

            return { newUser, activationToken: tokenRecord.token };
        });

        // Send activation email
        try {
            const html = getActivationTemplate(firstName, user.activationToken);
            await sendEmail(email, 'Activate Your DollarToGo Account', html);
        } catch (mailError) {
            console.error('Failed to send activation email:', mailError);
            // We don't fail registration if mail fails, but we might want to log it
        }

        res.status(201).json({
            message: 'Your account has been created. Please check your email and activate your account through the link sent to your mail id.',
            email: user.newUser.email
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const activateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;

        if (!code) {
            res.status(400).json({ message: 'Activation code is required' });
            return;
        }

        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                token: code,
                type: VerificationType.ACCOUNT_ACTIVATION,
                expiresAt: { gt: new Date() }
            }
        });

        if (!verificationToken) {
            res.status(400).json({ message: 'Invalid or expired activation code' });
            return;
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: verificationToken.userId },
                data: { isActive: true }
            }),
            // Use reusable helper to clear ALL tokens for this user
            clearUserTokens(prisma, verificationToken.userId)
        ]);

        res.status(200).json({ message: 'Account activated successfully. You can now log in.' });
    } catch (error) {
        console.error('Account activation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            
            if (decoded.exp) {
                await prisma.blacklistedToken.create({
                    data: {
                        token,
                        expiresAt: new Date(decoded.exp * 1000)
                    }
                });
            }
        }
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error (e.g., token already blacklisted), we treat logout as success
        res.status(200).json({ message: 'Logged out successfully' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({ 
                message: 'Account not activated. Please check your email for the activation link.',
                email: user.email,
                requiresActivation: true
            });
            return;
        }

        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken({ userId: user.id, role: user.role });
        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Anti-enumeration: act successful
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
            return;
        }

        // Clear ALL existing tokens (Activation, OTPs, etc.) for a fresh, secure state
        await clearUserTokens(prisma, user.id);

        // Generate a secure reset token via reusable utility
        const tokenRecord = await generateVerificationToken(
            prisma,
            user.id,
            VerificationType.PASSWORD_RESET,
            32, // Length
            30  // 30 minute expiry
        );

        // Send reset email with robust template
        try {
            const html = getPasswordResetTemplate(user.firstName, tokenRecord.token);
            await sendEmail(user.email, 'Password Reset Request', html);
        } catch (mailError) {
            console.error('Forgot password mail error:', mailError);
        }

        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, newPassword } = req.body;

        if (!code || !newPassword) {
            res.status(400).json({ message: 'Missing required fields (code, newPassword)' });
            return;
        }

        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                token: code,
                type: VerificationType.PASSWORD_RESET,
                expiresAt: { gt: new Date() }
            }
        });

        if (!verificationToken) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }

        const passwordHash = await hashPassword(newPassword);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: verificationToken.userId },
                data: { passwordHash }
            }),
            // Use reusable helper to clear ALL tokens for this user
            clearUserTokens(prisma, verificationToken.userId)
        ]);

        res.status(200).json({ message: 'Password has been successfully reset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resendActivation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Anti-enumeration: act successful
            res.status(200).json({ message: 'If an account exists, a new activation link has been sent.' });
            return;
        }

        if (user.isActive) {
            res.status(400).json({ message: 'This account is already active. Please log in.' });
            return;
        }

        // Generate activation code via reusable utility
        const tokenRecord = await generateVerificationToken(
            prisma, 
            user.id, 
            VerificationType.ACCOUNT_ACTIVATION
        );

        // Send activation email
        try {
            const html = getActivationTemplate(user.firstName, tokenRecord.token);
            await sendEmail(user.email, 'Activate Your DollarToGo Account (New Link)', html);
        } catch (mailError) {
            console.error('Failed to send resend activation email:', mailError);
        }

        res.status(200).json({ message: 'A new activation link has been sent to your email.' });
    } catch (error) {
        console.error('Resend activation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
