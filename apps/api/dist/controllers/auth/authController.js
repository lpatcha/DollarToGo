"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.logout = exports.register = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const email_1 = require("../../utils/email");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
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
        const passwordHash = await (0, password_1.hashPassword)(password);
        const userRole = role === 'DRIVER' ? client_1.Role.DRIVER : client_1.Role.USER;
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
                },
            });
            // If registering as a DRIVER, create the profile immediately
            if (userRole === client_1.Role.DRIVER) {
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
            return newUser;
        });
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.register = register;
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = (0, jwt_1.verifyToken)(token);
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
    }
    catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error (e.g., token already blacklisted), we treat logout as success
        res.status(200).json({ message: 'Logged out successfully' });
    }
};
exports.logout = logout;
const login = async (req, res) => {
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
        const isMatch = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Act as if it succeeded to prevent email enumeration attacks
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
            return;
        }
        // Generate a secure unique token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetCode: resetToken,
                resetCodeExpiresAt: expiresAt,
            },
        });
        // In a real application, you'd use your actual frontend URL, e.g., from an environment variable:
        // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `http://localhost:3000/auth/reset-password?code=${resetToken}`;
        const subject = 'Password Reset Request';
        const text = `Hi ${user.firstName},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
        await (0, email_1.sendEmail)(user.email, subject, text);
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { code, newPassword } = req.body;
        if (!code || !newPassword) {
            res.status(400).json({ message: 'Missing required fields (code, newPassword)' });
            return;
        }
        const user = await prisma.user.findFirst({
            where: {
                resetCode: code,
                resetCodeExpiresAt: {
                    gt: new Date(), // Code must not be expired
                },
            },
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetCode: null,
                resetCodeExpiresAt: null,
            },
        });
        res.status(200).json({ message: 'Password has been successfully reset' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
