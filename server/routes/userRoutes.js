const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Existing route
router.get('/getUsers', userController.getAllUsers);

// New route for inviting users
router.post('/invite', userController.inviteUser);

// New route for updating a user's profile
router.put('/update/:userId', userController.updateUserProfile);

// Optional: New route to get a single user by ID
router.get('/:userId', userController.getUserById);
router.delete('/delete/:userId', userController.deleteUserById); 

module.exports = router;