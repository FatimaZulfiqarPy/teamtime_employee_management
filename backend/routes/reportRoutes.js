const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMonthlyReport } = require('../controllers/reportController');

router.use(protect);
router.get('/monthly', getMonthlyReport);  // GET /api/reports/monthly

module.exports = router;