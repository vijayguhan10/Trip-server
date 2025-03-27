const asyncHandler = require('express-async-handler');
const Reservation = require('../../models/Reservation');
const Task = require('../../models/Partner/Task');

const getReservationByBookingId = asyncHandler(async (req, res) => {
  const booking_id = req.user._id;

  try {
    const reservation = await Reservation.findOne({
      booking_id,
      is_deleted: false
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    let businessDetails = null;

    if (reservation.type === 'Task') {
      businessDetails = await Task.findById(reservation.business_id);
    } else if (reservation.type === 'Restaurant') {
      businessDetails = await Restaurant.findById(reservation.business_id);
    }

    res.status(200).json({ reservation, businessDetails });
  } catch (error) {
    console.error('Error fetching reservation:', error.message);
    res.status(500).json({
      error: 'Failed to fetch reservation',
      details: error.message
    });
  }
});

const getReservationsByBusinessId = asyncHandler(async (req, res) => {
  const { business_id, type } = req.params;

  try {
    let reservations = [];

    if (type === 'Task') {
      const tasks = await Task.find({ activity_id: business_id });
      const taskIds = tasks.map((task) => task._id);

      reservations = await Reservation.find({
        task_id: { $in: taskIds },
        is_deleted: false
      });
    } else {
      reservations = await Reservation.find({
        task_id: business_id,
        is_deleted: false
      });
    }

    res.status(200).json(reservations);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch reservations', details: error.message });
  }
});

const createReservation = asyncHandler(async (req, res) => {
  try {
    const { business_id, totalMembers, date, bookedTime, type, advance_Amt } =
      req.body;

    if (!business_id || !totalMembers || !date || !bookedTime || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    const booking_id = req.user._id;
    const newReservation = new Reservation({
      booking_id,
      business_id,
      totalMembers,
      bookedTime,
      type,
      date,
      advance_Amt: advance_Amt ? advance_Amt : 0,
      status: 'Pending'
    });

    await newReservation.save();

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error creating reservation:', error.message);
    res
      .status(500)
      .json({ error: 'Failed to create reservation', details: error.message });
  }
});

const updateReservation = asyncHandler(async (req, res) => {
  const { reservation_id } = req.params;

  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservation_id,
      req.body,
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(updatedReservation);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to update reservation', details: error.message });
  }
});

const deleteReservation = asyncHandler(async (req, res) => {
  const { reservation_id } = req.params;

  try {
    const reservation = await Reservation.findByIdAndUpdate(
      reservation_id,
      { is_deleted: true },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to delete reservation', details: error.message });
  }
});

module.exports = {
  getReservationByBookingId,
  getReservationsByBusinessId,
  createReservation,
  updateReservation,
  deleteReservation
};
