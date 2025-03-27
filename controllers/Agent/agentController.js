const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Agent = require('../../models/Agent');

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

    const existingUser = await User.findOne({
      $or: [{ email }, { phone_number }]
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'Email or phone number already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone_number,
      password: hashedPassword,
      role: 'Agent'
    });

    await user.save();
    const agent = new Agent({
      user_id: user._id,
      company_name,
      address,
      pincode,
      city,
      logo,
      isNew: true
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

const getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findOne({ user_id: req.user._id }).lean();
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User details not found' });
    }
    const agentProfile = { ...user, ...agent };
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
};
