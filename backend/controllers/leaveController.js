const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private (Employee)
const createLeaveRequest = async (req, res) => {
    try {
        const { userId, startDate, endDate, reason, leaveType } = req.body;

        // Basic validation
        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Create leave request
        const leave = await Leave.create({
            user: userId,
            startDate,
            endDate,
            days: diffDays,
            reason,
            leaveType: leaveType || 'annual',
            status: 'pending'
        });

        return res.status(201).json({
            message: '✅ Leave request submitted successfully',
            leave
        });

    } catch (error) {
        console.error('Create leave error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get my leave requests
// @route   GET /api/leaves/me
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
    try {
        const { userId } = req.query;

        const leaves = await Leave.find({ user: userId })
        .populate('user', 'name email department') // 👈 ADD THIS
            .sort({ createdAt: -1 }); // Newest first

        return res.json(leaves);

    } catch (error) {
        console.error('Get my leaves error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves
// @access  Private (Admin only)
const getAllLeaves = async (req, res) => {
    try {
        // Security check: only admin can view all leaves
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin allowed to view all leaves" });
        }        

        // Get all leaves with user details
        const leaves = await Leave.find()
            .populate('user', 'name email department') // Get user info
            .sort({ createdAt: -1 });

        return res.json(leaves);

    } catch (error) {
        console.error('Get all leaves error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve or reject leave request
// @route   PATCH /api/leaves/:id
// @access  Private (Admin only)
const updateLeaveStatus = async (req, res) => {
    try {
        // Security check: only admin can approve/reject leaves
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin allowed to approve/reject leaves" });
        }
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find and update leave
        const leave = await Leave.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return updated document
        ).populate('user', 'name email');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        res.json({
            message: `✅ Leave request ${status}`,
            leave
        });

    } catch (error) {
        console.error('Update leave error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createLeaveRequest,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};