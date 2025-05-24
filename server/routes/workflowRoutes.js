const express = require('express');
const router = express.Router();
const { createWorkflow, getWorkflows, updateWorkflow, deleteWorkflow } = require('../controllers/workflowController');
// const authMiddleware = require('../middleware/authMiddleware'); // If you have auth

// router.use(authMiddleware); // Protect all workflow routes

router.post('/create', createWorkflow);
router.get('/get', getWorkflows);
router.put('/update/:id', updateWorkflow);
router.delete('/delete/:id', deleteWorkflow); // Add delete route

module.exports = router;