const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        return res.json(departments);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get single department
// @route   GET /api/departments/:id
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.json(department);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Create department
// @route   POST /api/departments
const createDepartment = async (req, res) => {
    try {
        const { name, description, head, employees, projects, location } = req.body;

        // Check if exists
        const existing = await Department.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = await Department.create({
            name,
            description,
            head,
            employees: employees || 0,
            projects: projects || 0,
            location
        });

        return res.status(201).json({
            message: '✅ Department created successfully',
            department
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        return res.json({
            message: '✅ Department updated successfully',
            department
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        return res.json({
            message: '✅ Department deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};