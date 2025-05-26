require('dotenv').config(); // .env ફાઇલમાંથી પર્યાવરણ ચલો લોડ કરો
const express = require('express');
const http = require('http'); // HTTP સર્વર બનાવવા માટે
const socketio = require('socket.io'); // Socket.IO ઇમ્પોર્ટ કરો
const connectDB = require('./config/db'); // ડેટાબેઝ કનેક્શન
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Note = require('./models/Note'); // Socket.IO માં નોટ મોડેલનો ઉપયોગ કરવા માટે
const User = require('./models/User'); // Socket.IO માં યુઝર મોડેલનો ઉપયોગ કરવા માટે

// ડેટાબેઝ સાથે કનેક્ટ કરો
connectDB();

const app = express();
const server = http.createServer(app); // Express એપને HTTP સર્વર સાથે જોડો
const io = socketio(server, { // Socket.IO ને HTTP સર્વર સાથે ઇન્ટિગ્રેટ કરો [cite: 5]
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000', // ફ્રન્ટએન્ડ URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// મિડલવેર
app.use(express.json()); // JSON બોડી પાર્સર
app.use(require('cors')()); // CORS સક્ષમ કરો

// API રાઉટ્સ
app.use('/api/auth', authRoutes); // ઓથેન્ટિકેશન રાઉટ્સ
app.use('/api/notes', noteRoutes); // નોટ મેનેજમેન્ટ રાઉટ્સ
app.use('/api/admin', adminRoutes); // એડમિન રાઉટ્સ

// રીઅલ-ટાઇમ કોલાબોરેશન માટે Socket.IO [cite: 5]
const NOTE_LOCK_TIMEOUT = 10000; // 10 સેકન્ડ નિષ્ક્રિયતા પછી લોક રીલીઝ કરો [cite: 12]
const activeEditingSessions = new Map(); // Map to track timeouts for each user on each note

io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    socket.on('joinNote', async ({ noteId, userId, username }) => {
        socket.join(noteId); // સોકેટને નોટ ID ના રૂમમાં જોડો
        console.log(`${username} joined note ${noteId}`);

        // નોટ માટે વર્તમાન એડિટર્સને અપડેટ કરો
        await Note.findByIdAndUpdate(noteId, { $addToSet: { currentEditors: username } });
        const updatedNote = await Note.findById(noteId);
        io.to(noteId).emit('currentEditorsUpdate', { // બધા કનેક્ટેડ ક્લાયન્ટ્સને અપડેટ મોકલો [cite: 6]
            noteId,
            editors: updatedNote.currentEditors
        });
    });

    socket.on('leaveNote', async ({ noteId, userId, username }) => {
        socket.leave(noteId);
        console.log(`${username} left note ${noteId}`);

        // વર્તમાન એડિટર્સમાંથી યુઝરને દૂર કરો
        await Note.findByIdAndUpdate(noteId, { $pull: { currentEditors: username } });
        const updatedNote = await Note.findById(noteId);
        io.to(noteId).emit('currentEditorsUpdate', {
            noteId,
            editors: updatedNote.currentEditors
        });

        // જો યુઝર નોટ છોડી દે તો કોઈ પણ બાકી રહેલું ટાઈમઆઉટ સાફ કરો
        const sessionKey = `${noteId}-${userId}`;
        if (activeEditingSessions.has(sessionKey)) {
            clearTimeout(activeEditingSessions.get(sessionKey));
            activeEditingSessions.delete(sessionKey);
        }
    });

    socket.on('startEditing', async ({ noteId, userId, username }) => {
        const note = await Note.findById(noteId);

        // જો નોટ પહેલાથી લોક હોય અને મારા દ્વારા લોક ન હોય
        if (note.lockedBy && note.lockedBy.toString() !== userId) {
            const lockTime = new Date(note.lockedAt).getTime();
            const currentTime = new Date().getTime();

            // જો લોક ટાઈમઆઉટ થયું હોય, તો લોક મેળવો
            if ((currentTime - lockTime) > NOTE_LOCK_TIMEOUT) {
                note.lockedBy = userId;
                note.lockedAt = new Date();
                await note.save();
                io.to(noteId).emit('noteLocked', { noteId, userId, username });
                console.log(`Lock re-acquired for note ${noteId} by ${username} (previous lock expired).`);
            } else {
                // અન્ય યુઝર દ્વારા લોક થયેલું છે [cite: 12]
                const lockedByUser = await User.findById(note.lockedBy);
                socket.emit('noteLockedByOther', {
                    noteId,
                    lockedBy: lockedByUser ? lockedByUser.username : 'another user'
                });
                return;
            }
        } else {
            // જો લોક ન હોય અથવા મારા દ્વારા લોક હોય તો લોક મેળવો/અપડેટ કરો
            note.lockedBy = userId;
            note.lockedAt = new Date();
            await note.save();
            io.to(noteId).emit('noteLocked', { noteId, userId, username });
            console.log(`Lock acquired/updated for note ${noteId} by ${username}.`);
        }

        // અગાઉના ટાઈમઆઉટને સાફ કરો અને નવું સેટ કરો
        const sessionKey = `${noteId}-${userId}`;
        if (activeEditingSessions.has(sessionKey)) {
            clearTimeout(activeEditingSessions.get(sessionKey));
        }

        const timeout = setTimeout(async () => {
            const updatedNote = await Note.findById(noteId);
            if (updatedNote && updatedNote.lockedBy && updatedNote.lockedBy.toString() === userId) {
                updatedNote.lockedBy = null;
                updatedNote.lockedAt = null;
                await updatedNote.save();
                io.to(noteId).emit('noteUnlocked', { noteId });
                console.log(`Lock released for note ${noteId} by ${username} due to inactivity.`);
            }
            activeEditingSessions.delete(sessionKey);
        }, NOTE_LOCK_TIMEOUT);
        activeEditingSessions.set(sessionKey, timeout);
    });

    socket.on('stopEditing', async ({ noteId, userId }) => {
        const sessionKey = `${noteId}-${userId}`;
        if (activeEditingSessions.has(sessionKey)) {
            clearTimeout(activeEditingSessions.get(sessionKey)); // ટાઈમઆઉટ સાફ કરો
            activeEditingSessions.delete(sessionKey); // મેપમાંથી દૂર કરો
        }

        const note = await Note.findById(noteId);
        if (note && note.lockedBy && note.lockedBy.toString() === userId) {
            note.lockedBy = null;
            note.lockedAt = null;
            await note.save();
            io.to(noteId).emit('noteUnlocked', { noteId });
            console.log(`Lock explicitly released for note ${noteId} by ${userId}.`);
        }
    });

    socket.on('noteContentChange', async ({ noteId, newContent, newTitle, newTags, userId }) => {
        const note = await Note.findById(noteId);

        if (note && note.lockedBy && note.lockedBy.toString() === userId) {
            // જો યુઝરે લોક મેળવેલું હોય તો જ અપડેટ કરો
            note.content = newContent;
            note.title = newTitle;
            note.tags = newTags;
            note.lastUpdated = new Date(); // આ Mongoose timestamps દ્વારા પણ થાય છે

            const updatedNote = await note.save();
            io.to(noteId).emit('noteUpdated', updatedNote); // રૂમમાં બધાને અપડેટ મોકલો
            console.log(`Note ${noteId} content changed by ${userId}.`);

            // દરેક ફેરફાર પર ટાઈમઆઉટ રીસેટ કરો
            const sessionKey = `${noteId}-${userId}`;
            if (activeEditingSessions.has(sessionKey)) {
                clearTimeout(activeEditingSessions.get(sessionKey));
            }
            const timeout = setTimeout(async () => {
                const checkNote = await Note.findById(noteId);
                if (checkNote && checkNote.lockedBy && checkNote.lockedBy.toString() === userId) {
                    checkNote.lockedBy = null;
                    checkNote.lockedAt = null;
                    await checkNote.save();
                    io.to(noteId).emit('noteUnlocked', { noteId });
                    console.log(`Lock released for note ${noteId} by ${userId} due to inactivity.`);
                }
                activeEditingSessions.delete(sessionKey);
            }, NOTE_LOCK_TIMEOUT);
            activeEditingSessions.set(sessionKey, timeout);

        } else {
            console.log(`Attempt to change note ${noteId} by ${userId} failed: not locked by user.`);
            // જો યુઝર પાસે લોક ન હોય તો તેને રીઅલ-ટાઇમમાં જણાવો કે તે એડિટ કરી શકતો નથી
            socket.emit('noteLockedByOther', {
                noteId,
                lockedBy: (await User.findById(note.lockedBy)).username // જેણે લોક કર્યું છે તેનું નામ
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // યુઝર ડિસ્કનેક્ટ થાય ત્યારે સક્રિય સત્રો અને લોકને સાફ કરો
        activeEditingSessions.forEach(async (timeoutId, sessionKey) => {
            if (sessionKey.includes(socket.id)) { // જો સત્રમાં આ સોકેટ ID હોય
                clearTimeout(timeoutId);
                activeEditingSessions.delete(sessionKey);

                // નોટ લોક છોડો (જો યુઝરે લોક કર્યું હોય તો)
                const [noteId, userId] = sessionKey.split('-');
                const note = await Note.findById(noteId);
                if (note && note.lockedBy && note.lockedBy.toString() === userId) {
                    note.lockedBy = null;
                    note.lockedAt = null;
                    await note.save();
                    io.to(noteId).emit('noteUnlocked', { noteId });
                    console.log(`Lock released for note ${noteId} by disconnected user ${userId}.`);
                }

                // currentEditors માંથી પણ દૂર કરો
                const username = (await User.findById(userId)).username;
                await Note.findByIdAndUpdate(noteId, { $pull: { currentEditors: username } });
                const updatedNote = await Note.findById(noteId);
                if (updatedNote) {
                    io.to(noteId).emit('currentEditorsUpdate', {
                        noteId,
                        editors: updatedNote.currentEditors
                    });
                }
            }
        });
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});