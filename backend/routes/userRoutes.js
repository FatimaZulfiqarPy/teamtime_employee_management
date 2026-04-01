const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', getAllUsers);           // GET /api/users
router.get('/:id', getUserById);        // GET /api/users/:id
router.put('/:id', updateUser);         // PUT /api/users/:id (UPDATE)
router.delete('/:id', deleteUser);      // DELETE /api/users/:id

module.exports = router;