const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const consultingEventRoutes = require('./routes/consultingEventRoutes');
const customerRoutes = require('./routes/customerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const workflow= require('./routes/workflowRoutes');
const { startAgenda } = require('./services/workflowExecutor');

const app = express();
const PORT =  5050;

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors()); // Allow all origins temporarily

app.use(express.json());
app.use(express.static('public'));

app.use('/api/users', userRoutes);
app.use('/api/consulting-events', consultingEventRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/workflows', workflow);


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/zohoBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {console.log('***** MongoDB Connected *****');
    startAgenda().catch(err => console.error("Agenda failed to start:", err));
    const PORT = 5050;
        app.listen(PORT, () => console.log(`***** Server running on port ${PORT}*****`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

  app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });
  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));