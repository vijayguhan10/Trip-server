const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const ThingsToCarryDb = require('../../models/ThingsToCarry');
const Location = require('../../models/Location');
const Agent = require('../../models/Agent');
const Shop = require('../../models/Partner/Shop');
const Restaurant = require('../../models/Partner/Restaurant');
const Activity = require('../../models/Partner/Activity');
const SuperAdmin = require('../../models/SuperAdmin');

const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h'
    }
  );
};

// SuperAdmin Signup
const signupSuperAdmin = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });
    if (existingSuperAdmin) {
      return res.status(400).json({ error: 'A SuperAdmin already exists!' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User entry
    const user = new User({
      name,
      email,
      phone_number,
      password: hashedPassword,
      role: 'SuperAdmin',
      isNew: false
    });

    await user.save();

    // Create SuperAdmin entry and link with User
    const superAdmin = new SuperAdmin({
      user_id: user._id
    });

    await superAdmin.save();

    // Generate JWT token
    const token = generateToken(user);

    res
      .status(201)
      .json({ message: 'SuperAdmin created successfully', user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewCompletedData = async (req, res) => {
  const { index = 0, limit = 50 } = req.body;

  try {
    const skipValue = index * limit;

    // Fetch only approved users excluding SuperAdmins
    const CompleteData = await User.find({
      isNew: false,
      role: { $ne: 'SuperAdmin' } // Exclude SuperAdmins
    })
      .select('-password')
      .skip(skipValue)
      .limit(limit);

    if (CompleteData.length === 0) {
      return res.status(404).json({ message: 'No records available' });
    }

    return res.status(200).json({ data: CompleteData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Fetch pending registrations
const getYetToBeReviewedData = async (req, res) => {
  const index = 0,
    limit = 50;

  try {
    const skipValue = index * limit;

    // Fetch Users who are 'isNew: true'
    const users = await User.find({ isNew: true })
      .select('-password') // Exclude password
      .skip(skipValue)
      .limit(limit)
      .lean(); // Convert to plain objects for better performance

    if (users.length === 0) {
      return res
        .status(200)
        .json({ message: 'No records available', data: [] });
    }

    // Fetch role-specific details and merge them into a flat structure
    const processedData = await Promise.all(
      users.map(async (user) => {
        let roleData = {};

        switch (user.role) {
          case 'Agent':
            roleData =
              (await Agent.findOne({ user_id: user._id }).lean()) || {};
            break;
          case 'Shop':
            roleData = (await Shop.findOne({ user_id: user._id }).lean()) || {};
            break;
          case 'Restaurant':
            roleData =
              (await Restaurant.findOne({ user_id: user._id }).lean()) || {};
            break;
          case 'Activity':
            roleData =
              (await Activity.findOne({ user_id: user._id }).lean()) || {};
            break;
        }

        // Remove `_id` and `user_id` from role-specific data
        delete roleData._id;
        delete roleData.user_id;

        // Merge User details and Role-based details into a single object
        return { ...user, ...roleData };
      })
    );

    return res.status(200).json({ data: processedData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const reviewRegistration = async (req, res) => {
  const { id, isapproved } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isapproved) {
      user.isNew = false;
      await user.save();
      return res.status(200).json({ message: 'User successfully approved' });
    } else {
      // Delete user and respective role-based document
      switch (user.role) {
        case 'Agent':
          await Agent.findOneAndDelete({ user_id: user._id });
          break;
        case 'Restaurant':
          await Restaurant.findOneAndDelete({ user_id: user._id });
          break;
        case 'Shop':
          await Shop.findOneAndDelete({ user_id: user._id });
          break;
        case 'Activity':
          await Activity.findOneAndDelete({ user_id: user._id });
          break;
        default:
          return res.status(400).json({ message: 'Invalid user role' });
      }

      // Delete the user itself
      await User.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: 'User registration rejected and deleted' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = reviewRegistration;

module.exports = {
  signupSuperAdmin,
  getReviewCompletedData,
  getYetToBeReviewedData,
  reviewRegistration
};
