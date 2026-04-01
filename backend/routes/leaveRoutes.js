const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createLeaveRequest,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
} = require('../controllers/leaveController');

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/', createLeaveRequest);           // POST /api/leaves
router.get('/me', getMyLeaves);                  // GET /api/leaves/me

// Admin routes (we'll add admin check later)
router.get('/', getAllLeaves);                    // GET /api/leaves
router.patch('/:id', updateLeaveStatus);          // PATCH /api/leaves/:id

module.exports = router;