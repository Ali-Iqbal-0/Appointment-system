const Appointment = require('../models/appointmentModel');
const ConsultingEvent = require('../models/consultingEventModel');
const Workflow = require('../models/workflowModel');
const { agenda } = require('../services/workflowExecutor'); // Assuming agenda is set up and exported
const moment = require('moment');
const { generateBookingId } = require('../utils/helper');

const combineDateTime = (dateString, timeSlotString) => {
    const date = new Date(dateString);
    if (!timeSlotString) return date; // Should not happen if selectedTimeSlot is required
    let [time, modifier] = timeSlotString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; // Midnight case
    date.setHours(hours, minutes, 0, 0);
    return date;
};

async function scheduleWorkflowTasksForAppointment(appointment, eventTriggerOverride = null) {
    if (!appointment || !appointment.itConsultingId || !appointment.customerId) {
        console.error("Cannot schedule tasks: Missing appointment details for scheduling.");
        return;
    }

    // Use eventTriggerOverride if provided (e.g., for manual completion), otherwise use appointment.state
    const currentEventContext = eventTriggerOverride || appointment.state;
    console.log(`Scheduling workflow tasks for appointment: ${appointment._id} (IT Consulting ID: ${appointment.itConsultingId}, Event Context: ${currentEventContext})`);

    const relevantWorkflows = await Workflow.find({
        consultingEventIds: appointment.itConsultingId,
        isActive: { $ne: false }
        // We will filter by trigger inside the loop to match the currentEventContext
    });

    if (relevantWorkflows.length === 0) {
        console.log(`No active workflows found for IT Consulting ID: ${appointment.itConsultingId}.`);
        return;
    }

    const appointmentStartMoment = moment(appointment.appointmentDateTime);
    const durationMinutes = (typeof appointment.durationMinutes === 'number' && !isNaN(appointment.durationMinutes))
                           ? appointment.durationMinutes
                           : 0;
    const appointmentEndMoment = appointmentStartMoment.clone().add(durationMinutes, 'minutes');
    const nowMoment = moment();

    for (const workflow of relevantWorkflows) {
        let scheduledTime;
        const occurrence = workflow.occurrence;
        const trigger = workflow.trigger; // Workflow's configured trigger

        // Match workflow trigger with the current event context
        let effectiveTriggerForLogic = null;
        if (trigger === 'Booked' && currentEventContext === 'booked') effectiveTriggerForLogic = 'Booked';
        else if (trigger === 'Rescheduled' && currentEventContext === 'rescheduled') effectiveTriggerForLogic = 'Rescheduled';
        else if (trigger === 'Cancelled' && currentEventContext === 'cancelled') effectiveTriggerForLogic = 'Cancelled';
        else if (trigger === 'Appointment starts') effectiveTriggerForLogic = 'Appointment starts'; // Always relevant to appointment time
        else if (trigger === 'Appointment ends') effectiveTriggerForLogic = 'Appointment ends'; // Always relevant to appointment time
        else if (trigger === 'Marked as complete' && (currentEventContext === 'completed_auto' || currentEventContext === 'completed_manual')) {
            effectiveTriggerForLogic = 'Marked as complete';
        }

        if (!effectiveTriggerForLogic) {
            // console.log(`Workflow "${workflow.name}" trigger "${trigger}" does not match current event context "${currentEventContext}". Skipping.`);
            continue;
        }

        if (!occurrence || !occurrence.condition) {
            console.warn(`Workflow "${workflow.name}" (ID: ${workflow._id}) has invalid occurrence data. Skipping.`);
            continue;
        }

        let baseTimeForScheduling;
        if (effectiveTriggerForLogic === 'Booked' ||
            effectiveTriggerForLogic === 'Rescheduled' ||
            effectiveTriggerForLogic === 'Cancelled' ||
            effectiveTriggerForLogic === 'Marked as complete') {
            baseTimeForScheduling = nowMoment.clone();
        } else if (effectiveTriggerForLogic === 'Appointment starts') {
            baseTimeForScheduling = appointmentStartMoment.clone();
        } else if (effectiveTriggerForLogic === 'Appointment ends') {
            baseTimeForScheduling = appointmentEndMoment.clone();
        } else {
            // Should not happen due to effectiveTriggerForLogic check above
            console.warn(`Workflow "${workflow.name}" (ID: ${workflow._id}) has an unhandled effective trigger: "${effectiveTriggerForLogic}". Skipping.`);
            continue;
        }

        if (occurrence.condition === 'Immediately') {
            scheduledTime = baseTimeForScheduling.clone();
        } else if (occurrence.condition === 'After') {
            scheduledTime = baseTimeForScheduling.clone().add(occurrence.value, occurrence.unit.toLowerCase());
        } else if (occurrence.condition === 'Before') {
            scheduledTime = baseTimeForScheduling.clone().subtract(occurrence.value, occurrence.unit.toLowerCase());
        } else {
            console.warn(`Workflow "${workflow.name}" (ID: ${workflow._id}) has an unknown occurrence condition: "${occurrence.condition}". Skipping.`);
            continue;
        }

        // Post-calculation adjustments
        if ((effectiveTriggerForLogic === 'Booked' || effectiveTriggerForLogic === 'Rescheduled' || effectiveTriggerForLogic === 'Cancelled' || effectiveTriggerForLogic === 'Marked as complete') && scheduledTime.isBefore(nowMoment)) {
            console.log(`Workflow "${workflow.name}" (Trigger: ${effectiveTriggerForLogic}) calculated past time ${scheduledTime.format()}. Scheduling for ASAP.`);
            scheduledTime = nowMoment.clone().add(5, 'seconds');
        } else if ((effectiveTriggerForLogic === 'Appointment starts' || effectiveTriggerForLogic === 'Appointment ends')) {
            if (scheduledTime.isBefore(nowMoment)) {
                if (occurrence.condition === 'Immediately' && baseTimeForScheduling.isSameOrAfter(nowMoment.clone().subtract(10, 'minutes'))) {
                    console.log(`Workflow "${workflow.name}" (Trigger: ${effectiveTriggerForLogic}, Occurrence: Immediately) for a recently passed event. Scheduling for ASAP.`);
                    scheduledTime = nowMoment.clone().add(5, 'seconds');
                } else {
                    console.log(`Workflow "${workflow.name}" (Trigger: ${effectiveTriggerForLogic}) calculated schedule time ${scheduledTime.format()} is in the past. Skipping.`);
                    continue;
                }
            }
        }

        if (occurrence.condition === 'Immediately' && scheduledTime.isBefore(nowMoment)) {
             scheduledTime = nowMoment.clone().add(5, 'seconds');
        }

        console.log(`Scheduling workflow "${workflow.name}" (ID: ${workflow._id}) for appointment ${appointment._id} at ${scheduledTime.format()}`);
        try {
            await agenda.schedule(scheduledTime.toDate(), 'send workflow email', {
                workflowId: workflow._id.toString(),
                appointmentId: appointment._id.toString(),
                customerId: appointment.customerId.toString(),
                triggerContext: effectiveTriggerForLogic
            });
        } catch (scheduleError) {
            console.error(`Error scheduling job for workflow ${workflow._id} and appointment ${appointment._id}:`, scheduleError);
        }
    }
}

