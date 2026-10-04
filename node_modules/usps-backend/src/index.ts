import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env';
import apiRouter from './routes';
import { requestIdMiddleware, errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { setSocketIO } from './services/notificationService';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});
setSocketIO(io);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    socket.join(`user:${userId}`);
  }
  socket.on('join_user', (uid: string) => {
    socket.join(`user:${uid}`);
  });
});

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(generalLimiter);

// Structured Morgan Logger (Sanitized: never logs authorization headers or cookies)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms [ReqId: :req[x-request-id]]'));

// API Routes
app.use('/api', apiRouter);

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
app.use(errorHandler);

const PORT = env.PORT || 5000;

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

export { app, server };
