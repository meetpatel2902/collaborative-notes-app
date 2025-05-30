const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: [
        process.env.FRONTEND_URL,
        'https://collaborative-notes-3d6sjiqm0-meetpatel2902s-projects.vercel.app' 
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);

const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            'https://collaborative-notes-3d6sjiqm0-meetpatel2902s-projects.vercel.app',
            'https://collaborative-notes-oi9a5wvv8-meetpatel2902s-projects.vercel.app' 
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('start_editing', ({ noteId, userId, userName }) => {
        socket.join(noteId);
        socket.to(noteId).emit('user_editing', { noteId, userId, userName });
    });

    socket.on('note_content_change', ({ noteId, content }) => {
        socket.to(noteId).emit('update_note_content', { noteId, content });
    });

    socket.on('stop_editing', ({ noteId, userId }) => {
        socket.leave(noteId);
        socket.to(noteId).emit('user_stopped_editing', { noteId, userId });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));