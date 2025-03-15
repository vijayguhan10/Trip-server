const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Shop = require('../../models/Partner/Shop');
const Restaurant = require('../../models/Partner/Restaurant');
const Activity = require('../../models/Partner/Activity');
const Agent = require('../../models/Agent');
const SuperAdmin = require('../../models/SuperAdmin');

// **LOGIN USER**
const loginUser = async (req, res) => {
  try {
    const { email, phone_number, password } = req.body;
    let { role } = req.body;
    if (role == 'Activities') {
      role = 'Activity';
    }
    console.log(req.body);
    let user;
    if (email) {
      user = await User.findOne({
        email,
        role,
        is_deleted: false
      });
    } else if (phone_number) {
      user = await User.findOne({
        phone_number,
        role,
        is_deleted: false
      });
    }

    console.log(user);

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid credentials or account not activated' });
    }

    // Check if user registration is pending approval
    if (user.isNew) {
      return res.status(403).json({
        message: 'SuperAdmin has not yet approved your registration.'
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: 'Invalid email/phone or password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// **GET USER BY ID**
const getUserProfileById = async (req, res) => {
  try {
    // Find user by ID (exclude password) and convert to plain JS object.
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user is SuperAdmin, no additional role data is needed.
    if (user.role === 'SuperAdmin') {
      return res.status(200).json(user);
    }

    // Choose the corresponding role-based model.
    let roleModel;
    switch (user.role) {
      case 'Agent':
        roleModel = Agent;
        break;
      case 'Shop':
        roleModel = Shop;
        break;
      case 'Restaurant':
        roleModel = Restaurant;
        break;
      case 'Activity':
        roleModel = Activity;
        break;
      default:
        return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Find the role-specific record linked to this user.
    const roleData = await roleModel.findOne({ user_id: user._id }).lean();
    if (!roleData) {
      // If no additional data is found, simply return the user object.
      return res.status(200).json(user);
    }

    // Extract the role-specific ID and other fields.
    const { _id: roleDocId, user_id, ...roleRest } = roleData;

    // Merge the role-specific fields into the user object.
    // Here, we explicitly force _id to be the one from the User model.
    const userProfile = { ...user, ...roleRest, role_id: roleDocId };

    return res.status(200).json(userProfile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// **GET ALL USERS BY ROLE**
const getAllUsers = async (req, res) => {
  try {
    const filters = {};

    // Always filter SuperAdmins unless explicitly requested
    if (!req.query.role) {
      filters.role = { $ne: 'SuperAdmin' };
    } else {
      if (req.query.role === 'Partner') {
        // If role is 'partner', fetch users with roles 'Restaurant', 'Shop', and 'Activity'
        filters.role = { $in: ['Restaurant', 'Shop', 'Activity'] };
      } else {
        // Otherwise, use the specified role
        filters.role = req.query.role;
      }
    }

    // Add additional filters if provided in the query params
    if (req.query.isNew !== undefined) {
      filters.isNew = req.query.isNew === 'true';
    }

    // Fetch basic user data without passwords
    const users = await User.find(filters).select('-password').lean();

    // If a role is specified, fetch additional details from the relevant model
    if (req.query.role) {
      let roleModel;
      if (req.query.role === 'Partner') {
        // For 'partner', fetch details from all relevant models
        const roleModels = {
          Restaurant: Restaurant,
          Shop: Shop,
          Activity: Activity
        };

        // Fetch role-specific records based on user_id for each role
        const detailedUsers = await Promise.all(
          Object.keys(roleModels).map(async (role) => {
            const roleModel = roleModels[role];
            return await roleModel
              .find({ user_id: { $in: users.map((u) => u._id) } })
              .populate('user_id')
              .lean();
          })
        );

        // Merge user details with role-specific data
        const mergedUsers = detailedUsers.flat().map((item) => {
          const { _id: roleDocId, user_id, ...roleRest } = item;
          if (user_id && typeof user_id === 'object') {
            const { _id: userId, ...userRest } = user_id;
            return { _id: userId, ...userRest, ...roleRest };
          } else {
            return { _id: item.user_id, ...roleRest };
          }
        });

        return res.status(200).json({ data: mergedUsers });
      } else {
        // For other roles, fetch details from the specific model
        switch (req.query.role) {
          case 'Agent':
            roleModel = Agent;
            break;
          case 'Restaurant':
            roleModel = Restaurant;
            break;
          case 'Shop':
            roleModel = Shop;
            break;
          case 'Activity':
            roleModel = Activity;
            break;
          default:
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        // Fetch role-specific records based on user_id
        let detailedUsers = await roleModel
          .find({ user_id: { $in: users.map((u) => u._id) } })
          .populate('user_id')
          .lean();

        // Merge user details with role-specific data
        detailedUsers = detailedUsers.map((item) => {
          const { _id: roleDocId, user_id, ...roleRest } = item;
          if (user_id && typeof user_id === 'object') {
            const { _id: userId, ...userRest } = user_id;
            return { _id: userId, ...userRest, ...roleRest };
          } else {
            return { _id: item.user_id, ...roleRest };
          }
        });

        return res.status(200).json({ data: detailedUsers });
      }
    }

    // If no specific role, return the basic user data
    return res.status(200).json({ data: users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// **UPDATE USER**
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body }; // Clone request body

    console.log('Request Body:', updateData);

    // Remove _id to prevent immutable field modification error
    delete updateData._id;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fields that belong to User model
    const userFields = [
      'name',
      'email',
      'phone_number',
      'password',
      'isNew',
      'is_deleted'
    ];
    const userUpdate = {};
    const roleUpdate = { ...updateData };

    // Separate user fields and role fields
    userFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        userUpdate[field] = updateData[field];
        delete roleUpdate[field]; // Remove from role update
      }
    });

    // Handle password change
    if (updateData.currentPassword && updateData.newPassword) {
      const isPasswordMatch = await bcrypt.compare(
        updateData.currentPassword,
        user.password
      );
      if (!isPasswordMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      userUpdate.password = await bcrypt.hash(updateData.newPassword, 10);
    } else if (updateData.password) {
      return res.status(400).json({
        error: 'Password change requires current password and new password'
      });
    }

    // Update the User model
    const updatedUser = await User.findByIdAndUpdate(id, userUpdate, {
      new: true
    }).select('-password');

    // Update role-specific model if not SuperAdmin
    if (user.role !== 'SuperAdmin') {
      let roleModel;
      switch (user.role) {
        case 'Agent':
          roleModel = Agent;
          break;
        case 'Shop':
          roleModel = Shop;
          break;
        case 'Restaurant':
          roleModel = Restaurant;
          break;
        case 'Activity':
          roleModel = Activity;
          break;
        default:
          return res.status(400).json({ error: 'Invalid role specified' });
      }

      // Update the role-specific model
      await roleModel.findOneAndUpdate({ user_id: id }, roleUpdate, {
        new: true
      });
    }

    res
      .status(200)
      .json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user has a role, delete the associated role-specific document
    if (user.role !== 'SuperAdmin') {
      let roleModel;
      switch (user.role) {
        case 'Agent':
          roleModel = Agent;
          break;
        case 'Shop':
          roleModel = Shop;
          break;
        case 'Restaurant':
          roleModel = Restaurant;
          break;
        case 'Activity':
          roleModel = Activity;
          break;
        default:
          return res.status(400).json({ error: 'Invalid role specified' });
      }

      // Delete the associated role-specific document
      await roleModel.findOneAndDelete({ user_id: id });
    }

    // Delete the user document from the User collection
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// **EXPORT CONTROLLERS**
module.exports = {
  loginUser,
  getUserProfileById,
  getAllUsers,
  updateUser,
  deleteUser
};
