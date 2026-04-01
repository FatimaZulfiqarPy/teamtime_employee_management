const express = require('express');
const router = express.Router();
const { registerUser,loginUser } = require('../controllers/authController');

//register routee
router.post('/register', registerUser);
//login routeee
router.post('/login', loginUser);

module.exports = router;