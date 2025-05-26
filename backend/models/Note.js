const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    user: { // કયા યુઝરની નોંધ છે તેનો સંદર્ભ
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // 'User' મોડેલનો સંદર્ભ
    },
    title: { // શીર્ષક (સ્ટ્રિંગ, મહત્તમ 100 અક્ષરો, જરૂરી) [cite: 4]
        type: String,
        required: true,
        maxlength: 100,
    },
    content: { // સામગ્રી (સ્ટ્રિંગ, મહત્તમ 1000 અક્ષરો, જરૂરી) [cite: 4]
        type: String,
        required: true,
        maxlength: 1000,
    },
    tags: [{ // ટૅગ્સ (સ્ટ્રિંગ્સનો એરે, વૈકલ્પિક) [cite: 4]
        type: String,
    }],
    // રીઅલ-ટાઇમ સહયોગ માટે [cite: 6]
    currentEditors: [{ // કયા યુઝર્સ હાલમાં નોટ જોઈ રહ્યા છે/એડિટ કરી રહ્યા છે
        type: String, // યુઝરનું username સ્ટોર કરો
    }],
    lockedBy: { // નોટ કોના દ્વારા લોક થયેલી છે
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    lockedAt: { // લોક ક્યારે કરવામાં આવ્યું હતું
        type: Date,
        default: null,
    },
}, {
    timestamps: true, // createdAt અને updatedAt ફિલ્ડ્સ આપમેળે ઉમેરે છે [cite: 4]
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;