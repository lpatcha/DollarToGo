"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const client_1 = require("@prisma/client");
const socket_1 = require("./utils/socket");
const authRoutes_1 = __importDefault(require("./routes/auth/authRoutes"));
const rideRoutes_1 = __importDefault(require("./routes/user/rideRoutes"));
const driverRoutes_1 = __importDefault(require("./routes/driver/driverRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/user/profileRoutes"));
const profileRoutes_2 = __importDefault(require("./routes/driver/profileRoutes"));
const ratingRoutes_1 = __importDefault(require("./routes/rating/ratingRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 4000;
// Initialize Socket.io
(0, socket_1.initSocket)(httpServer);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'DollarToGo API is running' });
});
// Basic routing structure matching the architecture plan
const apiRouter = express_1.default.Router();
apiRouter.use('/auth', authRoutes_1.default);
apiRouter.use('/rides', rideRoutes_1.default);
apiRouter.use('/driver/profile', profileRoutes_2.default);
apiRouter.use('/driver', driverRoutes_1.default);
apiRouter.use('/admin', (req, res) => res.json({ message: 'Admin routes placeholder' }));
apiRouter.use('/rating', ratingRoutes_1.default);
apiRouter.use('/users/profile', profileRoutes_1.default);
app.use('/api', apiRouter);
httpServer.listen(port, () => {
    console.log(`🚀 API server is running on http://localhost:${port}`);
});
