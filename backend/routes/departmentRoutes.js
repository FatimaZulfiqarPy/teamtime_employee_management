const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

// All routes require authentication
router.use(protect);

router.get('/', getAllDepartments);           // GET /api/departments
router.get('/:id', getDepartmentById);        // GET /api/departments/:id
router.post('/', createDepartment);           // POST /api/departments
router.put('/:id', updateDepartment);         // PUT /api/departments/:id
router.delete('/:id', deleteDepartment);      // DELETE /api/departments/:id

module.exports = router;