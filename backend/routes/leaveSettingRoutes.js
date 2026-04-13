const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLeaveSettings, updateLeaveSettings } = require('../controllers/leaveSettingController');

// All routes require authentication
router.use(protect);

router.get('/', getLeaveSettings);      // GET /api/leave-settings
router.put('/', updateLeaveSettings);   // PUT /api/leave-settings

module.exports = router;