exports.addAppointment = async (req, res) => {
    try {
        const {
            itConsultingId, specialistId, customerId, appointmentDate,
            selectedTimeSlot, notes, paymentStatus, paymentAmountInput
        } = req.body;

        if (!itConsultingId || !customerId || !appointmentDate || !selectedTimeSlot) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }
        const consultingEvent = await ConsultingEvent.findById(itConsultingId);
        if (!consultingEvent) {
            return res.status(404).json({ success: false, message: "Consulting event not found." });
        }
        const appointmentDateTime = combineDateTime(appointmentDate, selectedTimeSlot);
        const durationMinutes = (parseInt(consultingEvent.durationHours || 0) * 60) + parseInt(consultingEvent.durationMinutes || 0);

        const newAppointment = new Appointment({
            itConsultingId,
            specialistId: specialistId || null,
            customerId,
            appointmentDateTime,
            durationMinutes,
            notes,
            bookingId: generateBookingId(),
            paymentStatus: consultingEvent.priceType === 'free' ? 'na' : paymentStatus || 'due',
            pricePaid: consultingEvent.priceType === 'free' ? 0 : parseFloat(paymentAmountInput) || 0,
            originalPrice: parseFloat(consultingEvent.priceAmount) || 0,
            status: 'upcoming',
            state: 'booked'
        });

        const savedAppointment = await newAppointment.save();
        await scheduleWorkflowTasksForAppointment(savedAppointment); // Will use appointment.state ('booked')

        const populatedAppointment = await Appointment.findById(savedAppointment._id)
            .populate('itConsultingId')
            .populate('specialistId', 'name email')
            .populate('customerId', 'customerName emailAddress');

        res.status(201).json({ success: true, message: "Appointment booked successfully.", data: populatedAppointment });
    } catch (error) {
        console.error("Error adding appointment:", error);
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        let query = {};
        const now = new Date();

        const pastUpcomingAppointments = await Appointment.find({
            status: 'upcoming' // Find all upcoming appointments
        });

        for (const app of pastUpcomingAppointments) {
            const appointmentEndMoment = moment(app.appointmentDateTime).add(app.durationMinutes || 0, 'minutes');
            if (appointmentEndMoment.isBefore(moment())) { // Check if appointment has truly ended
                 app.status = 'completed';
                 app.state = 'completed_auto';
                 const updatedApp = await app.save();
                 await scheduleWorkflowTasksForAppointment(updatedApp); // Pass the updated appointment
            }
        }

        if (type === 'upcoming') {
            query.appointmentDateTime = { $gte: now };
            query.status = 'upcoming';
        } else if (type === 'past') {
            // query.appointmentDateTime = { $lt: now }; // No, this is too broad, get completed/cancelled
            query.status = { $in: ['completed', 'cancelled'] };
        } else if (startDate && endDate) {
            query.appointmentDateTime = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const appointments = await Appointment.find(query)
            .populate('itConsultingId', 'consultingName durationHours durationMinutes priceType priceAmount eventType')
            .populate('specialistId', 'name email')
            .populate('customerId', 'customerName emailAddress')
            .sort({ appointmentDateTime: type === 'past' ? -1 : 1 }); // Sort past descending, upcoming ascending

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ success: false, message: "Server error fetching appointments." });
    }
};

