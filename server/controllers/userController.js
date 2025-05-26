const User = require('../models/User'); // Adjust path if necessary

// Get all users (recruiters)
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all fields for users. You might want to filter by role if needed, e.g., { role: 'Recruiter' }
    const users = await User.find({}); // Removed projection to get all fields
    if (!users) {
      // It's okay to return an empty array if no users
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching users', error: err.message });
  }
};

// Invite a new user or update an existing user's role
exports.inviteUser = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ success: false, message: 'Email and role are required.' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update their role and status
      user.role = role;
      user.status = 'PendingInvitation'; // Or 'Active' if you want to skip email verification for now
      // Potentially resend invitation if needed
    } else {
      // User does not exist, create a new one
      const nameFromEmail = email.split('@')[0];
      user = new User({
        name: nameFromEmail,
        email,
        role,
        status: 'PendingInvitation',
        // Other fields will be default or empty, to be filled later
      });
    }

    await user.save();

    // TODO: Implement actual email sending logic here
    // console.log(`Invitation supposedly sent to ${email} for role ${role}`);

    res.status(201).json({ success: true, message: 'User invited successfully. Awaiting acceptance.', data: user });
  } catch (err) {
    console.error('Error inviting user:', err);
    // Handle duplicate key error for email if it occurs for some reason (though findOne should prevent it)
    if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Email already exists for another user record (unexpected).', error: err.message});
    }
    res.status(500).json({ success: false, message: 'Server error while inviting user.', error: err.message });
  }
};

// Update user profile details
exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  // Fields that can be updated
  const allowedUpdates = ['name', 'phone', 'role', 'gender', 'designation', 'dateOfBirth', 'status', 'additionalInformation'];
  
  const finalUpdates = {};
  for (const key in updates) {
    if (allowedUpdates.includes(key)) {
      // Handle empty strings for optional fields, but don't remove if not provided
      if (updates[key] !== undefined) {
         finalUpdates[key] = updates[key] === '' ? null : updates[key]; // Store empty strings as null or keep as empty based on preference
      }
    }
  }
   // Ensure email is not updated through this endpoint for security/simplicity
  if (finalUpdates.email) {
    delete finalUpdates.email;
  }


  try {
    const user = await User.findByIdAndUpdate(userId, finalUpdates, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'User profile updated successfully.', data: user });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ success: false, message: 'Server error while updating profile.', error: err.message });
  }
};

// Optional: Get a single user's details (could be useful)
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Delete a user by ID
exports.deleteUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deletion of Super Admins (as a hard rule on backend)
    if (userToDelete.role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Super Admins cannot be deleted.' });
    }
    
    // Optional: Prevent self-deletion if you have access to the logged-in user's ID
    // This requires auth middleware to populate req.user or similar
    // For example, if (req.user.id === userId) {
    //   return res.status(403).json({ success: false, message: 'You cannot delete your own account.' });
    // }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    if (err.name === 'CastError') { // Handle invalid ObjectId format
         return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error while deleting user.', error: err.message });
  }
};