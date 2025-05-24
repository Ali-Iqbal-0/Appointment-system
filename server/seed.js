const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/zohoBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('***** MongoDB Connected for Seeding *****'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  }
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Seed Data Function
const seedDatabase = async () => {
  try {
    // Clear existing data (optional, remove if you want to keep existing data)
    await User.deleteMany({});

    // Sample data
    const sampleUsers = [
      { name: 'Ali Khan', email: 'ali.khan@example.com', phone: '03001234567' },
    ];

    // Insert sample data
    await User.insertMany(sampleUsers);
    console.log('***** Data seeded successfully *****');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    // Close the database connection after seeding
    mongoose.connection.close();
    console.log('***** MongoDB Connection Closed *****');
  }
};

// Run the seed function
seedDatabase();