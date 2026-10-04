"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const notificationService_1 = require("./services/notificationService");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Initialize Socket.IO with CORS
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [env_1.env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
    },
});
(0, notificationService_1.setSocketIO)(io);
// Socket.IO Connection Handler
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(`user:${userId}`);
    }
    socket.on('join_user', (uid) => {
        socket.join(`user:${uid}`);
    });
});
// Security & Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: [env_1.env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use(errorHandler_1.requestIdMiddleware);
app.use(rateLimiter_1.generalLimiter);
// Structured Morgan Logger (Sanitized: never logs authorization headers or cookies)
app.use((0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms [ReqId: :req[x-request-id]]'));
// API Routes
app.use('/api', routes_1.default);
// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'Unified Student Placement System (USPS) API',
        version: '1.0.0',
        status: 'ACTIVE',
        documentation: '/api/health',
    });
});
// Centralized Error Handling
app.use(errorHandler_1.errorHandler);
const PORT = env_1.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`\n========================================================`);
        console.log(`🚀 USPS Backend Server running on http://localhost:${PORT}`);
        console.log(`🏛️  Platform: Unified Student Placement System (USPS)`);
        console.log(`🛡️  Security: Helmet, CORS, Rate-Limiting, Strict RBAC Active`);
        console.log(`⚡ Supabase PostgreSQL / Realtime Integration: READY`);
        console.log(`========================================================\n`);
    });
}
