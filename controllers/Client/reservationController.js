const asyncHandler = require('express-async-handler');
const Reservation = require('../../models/Reservation');
const Restaurant = require('../../models/Partner/Restaurant');
const Task = require('../../models/Partner/Task');

const getReservationsByBookingId = asyncHandler(async (req, res) => {
  const booking_id = req.user._id;

  try {
    const reservations = await Reservation.find({
      booking_id,
      is_deleted: false
    });

    if (!reservations.length) {
      return res.status(404).json({ message: 'No reservations found' });
    }

    const reservationsWithDetails = await Promise.all(
      reservations.map(async (reservation) => {
        let businessDetails = null;

        if (reservation.type === 'Task') {
          businessDetails = await Task.findById(reservation.business_id);
        } else if (reservation.type === 'Restaurant') {
          businessDetails = await Restaurant.findById(reservation.business_id);
        }

        return { ...reservation.toObject(), businessDetails };
      })
    );

    res.status(200).json({ reservations: reservationsWithDetails });
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({
      error: 'Failed to fetch reservations',
      details: error.message
    });
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

const getReservationsByBusinessId = asyncHandler(async (req, res) => {
  const { business_id, type } = req.params;
  const { status, date, is_deleted } = req.query;

  try {
    let baseQuery = { type };

    // Handle business_id based on type
    if (type === 'Task') {
      const tasks = await Task.find({ activity_id: business_id });
      const taskIds = tasks.map((task) => task._id);
      baseQuery.business_id = { $in: taskIds };
    } else {
      baseQuery.business_id = business_id;
    }

    // Apply filters from query parameters
    if (status) baseQuery.status = status;
    if (date) baseQuery.date = date;
    if (is_deleted !== undefined) baseQuery.is_deleted = is_deleted === 'true';

    // Find reservations with populated data
    const reservations = await Reservation.find(baseQuery)
      .populate({
        path: 'booking_id',
        select: '-createdAt -updatedAt -__v',
        populate: { path: 'location_id', select: 'name' }
      })
      .populate({
        path: 'business_id',
        select: '-createdAt -updatedAt -__v'
      });

    // Categorize reservations
    const activeReservations = reservations.filter(
      (reservation) =>
        !reservation.is_deleted &&
        reservation.booking_id &&
        !reservation.booking_id.is_deleted
    );

    const inactiveReservations = reservations.filter(
      (reservation) =>
        reservation.is_deleted ||
        !reservation.booking_id ||
        reservation.booking_id.is_deleted
    );

    res.status(200).json({
      success: true,
      active: activeReservations,
      inactive: inactiveReservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations',
      details: error.message
    });
  }
});

const updateReservation = asyncHandler(async (req, res) => {
  const { reservation_id } = req.params;
  const updateData = { ...req.body };

  try {
    // Automatic is_deleted management based on status
    if (updateData.status) {
      updateData.is_deleted = ['Cancelled', 'Completed'].includes(
        updateData.status
      );
    }

    // Prevent unwanted field updates
    const allowedFields = [
      'status',
      'date',
      'bookedTime',
      'totalMembers',
      'advance_Amt',
      'is_deleted'
    ];
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) delete updateData[key];
    });

    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservation_id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'booking_id',
        select: '-createdAt -updatedAt -__v',
        populate: { path: 'location_id', select: 'name' }
      })
      .populate({
        path: 'business_id',
        select: '-createdAt -updatedAt -__v'
      });

    if (!updatedReservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update reservation',
      details: error.message
    });
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
  getReservationsByBookingId,
  getReservationsByBusinessId,
  createReservation,
  updateReservation,
  deleteReservation
};
