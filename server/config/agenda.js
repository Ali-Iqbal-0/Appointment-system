// config/agenda.js
const Agenda = require('agenda');
const mongoose = require('mongoose'); // If not already connected

// Ensure Mongoose is connected before initializing Agenda
// This might be in your server.js or db.js
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const agenda = new Agenda({
    db: {
        address: 'mongodb://localhost:27017/zohoBooking', // Your MongoDB connection string
        collection: 'agendaJobs',       // Name of the collection for Agenda jobs
        options: { useNewUrlParser: true, useUnifiedTopology: true } // Add Mongoose options
    },
    processEvery: '1 minute', // How often Agenda checks for jobs to run
    maxConcurrency: 20,       // Max concurrent jobs
    defaultConcurrency: 5,    // Default concurrency for jobs
});

module.exports = agenda;