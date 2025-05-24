// src/models/CustomerModel.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required.'],
        trim: true,
    },
    emailAddress: {
        type: String,
        required: [true, 'Email address is required.'],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'],
        // Consider adding unique: true if emails must be unique
    },
    countryCode: {
        type: String,
        required: [true, 'Country code is required.'],
        trim: true,
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required.'],
        trim: true,
    },
    // Add any other fields you need for a customer
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);