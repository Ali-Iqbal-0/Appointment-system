// src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/add', customerController.createCustomer);
router.get('/get', customerController.getAllCustomers); // To fetch customers for the dropdown
router.post('/checkorcreate', customerController.checkOrCreateCustomer);
module.exports = router;