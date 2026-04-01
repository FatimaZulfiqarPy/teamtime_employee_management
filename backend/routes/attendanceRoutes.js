const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); //  Import the guard
const {
    timeIn,
    timeOut,
    getMyAttendance,
    getAllAttendance
} = require('../controllers/attendanceController');

router.use(protect); // All routes below require authentication

router.post('/time-in', timeIn);
router.post('/time-out', timeOut);
router.get('/my-attendance', getMyAttendance);
router.get('/all-attendance', getAllAttendance);

module.exports = router;
