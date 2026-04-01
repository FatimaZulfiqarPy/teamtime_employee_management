const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    head: {
        type: String,
        required: true
    },
    employees: {
        type: Number,
        default: 0
    },
    projects: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: "from-indigo-500 to-indigo-600"
    },
    bgColor: {
        type: String,
        default: "bg-indigo-50"
    },
    textColor: {
        type: String,
        default: "text-indigo-600"
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);