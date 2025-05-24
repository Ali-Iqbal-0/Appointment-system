// src/models/consultingEventModel.js
const mongoose = require('mongoose');

const consultingEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: [true, 'Event type is required'],
        enum: ['one-on-one', 'group', 'collective', 'resource']
    },
    bookingCadence: {
        type: String,
        required: [true, 'Booking cadence is required'],
        enum: ['one-time', 'recurring']
    },
    consultingName: {
        type: String,
        required: [true, 'Consulting name is required'],
        trim: true,
    },
    durationHours: { type: String, default: '0' },
    durationMinutes: { type: String, default: '30' },
    priceType: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free'
    },
    priceAmount: { type: String, default: '0' },

    // Specific to One-on-One & Collective
    meetingMode: {
        type: String,
        enum: ['online', 'offline', 'phone', 'none', null], // Added 'phone' and confirmed null
    },

    // Specific to Group (One Time)
    eventDate: { type: String },
    eventTime: { type: String },
    numberOfSeats: { type: String, default: '1' },

    // Specific to Resource
    pricedForHours: { type: String },
    pricedForMinutes: { type: String },

    assignedSpecialists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencing your User model
    }],

    // --- ADDED FIELDS ---
    description: {
        type: String,
        trim: true,
        default: '' // Optional: provide a default value
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'], // 'draft' can be useful too
        default: 'active'
    },
    // --- END OF ADDED FIELDS ---

    // Timestamps are managed by Mongoose if you use { timestamps: true } option
    // createdAt: { type: Date, default: Date.now }, // Can be replaced by timestamps option
    // updatedAt: { type: Date, default: Date.now }  // Can be replaced by timestamps option
}, { timestamps: true }); // Using Mongoose's built-in timestamps

// Middleware to update `updatedAt` on save is no longer needed if using { timestamps: true }
// consultingEventSchema.pre('save', function(next) {
//     this.updatedAt = Date.now();
//     next();
// });

module.exports = mongoose.model('ConsultingEvent', consultingEventSchema);