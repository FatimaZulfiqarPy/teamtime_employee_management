const User = require('../models/User');

// @desc    Get all employees (not admins)
// @route   GET /api/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'employee' })
            .select('-password')
            .sort({ name: 1 });
            
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        //extract role from req.body and delete it to prevent role update

        if (req.user.id !== req.params.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed to update this user" });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.json({
            message: '✅ User updated successfully',
            user
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        // Security check only admin can delete users
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed to delete users" });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.json({ message: '✅ User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };