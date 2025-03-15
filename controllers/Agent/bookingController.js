const Booking = require('../../models/Booking');
const jwt = require('jsonwebtoken');

// **Create Booking (Agent Only)**
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
      agent_id: req.user._id, // Agent is the creator
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

    // Trim and convert to lowercase
    const trimmedName = name.trim().toLowerCase();

    // Find the booking with the provided booking_id and name (case-insensitive)
    const booking = await Booking.findOne({
      _id: booking_id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      is_deleted: false
    }).populate('agent_id');

    if (!booking) {
      return res
        .status(401)
        .json({ error: 'Invalid booking credentials / No Booking Found' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: booking._id, role: 'booking', location_id: booking.location_id },
      process.env.JWT_SECRET,
      { expiresIn: '100d' }
    );

    res.json({ booking, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// **Get Single Booking**
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('agent_id', 'name email')
      .populate('location_id', 'name');

    if (!booking || booking.is_deleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// **Get All Bookings (Agent-Specific)**
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

// Delete a booking from the database
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

// Update a booking
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

    // Update fields provided in the request body
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
