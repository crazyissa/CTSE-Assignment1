import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import deliveryRoutes from './routes/deliveryRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { setupSocket } from './socket.js';

dotenv.config();

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

const app = express();
const server = http.createServer(app);

// CORS — allow both local dev and Docker frontend
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/deliveries', deliveryRoutes);

// Error Handler
app.use(errorHandler);

// Initialize WebSocket Server (single instance — passed to setupSocket)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Setup WebSocket events using the shared io instance
setupSocket(io);

// Start Server
const PORT = process.env.PORT || 5006;
server.listen(PORT, () => {
  console.log(`🚀 Delivery Service running with WebSocket on port ${PORT}`);
});
