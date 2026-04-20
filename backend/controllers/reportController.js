const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Get monthly report
// @route   GET /api/reports/monthly
const getMonthlyReport = async (req, res) => {
    try {
        const { year, month, userId } = req.query;
        
        // Create date range
        const startDate = new Date(year, month-1, 1);
        const endDate = new Date(year, month, 0);
        
        // Get attendance for the month
        const attendance = await Attendance.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        }).populate('user', 'name email');
        
        // Get leaves for the month
        const leaves = await Leave.find({
            user: userId,
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
        }).populate('user', 'name email');
        
        // Calculate totals
        const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
        const presentDays = attendance.filter(a => a.status === 'present').length;
        
        // Get user info
        const user = await User.findById(userId).select('name email department');
        
        return res.json({
            user,
            period: { year, month },
            summary: {
                totalDays: attendance.length,
                presentDays,
                absentDays: attendance.filter(a => a.status === 'absent').length,
                totalHours,
                averageHours: attendance.length ? (totalHours / attendance.length).toFixed(1) : 0
            },
            attendance,
            leaves: leaves.filter(l => l.status === 'approved')
        });
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getMonthlyReport };