const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ========== SIGNUP FIELDS (User fills) ==========
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // ========== ROLE & WORK (Admin assigns / Auto) ==========
    role: { type: String, default: 'employee' }, // 'employee' or 'admin'
    department: { type: String, default: 'Not Assigned' },
    employeeId: { type: String, unique: true, sparse: true }, // Auto-generated
    joinDate: { type: Date, default: Date.now }, // Auto-set
    
    // ========== PROFILE FIELDS (User edits later) ==========
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    profilePicture: { type: String, default: '' }
    
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);