const Activity = require('../../models/Partner/Activity');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const registerActivity = asyncHandler(async (req, res) => {
  console.log(req.body);
  const saltRounds = 10;
  const {
    name,
    email,
    phone_number,
    password,
    business_name,
    owner_name,
    address,
    city,
    pincode,
    businessHours,
    location_id
  } = req.body;
  let { image_url, logo_url } = req.body;
  if (
    !name ||
    !email ||
    !phone_number ||
    !password ||
    !business_name ||
    !owner_name ||
    !address ||
    !city ||
    !pincode ||
    !location_id
  ) {
    res.status(400);
    throw new Error('Please add all fields');
  }
  if (!image_url) {
    image_url = [];
  }
  if (!logo_url) {
    logo_url = '';
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    name,
    email,
    phone_number,
    password: hashedPassword,
    role: 'Activity'
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  const activity = await Activity.create({
    user_id: user._id,
    business_name,
    owner_name,
    address,
    city,
    pincode,
    image_url,
    logo_url,
    businessHours,
    location_id,
    isNew: true
  });

  if (activity) {
    res.status(201).json({
      _id: activity._id,
      user_id: activity.user_id,
      business_name: activity.business_name,
      owner_name: activity.owner_name,
      address: activity.address,
      city: activity.city,
      pincode: activity.pincode,
      image_url: activity.image_url,
      logo_url: activity.logo_url,
      businessHours: activity.businessHours,
      location_id: activity.location_id,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      isNew: true
    });
  } else {
    res.status(400);
    throw new Error('Invalid activity data');
  }
});

const getActivities = asyncHandler(async (req, res) => {
  try {
    const query = {};
    const allowedFields = [
      'business_name',
      'owner_name',
      'city',
      'pincode',
      'category',
      'discount',
      'customer_rating',
      'location_id'
    ];

    for (const field of allowedFields) {
      if (req.query[field]) {
        query[field] = req.query[field];
      }
    }

    if (req.query.is_deleted !== undefined) {
      const isDeleted = req.query.is_deleted === 'true';
      console.log('is deleted', isDeleted);

      const activities = await Activity.find(query)
        .populate({
          path: 'user_id',
          select: 'name email',
          match: { is_deleted: isDeleted }
        })
        .populate('location_id', 'name')
        .lean();

      console.log(activities);

      const filteredActivities = activities.filter(
        (activity) => activity.user_id !== null
      );

      const detailedActivities = filteredActivities.map((activity) => {
        const userDetails = activity.user_id;
        const locationDetails = activity.location_id;

        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        const flattenedActivity = {
          ...activity,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,

          user_id: undefined,
          location_id: undefined
        };

        return flattenedActivity;
      });

      res.json(detailedActivities);
    } else {
      const activities = await Activity.find(query)
        .populate({
          path: 'user_id',
          select: 'name email',
          match: { is_deleted: false }
        })
        .populate('location_id', 'name')
        .lean();

      const filteredActivities = activities.filter(
        (activity) => activity.user_id !== null
      );

      const detailedActivities = filteredActivities.map((activity) => {
        const userDetails = activity.user_id;
        const locationDetails = activity.location_id;

        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        const flattenedActivity = {
          ...activity,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,

          user_id: undefined,
          location_id: undefined
        };

        return flattenedActivity;
      });

      res.json(detailedActivities);
    }
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message });
  }
});

const getActivityById = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id)
    .populate('user_id', 'name email')
    .populate('location_id', 'name');

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  res.json(activity);
});

module.exports = {
  registerActivity,
  getActivities,
  getActivityById
};
