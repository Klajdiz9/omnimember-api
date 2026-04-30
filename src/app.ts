import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import subscriptionRoutes from './routes/subscriptions';
import checkinRoutes from './routes/checkins';
import { initWebSocket } from './websocket/checkin.gateway';

import path from 'path';

const app = express();
const server = createServer(app);

// EJS Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static Files
app.use(express.static(path.join(__dirname, '../public')));

import dashboardRoutes from './routes/dashboard';
import brandRoutes from './routes/brands';

app.use(cors());
app.use(express.json());

// View Routes
app.use('/dashboard', dashboardRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/brands', brandRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'OmniMember API Hub is running! 🚀',
    docs: 'Available endpoints: /api/auth, /api/members, /api/subscriptions, /api/checkins',
    websocket: 'ws://localhost:3005/ws?token=<JWT>'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Initialize WebSocket Server
initWebSocket(server);

const PORT = process.env.PORT || 3005;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default server;
