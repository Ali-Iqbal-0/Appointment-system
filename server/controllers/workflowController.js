const Workflow = require('../models/workflowModel');

exports.createWorkflow = async (req, res) => {
    try {
        const {
            name, trigger, occurrence, consultingEventIds, action,
            emailTemplate, smsTemplate, customFunctionData, isActive
        } = req.body;

        if (!name || !trigger || !occurrence || !consultingEventIds || consultingEventIds.length === 0 || !action) {
            return res.status(400).json({ success: false, message: 'Name, Trigger, Occurrence, Consulting Events, and Action are required fields.' });
        }

        const newWorkflowData = {
            name,
            trigger,
            occurrence,
            consultingEventIds,
            action,
            isActive: isActive === undefined ? true : isActive,
        };

        // Add action-specific data
        if (action === 'Send email' && emailTemplate) {
            newWorkflowData.emailTemplate = emailTemplate;
        } else if (action === 'Send SMS' && smsTemplate) {
            newWorkflowData.smsTemplate = smsTemplate;
        } else if (action === 'Execute custom functions' && customFunctionData) {
            newWorkflowData.customFunctionData = customFunctionData;
        }
        // Mongoose schema pre-save hook will handle validation of these conditional fields

        const newWorkflow = new Workflow(newWorkflowData);
        let savedWorkflow = await newWorkflow.save();
        savedWorkflow = await Workflow.findById(savedWorkflow._id)
                                    .populate('consultingEventIds', 'consultingName _id');

        res.status(201).json({
            success: true,
            message: 'Workflow created successfully!',
            data: savedWorkflow,
        });
    } catch (error) {
        console.error('Error creating workflow:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join('. ');
            return res.status(400).json({ success: false, message: `Validation Error: ${messages}` });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating workflow.',
            error: error.message,
        });
    }
};

exports.getWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find({})
            .populate('consultingEventIds', 'consultingName _id')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: workflows.length, data: workflows });
    } catch (error) {
        console.error("Error fetching workflows:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.updateWorkflow = async (req, res) => {
    try {
        const workflowId = req.params.id;
        const { name, trigger, occurrence, consultingEventIds, action,
                emailTemplate, smsTemplate, customFunctionData, isActive } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (trigger !== undefined) updates.trigger = trigger;
        if (occurrence !== undefined) updates.occurrence = occurrence;
        if (consultingEventIds !== undefined) {
            if (consultingEventIds.length === 0) {
                 return res.status(400).json({ success: false, message: 'At least one IT Consulting event must be selected.' });
            }
            updates.consultingEventIds = consultingEventIds;
        }
        if (action !== undefined) updates.action = action; // Important to process this first for template cleanup
        if (isActive !== undefined) updates.isActive = isActive;

        // Determine current action for template handling
        const currentAction = action || (await Workflow.findById(workflowId).select('action')).action;

        if (currentAction === 'Send email') {
            if (emailTemplate !== undefined) updates.emailTemplate = emailTemplate;
             // Explicitly set others to undefined to clear them if action changed TO email
            updates.$unset = { smsTemplate: 1, customFunctionData: 1 };
        } else if (currentAction === 'Send SMS') {
            if (smsTemplate !== undefined) updates.smsTemplate = smsTemplate;
            updates.$unset = { emailTemplate: 1, customFunctionData: 1 };
        } else if (currentAction === 'Execute custom functions') {
            if (customFunctionData !== undefined) updates.customFunctionData = customFunctionData;
            updates.$unset = { emailTemplate: 1, smsTemplate: 1 };
        } else if (action) { // If action is explicitly set to something else (or cleared)
            updates.$unset = { emailTemplate: 1, smsTemplate: 1, customFunctionData: 1 };
        }


        if (updates.occurrence && (updates.occurrence.condition === 'After' || updates.occurrence.condition === 'Before')) {
            if (updates.occurrence.value !== undefined) {
                 updates.occurrence.value = parseInt(updates.occurrence.value, 10);
            }
        } else if (updates.occurrence && updates.occurrence.condition === 'Immediately') {
            // Mongoose schema pre-save doesn't run on findByIdAndUpdate by default for $unset type operations
            // So, handle explicitly for updates if needed, or rely on full object replacement
            if (updates.occurrence.value) delete updates.occurrence.value;
            if (updates.occurrence.unit) delete updates.occurrence.unit;
        }


        const updatedWorkflow = await Workflow.findByIdAndUpdate(workflowId, updates, {
            new: true,
            runValidators: true, // This will trigger the pre-save hook for new data
            omitUndefined: true // Important if you are unsetting fields
        }).populate('consultingEventIds', 'consultingName _id');

        if (!updatedWorkflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Workflow updated successfully!',
            data: updatedWorkflow,
        });
    } catch (error) {
        console.error('Error updating workflow:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join('. ');
            return res.status(400).json({ success: false, message: `Validation Error: ${messages}` });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while updating workflow.',
            error: error.message,
        });
    }
};

exports.deleteWorkflow = async (req, res) => {
    try {
        const workflowId = req.params.id;
        const deletedWorkflow = await Workflow.findByIdAndDelete(workflowId);
        if (!deletedWorkflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found.' });
        }
        // Optionally, cancel any Agenda jobs associated with this workflowId
        // const { agenda } = require('../services/workflowExecutor'); // Path to your agenda instance
        // await agenda.cancel({ 'data.workflowId': workflowId });
        res.status(200).json({ success: true, message: 'Workflow deleted successfully.', data: {} });
    } catch (error) {
        console.error('Error deleting workflow:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};