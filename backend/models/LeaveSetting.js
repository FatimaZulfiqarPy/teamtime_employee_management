const mongoose = require('mongoose');

const leaveSettingSchema = new mongoose.Schema({
    annual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    casual: { type: Number, default: 5 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    year: { type: Number, default: new Date().getFullYear() }
}, { timestamps: true });

module.exports = mongoose.model('LeaveSetting', leaveSettingSchema);