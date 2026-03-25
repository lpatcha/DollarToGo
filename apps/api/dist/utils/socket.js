"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToZip = exports.emitToUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("./jwt");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
            const decoded = (0, jwt_1.verifyToken)(token);
            if (!decoded) {
                return next(new Error('Authentication error: Invalid token'));
            }
            // Attach user data to socket
            socket.userId = decoded.userId;
            socket.role = decoded.role;
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', async (socket) => {
        const userId = socket.userId;
        const role = socket.role;
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
            }
            catch (error) {
                console.error('[Socket] Error joining driver to zip rooms:', error);
            }
        }
        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${userId}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
// Helper to emit to a specific user
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
// Helper to emit to a zip code
const emitToZip = (zip, event, data) => {
    if (io) {
        io.to(`zip:${zip}`).emit(event, data);
    }
};
exports.emitToZip = emitToZip;
