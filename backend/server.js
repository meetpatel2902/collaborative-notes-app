require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/User');

const app = express();
const server = http.createServer(app); 
const io = new Server(server, { 
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB database connection established successfully');
        createAdminUser();
    })
    .catch(err => console.error('MongoDB connection error:', err));

const createAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ role: 'Admin' });
        if (!adminExists) {
            const defaultAdmin = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: 'adminpassword123',
                role: 'Admin'
            });
            await defaultAdmin.save();
            console.log('Default admin user created successfully!');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error creating default admin user:', error.message);
    }
};

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('MERN Notes App Backend is running!');
});


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

   
    socket.on('start_editing', (noteId, username) => {
        socket.join(noteId); 
        io.to(noteId).emit('user_editing', noteId, username); 
        console.log(`${username} started editing note: ${noteId}`);
    });

    
    socket.on('note_content_change', (noteId, newContent) => {
        socket.to(noteId).emit('update_note_content', noteId, newContent);
    });

    
    socket.on('stop_editing', (noteId, username) => {
        socket.leave(noteId); 
        io.to(noteId).emit('user_stopped_editing', noteId, username); 
        console.log(`${username} stopped editing note: ${noteId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => { 
    console.log(`Server is running on port: ${PORT}`);
    console.log(`Socket.IO is listening on port: ${PORT}`);
});