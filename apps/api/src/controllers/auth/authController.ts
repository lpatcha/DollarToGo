import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';

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
                },
            });

            if (userRole === Role.DRIVER && driverDetails) {
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

        const token = generateToken({ userId: user.id, role: user.role });
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
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
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
