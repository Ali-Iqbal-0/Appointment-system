// src/routes/consultingEventRoutes.js
const express = require('express');
const router = express.Router();
const {
    createConsultingEvent,
    getConsultingEvents,
    getConsultingEventById,
    updateConsultingEventById // Import the new controller function
} = require('../controllers/consultingEventController');


router.post('/add', createConsultingEvent);
router.get('/get', getConsultingEvents);
router.get('/get/:eventId', getConsultingEventById);

// NEW ROUTE for updating a single event by ID
router.put('/update/:eventId', updateConsultingEventById);

module.exports = router;