import { PrismaClient, VerificationType } from '@prisma/client';
import crypto from 'crypto';

/**
 * Reusable utility to clear all verification tokens for a specific user.
 * Best used during account activation or password resets to ensure a "clean state."
 */
export const clearUserTokens = (prisma: any, userId: string) => {
    return prisma.verificationToken.deleteMany({
        where: { userId }
    });
};

/**
 * Reusable utility to generate a new verification token.
 * Automatically clears existing tokens of the same type for the user first.
 * @param length Defaults to 32 for links. Use 6 for numeric OTPs.
 * @param expiryMinutes Defaults to 1440 (24 hours).
 */
export const generateVerificationToken = async (
    prisma: any, 
    userId: string, 
    type: VerificationType, 
    length = 32, 
    expiryMinutes = 1440
) => {
    // 1. Clear any existing tokens of the same type to avoid confusion
    await prisma.verificationToken.deleteMany({
        where: { userId, type }
    });

    // 2. Generate random string (hex for link, numeric for OTP)
    let token = '';
    if (length === 6) {
        token = Math.floor(100000 + Math.random() * 900000).toString();
    } else {
        token = crypto.randomBytes(length / 2).toString('hex');
    }

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // 3. Save and return the new token
    return await prisma.verificationToken.create({
        data: {
            userId,
            token,
            type,
            expiresAt,
        }
    });
};
