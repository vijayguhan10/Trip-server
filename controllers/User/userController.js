const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Shop = require('../../models/Partner/Shop');
const Restaurant = require('../../models/Partner/Restaurant');
const Activity = require('../../models/Partner/Activity');
const Agent = require('../../models/Agent');
const SuperAdmin = require('../../models/SuperAdmin');

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

    if (user.isNew) {
      return res.status(403).json({
        message: 'SuperAdmin has not yet approved your registration.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: 'Invalid email/phone or password' });
    }

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

const getUserProfileById = async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'SuperAdmin') {
      return res.status(200).json(user);
    }

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

    const roleData = await roleModel.findOne({ user_id: user._id }).lean();
    if (!roleData) {
      return res.status(200).json(user);
    }

    const { _id: roleDocId, user_id, ...roleRest } = roleData;

    const userProfile = { ...user, ...roleRest, role_id: roleDocId };

    return res.status(200).json(userProfile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const filters = {};

    if (!req.query.role) {
      filters.role = { $ne: 'SuperAdmin' };
    } else {
      if (req.query.role === 'Partner') {
        filters.role = { $in: ['Restaurant', 'Shop', 'Activity'] };
      } else {
        filters.role = req.query.role;
      }
    }

    if (req.query.isNew !== undefined) {
      filters.isNew = req.query.isNew === 'true';
    }

    const users = await User.find(filters).select('-password').lean();

    if (req.query.role) {
      let roleModel;
      if (req.query.role === 'Partner') {
        const roleModels = {
          Restaurant: Restaurant,
          Shop: Shop,
          Activity: Activity
        };

        const detailedUsers = await Promise.all(
          Object.keys(roleModels).map(async (role) => {
            const roleModel = roleModels[role];
            return await roleModel
              .find({ user_id: { $in: users.map((u) => u._id) } })
              .populate('user_id')
              .lean();
          })
        );

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

        let detailedUsers = await roleModel
          .find({ user_id: { $in: users.map((u) => u._id) } })
          .populate('user_id')
          .lean();

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

    return res.status(200).json({ data: users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    console.log('Request Body:', updateData);

    delete updateData._id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    userFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        userUpdate[field] = updateData[field];
        delete roleUpdate[field];
      }
    });

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

    const updatedUser = await User.findByIdAndUpdate(id, userUpdate, {
      new: true
    }).select('-password');

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

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

      await roleModel.findOneAndDelete({ user_id: id });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  getUserProfileById,
  getAllUsers,
  updateUser,
  deleteUser
};
