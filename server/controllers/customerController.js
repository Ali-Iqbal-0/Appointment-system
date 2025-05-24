// src/controllers/customerController.js
const Customer = require('../models/CustomerModel');

exports.createCustomer = async (req, res) => {
    try {
        const { customerName, emailAddress, countryCode, contactNumber } = req.body;

        if (!customerName || !emailAddress || !countryCode || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: 'Customer name, email, country code, and contact number are required.',
            });
        }

        // Optional: Check if customer with this email already exists
        const existingCustomer = await Customer.findOne({ emailAddress });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'A customer with this email address already exists.',
            });
        }

        const newCustomer = new Customer({
            customerName,
            emailAddress,
            countryCode,
            contactNumber,
        });

        const savedCustomer = await newCustomer.save();
        res.status(201).json({
            success: true,
            message: 'Customer created successfully!',
            data: savedCustomer,
        });

    } catch (error) {
        console.error('Error creating customer:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating customer.',
            error: error.message,
        });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({}, 'customerName emailAddress _id'); // Select necessary fields
        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching customers' });
    }
};
// In your customerController.js (or a new controller)


exports.checkOrCreateCustomer = async (req, res) => {
    try {
        const { customerName, emailAddress, countryCode, contactNumber } = req.body;

        if (!customerName || !emailAddress || !countryCode || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: 'Customer name, email, country code, and contact number are required.',
            });
        }

        let customer = await Customer.findOne({ emailAddress: emailAddress.toLowerCase() });
        let isNew = false;

        if (customer) {
            // Optional: Update existing customer details if they've changed
            // For example, if they update their name or contact number for the same email
            // customer.customerName = customerName;
            // customer.countryCode = countryCode;
            // customer.contactNumber = contactNumber;
            // await customer.save();
            // For now, just return the existing customer
        } else {
            customer = new Customer({
                customerName,
                emailAddress,
                countryCode,
                contactNumber,
            });
            await customer.save();
            isNew = true;
        }

        res.status(isNew ? 201 : 200).json({
            success: true,
            message: isNew ? 'New customer created.' : 'Existing customer found.',
            data: customer, // Send the full customer object (or selected fields)
            isNew: isNew
        });

    } catch (error) {
        console.error('Error in checkOrCreateCustomer:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while processing customer.',
            error: error.message,
        });
    }
};

// Make sure to add a route for this in your customer routes file:
// router.post('/check-or-create', customerController.checkOrCreateCustomer);