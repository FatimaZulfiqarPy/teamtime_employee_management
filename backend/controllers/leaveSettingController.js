const LeaveSetting = require('../models/LeaveSetting');

// @desc    Get leave settings
// @route   GET /api/leave-settings
const getLeaveSettings = async (req, res) => {
    try {
        let settings = await LeaveSetting.findOne().sort({ createdAt: -1 });
        
        if (!settings) {
            // Create default settings if none exist
            settings = await LeaveSetting.create({
                annual: 12,
                sick: 10,
                casual: 5
            });
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave settings (Admin only)
// @route   PUT /api/leave-settings
const updateLeaveSettings = async (req, res) => {
    try {
        const { annual, sick, casual } = req.body;
        
        let settings = await LeaveSetting.findOne();
        
        if (!settings) {
            settings = new LeaveSetting();
        }
        
        settings.annual = annual;
        settings.sick = sick;
        settings.casual = casual;
        settings.updatedBy = req.user.id;
        
        await settings.save();
        
        return res.json({
            message: '✅ Leave settings updated successfully',
            settings
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeaveSettings, updateLeaveSettings };