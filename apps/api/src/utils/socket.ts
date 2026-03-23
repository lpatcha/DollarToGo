import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from './jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // Adjust this in production
            methods: ["GET", "POST"]
        }
    });

    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return next(new Error('Authentication error: Invalid token'));
            }

            // Attach user data to socket
            (socket as any).userId = decoded.userId;
            (socket as any).role = decoded.role;
            
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket: Socket) => {
        const userId = (socket as any).userId;
        const role = (socket as any).role;

        console.log(`[Socket] User connected: ${userId} (${role})`);

        // Join private user room
        socket.join(`user:${userId}`);

        // If driver, join zip code rooms
        if (role === 'DRIVER') {
            try {
                const profile = await prisma.driverProfile.findUnique({
                    where: { userId }
                });

                if (profile && profile.serviceZipCodes) {
                    const zips = profile.serviceZipCodes.split(',').map(z => z.trim());
                    zips.forEach(zip => {
                        if (zip) {
                            socket.join(`zip:${zip}`);
                            console.log(`[Socket] Driver ${userId} joined room: zip:${zip}`);
                        }
                    });
                }
            } catch (error) {
                console.error('[Socket] Error joining driver to zip rooms:', error);
            }
        }

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${userId}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Helper to emit to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

// Helper to emit to a zip code
export const emitToZip = (zip: string, event: string, data: any) => {
    if (io) {
        io.to(`zip:${zip}`).emit(event, data);
    }
};
