const User = require('../models/User'); // Adjust path if necessary

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email _id'); // Select only name, email, and _id
    if (!users || users.length === 0) {
      // It's okay to return an empty array if no users, not necessarily an error
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching users', error: err.message });
  }
};