exports.updateAppointment = async (req, res) => { // For Reschedule
    try {
        const { id } = req.params;
        const {
            appointmentDate, selectedTimeSlot, notes,
            paymentStatus, paymentAmountInput // Assuming these might be part of a reschedule update
        } = req.body;

        const appointmentToUpdate = await Appointment.findById(id);
        if (!appointmentToUpdate) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }
        if (appointmentToUpdate.status === 'cancelled') {
            return res.status(400).json({ success: false, message: "Cannot reschedule a cancelled appointment." });
        }

        const updates = {
            status: 'upcoming', // Rescheduling makes it upcoming again
            state: 'rescheduled'
        };

        if (appointmentDate && selectedTimeSlot) {
            updates.appointmentDateTime = combineDateTime(appointmentDate, selectedTimeSlot);
        }
        if (notes !== undefined) updates.notes = notes;

        const consultingEvent = await ConsultingEvent.findById(appointmentToUpdate.itConsultingId);
        if (consultingEvent && consultingEvent.priceType === 'paid') {
            if (paymentStatus) updates.paymentStatus = paymentStatus;
            if (paymentAmountInput !== undefined && !isNaN(parseFloat(paymentAmountInput))) {
                updates.pricePaid = parseFloat(paymentAmountInput);
            }
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updates, { new: true });

        if (updatedAppointment) {
            console.log(`Cancelling existing workflow jobs for rescheduled appointment ${id}`);
            await agenda.cancel({ 'data.appointmentId': id.toString() });
            await scheduleWorkflowTasksForAppointment(updatedAppointment); // Will use appointment.state ('rescheduled')
        }

        const populatedUpdatedAppointment = await Appointment.findById(updatedAppointment._id)
            .populate('itConsultingId', 'consultingName durationHours durationMinutes priceType priceAmount eventType')
            .populate('specialistId', 'name email')
            .populate('customerId', 'customerName emailAddress');

        res.status(200).json({ success: true, message: "Appointment rescheduled.", data: populatedUpdatedAppointment });
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ success: false, message: "Server error updating appointment." });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            {
                status: 'cancelled',
                state: 'cancelled'
            },
            { new: true }
        )
        .populate('itConsultingId', 'consultingName')
        .populate('specialistId', 'name')
        .populate('customerId', 'customerName');

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }
        console.log(`Cancelling ALL existing workflow jobs for cancelled appointment ${id}`);
        await agenda.cancel({ 'data.appointmentId': id.toString() });
        await scheduleWorkflowTasksForAppointment(appointment); // Will use appointment.state ('cancelled')

        res.status(200).json({ success: true, message: "Appointment cancelled.", data: appointment });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.status(500).json({ success: false, message: "Server error cancelling appointment." });
    }
};

// NEW: Function to manually mark an appointment as complete
exports.markAppointmentAsCompleteManually = async (req, res) => {
    try {
        const { id } = req.params;
        const appointmentToComplete = await Appointment.findById(id);

        if (!appointmentToComplete) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        if (appointmentToComplete.status === 'completed') {
            return res.status(400).json({ success: false, message: "Appointment is already marked as complete." });
        }
        if (appointmentToComplete.status === 'cancelled') {
            return res.status(400).json({ success: false, message: "Cannot mark a cancelled appointment as complete." });
        }

        appointmentToComplete.status = 'completed';
        appointmentToComplete.state = 'completed_manual';
        const completedAppointment = await appointmentToComplete.save();

        // Cancel any 'upcoming' or 'ends' related jobs that might still be scheduled
        // (e.g., if marked complete before its scheduled end time)
        await agenda.cancel({
            'data.appointmentId': completedAppointment._id.toString(),
            'data.triggerContext': { $in: ['Appointment starts', 'Appointment ends'] }
        });

        // Schedule 'Marked as complete' workflows
        await scheduleWorkflowTasksForAppointment(completedAppointment);

        const populatedAppointment = await Appointment.findById(completedAppointment._id)
            .populate('itConsultingId', 'consultingName')
            .populate('specialistId', 'name email')
            .populate('customerId', 'customerName emailAddress');

        res.status(200).json({ success: true, message: "Appointment marked as complete.", data: populatedAppointment });
    } catch (error) {
        console.error("Error marking appointment as complete:", error);
        res.status(500).json({ success: false, message: "Server error marking appointment as complete." });
    }
};