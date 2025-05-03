import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the routes index
import apiRoutes from './routes/index';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Basic route

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('Client connected');

    // Listen for task status changes and broadcast to all clients
    socket.on('task:statusChange', (data) => {
        io.emit('task:statusUpdated', data);
    });

    // Project updates
    socket.on('project:update', (data) => {
        io.emit('project:updated', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});