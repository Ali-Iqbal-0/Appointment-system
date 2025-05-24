// src/controllers/consultingEventController.js
const ConsultingEvent = require('../models/consultingEventModel');

// ... (createConsultingEvent, getConsultingEvents, getConsultingEventById functions remain the same) ...
exports.createConsultingEvent = async (req, res) => {
    try {
        const {
            eventType,
            bookingCadence,
            consultingName,
            durationHours,
            durationMinutes,
            priceType,
            priceAmount,
            meetingMode,
            eventDate,
            eventTime,
            numberOfSeats,
            pricedForHours,
            pricedForMinutes,
            assignedSpecialists,
            description,
            visibility,
            status,
            zohoAssist // Make sure this is in your model
            // userId
        } = req.body;

        if (!eventType || !bookingCadence || !consultingName) {
            return res.status(400).json({ success: false, message: 'Event type, booking cadence, and consulting name are required.' });
        }

        const eventData = {
            eventType,
            bookingCadence,
            consultingName,
            durationHours,
            durationMinutes,
            priceType,
            priceAmount,
            numberOfSeats,
            assignedSpecialists: assignedSpecialists || [],
            description,
            visibility: visibility || 'public',
            status: status || 'active',
            zohoAssist: zohoAssist || false, // Added
        };

        if (eventType === 'one-on-one' || eventType === 'collective') {
            eventData.meetingMode = meetingMode;
        }
        // ... (rest of the function)

        const newEvent = new ConsultingEvent(eventData);
        const savedEvent = await newEvent.save();

        res.status(201).json({
            success: true,
            message: 'Consulting event created successfully!',
            data: savedEvent
        });

    } catch (error) {
        console.error("Error creating consulting event:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating event.',
            error: error.message
        });
    }
};

exports.getConsultingEvents = async (req, res) => {
    try {
        const events = await ConsultingEvent.find({})
                                          .populate('assignedSpecialists', 'name _id')
                                          .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error("Error fetching consulting events:", error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching events.',
            error: error.message
        });
    }
};

exports.getConsultingEventById = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await ConsultingEvent.findById(eventId)
                                           .populate('assignedSpecialists', 'name _id');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Consulting event not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });

    } catch (error) {
        console.error("Error fetching consulting event by ID:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while fetching event.',
            error: error.message
        });
    }
};

// NEW FUNCTION to update an event by ID
exports.updateConsultingEventById = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const updateData = req.body; // Contains fields to update

        // Ensure not to overwrite assignedSpecialists if not provided or if you handle it differently
        // For now, we assume all relevant fields are sent.
        // You might want to add specific logic here if only certain fields are updatable through this endpoint.

        const updatedEvent = await ConsultingEvent.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true, runValidators: true } // new: true returns the updated document, runValidators: true ensures schema validations are run
        ).populate('assignedSpecialists', 'name _id');

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Consulting event not found, cannot update.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Consulting event updated successfully!',
            data: updatedEvent
        });

    } catch (error) {
        console.error("Error updating consulting event by ID:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while updating event.',
            error: error.message
        });
    }
};