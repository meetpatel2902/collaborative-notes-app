const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // પાસવર્ડ હેશ કરવા માટે

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: { // ભૂમિકાઓ: "Admin" અને "User" [cite: 2]
        type: String,
        enum: ['User', 'Admin'],
        default: 'User',
    },
}, {
    timestamps: true, // createdAt અને updatedAt ફિલ્ડ્સ આપમેળે ઉમેરે છે
});

// પાસવર્ડ સેવ કરતા પહેલા હેશ કરવા માટે pre-save મિડલવેર
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // જો પાસવર્ડ મોડિફાઈ ન થયો હોય તો આગળ વધો
        next();
    }
    const salt = await bcrypt.genSalt(10); // Salt જનરેટ કરો
    this.password = await bcrypt.hash(this.password, salt); // પાસવર્ડ હેશ કરો
});

// યુઝર ઇનપુટ પાસવર્ડને હેશ કરેલા પાસવર્ડ સાથે મેચ કરવા માટે મેથડ
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;