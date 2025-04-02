const Booking = require('../../models/Booking');
const Agent = require('../../models/Agent');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const createBooking = async (req, res) => {
  try {
    if (req.user.role !== 'Agent') {
      return res.status(403).json({ error: 'Only agents can create bookings' });
    }

    const {
      email,
      name,
      phone_number,
      location_id,
      amt_earned,
      start_date,
      end_date
    } = req.body;

    if (new Date(start_date) > new Date(end_date)) {
      return res
        .status(400)
        .json({ error: 'Start date must be before end date' });
    }

    const booking = new Booking({
      agent_id: req.user._id,
      email,
      name,
      phone_number,
      location_id,
      amt_earned,
      start_date,
      end_date
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyBooking = async (req, res) => {
  try {
    const { booking_id, name } = req.body;

    const trimmedName = name.trim().toLowerCase();

    // Find the booking without populating
    const booking = await Booking.findOne({
      _id: booking_id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      is_deleted: false
    });

    if (!booking) {
      return res
        .status(401)
        .json({ error: 'Invalid booking credentials / No Booking Found' });
    }

    // Retrieve the agent associated with the booking
    const agent = await Agent.findOne({ user_id: booking.agent_id });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    console.log(agent);

    // Include the agent's logo in the token payload
    const tokenPayload = {
      id: booking._id,
      role: 'booking',
      email: booking.email,
      location_id: booking.location_id,
      agent_logo: agent.logo // Adding the agent's logo to the token payload
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '100d'
    });

    res.json({ booking, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBooking = async (req, res) => {
  try {
    // Fetch the booking details and populate the User (agent)
    const booking = await Booking.findById(req.user._id)
      .populate('agent_id', 'name email')
      .populate('location_id', 'name');

    if (!booking || booking.is_deleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Fetch the agent details using the agent_id from booking (which refers to User model)
    const agent = await Agent.findOne({ user_id: booking.agent_id._id });

    // Construct the response
    const response = {
      ...booking._doc,
      agent_id: {
        ...booking.agent_id._doc, // Keep existing populated User details
        agent_logo: agent ? agent.logo : null,
        company_name: agent ? agent.company_name : null
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const filter =
      req.user.role === 'Agent'
        ? { agent_id: req.user._id }
        : { is_deleted: false };

    const bookings = await Booking.find(filter)
      .populate('agent_id', 'name email')
      .populate('location_id', 'name');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== 'Agent') {
      return res.status(403).json({ error: 'Only agents can delete bookings' });
    }

    const booking = await Booking.findByIdAndDelete({
      _id: req.params.id,
      agent_id: req.user._id
    });

    if (!booking) {
      return res
        .status(404)
        .json({ error: 'Booking not found or unauthorized' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    if (req.user.role !== 'Agent') {
      return res.status(403).json({ error: 'Only agents can update bookings' });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      agent_id: req.user._id
    });

    if (!booking) {
      return res
        .status(404)
        .json({ error: 'Booking not found or unauthorized' });
    }

    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        booking[key] = req.body[key];
      }
    }

    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createBooking,
  verifyBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking
};
