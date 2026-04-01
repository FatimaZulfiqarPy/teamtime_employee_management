const Attendance = require('../models/Attendance');

// Time In
// SIMPLE: Just record when employee starts work
const timeIn = async (req, res) => {
    try {
        const { userId } = req.body; // Get user ID from login
        
        // Get today's date (just the date part)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if already recorded today
        const existing = await Attendance.findOne({ 
            user: userId, 
            date: today 
        });
        
        if (existing) {
            return res.json({ message: "Already clocked in today" });
        }
        
        // Save time in
        const attendance = new Attendance({
            user: userId,
            date: today,
            timeIn: new Date().toLocaleTimeString(),
            status: "present"
        });
        
        await attendance.save();
        
        res.json({ 
            message: "✅ Time In recorded", 
            timeIn: attendance.timeIn 
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Time Out
// SIMPLE: Record when employee leaves and calculate hours
const timeOut = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find today's record
        const attendance = await Attendance.findOne({ 
            user: userId, 
            date: today 
        });
        
        if (!attendance) {
            return res.json({ message: "Please Time In first" });
        }
        
        // Simple hours calculation
        const timeOut = new Date().toLocaleTimeString();
        attendance.timeOut = timeOut;
        
        // Calculate hours (basic version)
        const inHour = parseInt(attendance.timeIn.split(':')[0]);
        const outHour = parseInt(timeOut.split(':')[0]);
        attendance.totalHours = outHour - inHour;
        
        await attendance.save();
        
        res.json({ 
            message: "✅ Time Out recorded", 
            hours: attendance.totalHours 
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SIMPLE: Get all records for logged in user
const getMyAttendance = async (req, res) => {
    try {
        const { userId } = req.query;
        
        const records = await Attendance.find({ user: userId })
            .sort({ date: -1 }) // Newest first
            .limit(30); // Last 30 days only
        
        res.json(records);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SIMPLE: Admin can see everyone
const getAllAttendance = async (req, res) => {
    try {
        const { from, to } = req.query;
        
        let query = {};
        if (from && to) {
            query.date = { 
                $gte: new Date(from), 
                $lte: new Date(to) 
            };
        }
        
        const records = await Attendance.find(query)
            .populate('user', 'name email') // Get user details
            .sort({ date: -1 });
        
        res.json(records);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    timeIn,
    timeOut,
    getMyAttendance,
    getAllAttendance
};