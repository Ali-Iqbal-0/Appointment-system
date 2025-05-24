const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Workflow name is required.'],
        trim: true,
    },
    trigger: {
        type: String,
        required: [true, 'Trigger condition is required.'],
        enum: ['Booked', 'Rescheduled', 'Cancelled', 'Appointment starts', 'Appointment ends', 'Marked as complete'], // Added 'Marked as complete'
        default: 'Appointment ends',
    },
    occurrence: {
        condition: {
            type: String,
            enum: ['After', 'Immediately', 'Before'],
            required: [true, 'Occurrence condition is required.'],
        },
        value: { // Required only if condition is 'After' or 'Before'
            type: Number,
            min: [1, 'Occurrence value must be at least 1.'],
        },
        unit: { // Required only if condition is 'After' or 'Before'
            type: String,
            enum: ['Minutes', 'Hours', 'Days'],
        },
    },
    consultingEventIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsultingEvent',
        required: [true, 'At least one IT Consulting event must be selected.']
    }],
    action: {
        type: String,
        required: [true, 'Action is required.'],
        enum: ['Send email', 'Send SMS', 'Execute custom functions'],
        default: 'Send email',
    },
    emailTemplate: {
        subject: {
            type: String,
            trim: true,
        },
        bodyHtml: {
            type: String,
        },
        senderEmailConfig: {
            type: String,
        },
        replyToEmailConfig: {
            type: String,
        },
        dateFormat: {
            type: String,
        }
    },
    smsTemplate: {
        body: {
            type: String,
        }
    },
    customFunctionData: {
        functionName: {
            type: String,
            trim: true,
        },
        parameters: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Pre-save hook for conditional validation and cleanup
workflowSchema.pre('save', function(next) {
    // Occurrence validation
    if (this.occurrence.condition === 'After' || this.occurrence.condition === 'Before') {
        if (this.occurrence.value == null || this.occurrence.value < 1) {
            return next(new Error(`Occurrence value is required and must be positive when condition is "${this.occurrence.condition}".`));
        }
        if (!this.occurrence.unit) {
            return next(new Error(`Occurrence unit (Minutes/Hours/Days) is required when condition is "${this.occurrence.condition}".`));
        }
    } else if (this.occurrence.condition === 'Immediately') {
        this.occurrence.value = undefined;
        this.occurrence.unit = undefined;
    }

    // Action-specific template validation and cleanup
    if (this.action === 'Send email') {
        if (!this.emailTemplate || !this.emailTemplate.subject || !this.emailTemplate.bodyHtml || !this.emailTemplate.senderEmailConfig || !this.emailTemplate.replyToEmailConfig || !this.emailTemplate.dateFormat) {
            return next(new Error('All email template fields (subject, body, sender, replyTo, dateFormat) are required for "Send email" action.'));
        }
        this.smsTemplate = undefined;
        this.customFunctionData = undefined;
    } else if (this.action === 'Send SMS') {
        if (!this.smsTemplate || !this.smsTemplate.body) {
            return next(new Error('SMS template body is required for "Send SMS" action.'));
        }
        this.emailTemplate = undefined;
        this.customFunctionData = undefined;
    } else if (this.action === 'Execute custom functions') {
        if (!this.customFunctionData || !this.customFunctionData.functionName) {
            return next(new Error('Function name is required for "Execute custom functions" action.'));
        }
        this.emailTemplate = undefined;
        this.smsTemplate = undefined;
    } else {
        this.emailTemplate = undefined;
        this.smsTemplate = undefined;
        this.customFunctionData = undefined;
    }
    next();
});

if (mongoose.models.Workflow) {
    module.exports = mongoose.models.Workflow;
} else {
    module.exports = mongoose.model('Workflow', workflowSchema);
}