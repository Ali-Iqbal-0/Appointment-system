const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/add', appointmentController.addAppointment);
router.get('/get', appointmentController.getAppointments);
router.put('/update/:id', appointmentController.updateAppointment); // For reschedule
router.put('/cancel/:id', appointmentController.cancelAppointment); // For cancelling

module.exports = router;