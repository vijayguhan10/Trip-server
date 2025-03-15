// Create Agent
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Agent = require('../../models/Agent');

// Create Agent (Register)

// name: formData.fullName,
//         email: formData.email,
//         phone_number: formData.phone,
//         password: formData.password,
//         company_name: formData.companyName,
//         logo: logoUrl,
//         address: formData.address,
//         pincode: formData.pincode,
//         city: formData.city
const createAgent = async (req, res) => {
  try {
    const {
      company_name,
      name,
      email,
      phone_number,
      password,
      logo,
      address,
      pincode,
      city
    } = req.body;

    // Check if email or phone already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone_number }]
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'Email or phone number already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User entry
    const user = new User({
      name, // Using company name as name
      email,
      phone_number,
      password: hashedPassword,
      role: 'Agent'
    });

    await user.save();

    // Create Agent entry and link with User
    const agent = new Agent({
      user_id: user._id,
      company_name,
      address,
      pincode,
      city,
      logo,
      isNew: true // Default: cannot login until SuperAdmin approves
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent created successfully. Waiting for approval.',
      agent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Agent Profile
const getAgentProfile = async (req, res) => {
  try {
    // Find agent details
    const agent = await Agent.findOne({ user_id: req.user._id }).lean();
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // Find user details and exclude the password
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User details not found' });
    }

    // Merge user and agent details into a single object
    const agentProfile = { ...user, ...agent };

    // Remove redundant `user_id` field from the final response
    delete agentProfile.user_id;

    res.status(200).json({
      data: agentProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAgent,
  getAgentProfile
  // updateAgent,
  // deleteAgent
};
