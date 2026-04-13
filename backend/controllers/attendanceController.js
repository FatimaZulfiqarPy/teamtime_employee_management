const Attendance = require('../models/Attendance');

// Time In
const timeIn = async (req, res) => {
    try {
        const { userId } = req.body;

        // Get today's date (just the date part)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already recorded today
        let attendance = await Attendance.findOne({
            user: userId,
            date: today
        });

        // ✅ If record exists and timeOut is null, don't allow new time-in
        if (attendance && attendance.timeIn && !attendance.timeOut) {
            return res.status(400).json({
                message: "You are already clocked in! Please Time Out first."
            });
        }

        // ✅ If record exists and has timeOut, update it (next day or new session)
        if (attendance && attendance.timeOut) {
            attendance.timeIn = new Date().toLocaleTimeString();
            attendance.timeOut = null;
            attendance.totalHours = 0;
            await attendance.save();

            return res.json({
                message: "✅ Time In recorded (new session)",
                timeIn: attendance.timeIn
            });
        }

        // ✅ No record exists for today - create new one
        attendance = new Attendance({
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
            return res.status(400).json({ message: "Please Time In first" });
        }

        if (attendance.timeOut) {
            return res.status(400).json({ message: "You already clocked out today" });
        }

        const timeOutStr = new Date().toLocaleTimeString();
        attendance.timeOut = timeOutStr;
        
        // Calculate hours properly
        const parseTime = (timeStr) => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return { hours, minutes };
        };
        
        const inTime = parseTime(attendance.timeIn);
        const outTime = parseTime(timeOutStr);
        
        const inTotal = inTime.hours * 60 + inTime.minutes;
        const outTotal = outTime.hours * 60 + outTime.minutes;
        
        let diff = outTotal - inTotal;
        if (diff < 0) diff += 24 * 60;
        
        attendance.totalHours = diff / 60;
        
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