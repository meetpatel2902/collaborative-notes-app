import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import noteService from '../services/noteService';
import { useAuth } from '../hooks/useAuth';

// Socket.IO ક્લાયંટને બેકએન્ડ URL સાથે કનેક્ટ કરો
const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

const NoteEditorPage = () => {
    const { id: noteId } = useParams(); // URL માંથી નોટ ID મેળવો
    const navigate = useNavigate();
    const { user } = useAuth(); // પ્રમાણિત યુઝર ડેટા મેળવો

    const [note, setNote] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [editingLocked, setEditingLocked] = useState(false); // શું નોટ લોક થયેલી છે
    const [lockedByOther, setLockedByOther] = useState(null); // કોના દ્વારા લોક થયેલી છે (અન્ય યુઝર)
    const [currentEditors, setCurrentEditors] = useState([]); // નોટ પર હાલમાં કોણ છે
    const [saveStatus, setSaveStatus] = useState(''); // સેવિંગ સ્ટેટસ

    // રીઅલ-ટાઇમ અપડેટ્સ માટે ref નો ઉપયોગ કરો જેથી સ્ટેટ અપડેટ કર્યા વિના સોકેટ ઇવેન્ટ મોકલી શકાય
    const contentRef = useRef('');
    const titleRef = useRef('');
    const tagsRef = useRef([]);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const fetchedNote = await noteService.getNoteById(noteId);
                setNote(fetchedNote);
                setTitle(fetchedNote.title);
                setContent(fetchedNote.content);
                setTags(fetchedNote.tags || []);
                contentRef.current = fetchedNote.content;
                titleRef.current = fetchedNote.title;
                tagsRef.current = fetchedNote.tags || [];

                // જો નોટ પહેલાથી લોક હોય તો UI અપડેટ કરો
                if (fetchedNote.lockedBy && fetchedNote.lockedBy !== user._id) {
                    setEditingLocked(true);
                    // બેકએન્ડને લોક કરનારનું નામ પૂછવા માટે કૉલ કરવો પડી શકે છે
                    // અથવા તેને Socket.IO ઇવેન્ટ દ્વારા મેળવો
                } else {
                    setEditingLocked(false);
                }

            } catch (error) {
                console.error('Error fetching note:', error);
                alert('Failed to load note. It might not exist or you do not have access.');
                navigate('/'); // નોટ ન મળે તો ડેશબોર્ડ પર રીડાયરેક્ટ કરો
            }
        };

        fetchNote();

        // Socket.IO ઇવેન્ટ લિસનર્સ
        if (user) {
            socket.emit('joinNote', { noteId, userId: user._id, username: user.username });
        }

        socket.on('noteUpdated', (updatedNote) => {
            if (updatedNote._id === noteId) {
                setNote(updatedNote);
                setTitle(updatedNote.title);
                setContent(updatedNote.content);
                setTags(updatedNote.tags || []);
                contentRef.current = updatedNote.content;
                titleRef.current = updatedNote.title;
                tagsRef.current = updatedNote.tags || [];
                setSaveStatus('Saved!');
                setTimeout(() => setSaveStatus(''), 1000); // 1 સેકન્ડ પછી સ્ટેટસ સાફ કરો
            }
        });

        socket.on('noteLocked', ({ noteId: lockedNoteId, userId: lockerId, username: lockerUsername }) => {
            if (lockedNoteId === noteId) {
                if (lockerId === user._id) {
                    setEditingLocked(false); // હું લોક કરનાર છું
                    setLockedByOther(null);
                } else {
                    setEditingLocked(true); // કોઈ અન્ય લોક કરનાર છે
                    setLockedByOther(lockerUsername);
                }
            }
        });

        socket.on('noteUnlocked', ({ noteId: unlockedNoteId }) => {
            if (unlockedNoteId === noteId) {
                setEditingLocked(false);
                setLockedByOther(null);
            }
        });

        socket.on('noteLockedByOther', ({ noteId: lockedNoteId, lockedBy }) => {
            if (lockedNoteId === noteId) {
                setEditingLocked(true);
                setLockedByOther(lockedBy);
                // alert(`Note is currently being edited by ${lockedBy}. Your edits are disabled.`);
            }
        });

        socket.on('currentEditorsUpdate', ({ noteId: editorNoteId, editors }) => {
            if (editorNoteId === noteId) {
                // ફક્ત અન્ય એડિટર્સને દર્શાવો
                setCurrentEditors(editors.filter(editor => editor !== user.username));
            }
        });

        // કમ્પોનન્ટ અનમાઉન્ટ થાય ત્યારે ક્લિનઅપ કરો
        return () => {
            if (user) {
                socket.emit('leaveNote', { noteId, userId: user._id, username: user.username });
                socket.emit('stopEditing', { noteId, userId: user._id }); // લોક છોડો
            }
            socket.off('noteUpdated');
            socket.off('noteLocked');
            socket.off('noteUnlocked');
            socket.off('noteLockedByOther');
            socket.off('currentEditorsUpdate');
        };
    }, [noteId, user, navigate]); // dependency array

    // ઇનપુટ ફિલ્ડ્સમાં ફેરફાર હેન્ડલ કરો
    const handleChange = (e, field) => {
        const value = e.target.value;
        if (field === 'title') {
            setTitle(value);
            titleRef.current = value;
        } else if (field === 'content') {
            setContent(value);
            contentRef.current = value;
        } else if (field === 'tags') {
            const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            setTags(newTags);
            tagsRef.current = newTags;
        }

        // જો લોક ન હોય અને યુઝર હાજર હોય તો જ સોકેટ ઇવેન્ટ મોકલો
        if (!editingLocked && user) {
            socket.emit('startEditing', { noteId, userId: user._id, username: user.username });
            socket.emit('noteContentChange', {
                noteId,
                newTitle: titleRef.current,
                newContent: contentRef.current,
                newTags: tagsRef.current,
                userId: user._id // યુઝર ID પણ મોકલો જેથી બેકએન્ડ ચેક કરી શકે કે યુઝર પાસે લોક છે
            });
        }
    };

    // જ્યારે યુઝર ઇનપુટ પર ફોકસ કરે ત્યારે એડિટિંગ શરૂ કરો
    const handleFocus = () => {
        if (user) {
            socket.emit('startEditing', { noteId, userId: user._id, username: user.username });
        }
    };

    // જ્યારે યુઝર ઇનપુટ પરથી ફોકસ હટાવે ત્યારે એડિટિંગ બંધ કરો
    const handleBlur = () => {
        if (user) {
            socket.emit('stopEditing', { noteId, userId: user._id });
        }
    };


    if (!note) {
        return <div className="text-center mt-8">Loading note...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Edit Note</h1>
            {saveStatus && <p className="text-green-500 mb-2">{saveStatus}</p>}
            {editingLocked && lockedByOther && (
                <p className="text-red-500 mb-2">
                    <strong className="font-semibold">{lockedByOther}</strong> is currently editing this note. Your edits are disabled.
                </p>
            )}
            {currentEditors.length > 0 && (
                <p className="text-blue-500 mb-2">
                    Other users viewing/editing: {currentEditors.join(', ')}
                </p>
            )}

            <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                <input
                    type="text"
                    id="title"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={title}
                    onChange={(e) => handleChange(e, 'title')}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={editingLocked}
                    maxLength={100}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
                <textarea
                    id="content"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-64"
                    value={content}
                    onChange={(e) => handleChange(e, 'content')}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={editingLocked}
                    maxLength={1000}
                ></textarea>
            </div>
            <div className="mb-4">
                <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">Tags (comma-separated):</label>
                <input
                    type="text"
                    id="tags"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={tags.join(', ')}
                    onChange={(e) => handleChange(e, 'tags')}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={editingLocked}
                />
            </div>
        </div>
    );
};

export default NoteEditorPage;