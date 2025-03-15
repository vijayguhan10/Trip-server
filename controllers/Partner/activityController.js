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

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create a new user
  const user = await User.create({
    name,
    email,
    phone_number,
    password: hashedPassword, // Save the hashed password
    role: 'Activity'
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  // Create a new activity using the user's _id and provided location_id
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
    // Build the query object from request query parameters
    const query = {}; // Default filter for is_deleted
    const allowedFields = [
      'business_name',
      'owner_name',
      'city',
      'pincode',
      'category',
      'discount',
      'customer_rating'
    ];

    // Filter out only the allowed fields from the query parameters
    for (const field of allowedFields) {
      if (req.query[field]) {
        query[field] = req.query[field];
      }
    }

    // Add the default filter for is_deleted

    // Fetch activities with all fields and apply the query filters
    const activities = await Activity.find(query)
      .populate('user_id', 'name email') // Populate specific fields of the user
      .populate('location_id', 'name') // Populate specific fields of the location
      .lean();

    // Flatten user and location details into each activity object
    const detailedActivities = activities.map((activity) => {
      const userDetails = activity.user_id;
      const locationDetails = activity.location_id;

      // Extract relevant fields from user and location details
      const {
        name: userName,
        email: userEmail,
        ...otherUserDetails
      } = userDetails;
      const { name: locationName, ...otherLocationDetails } = locationDetails;

      // Flatten the activity object
      const flattenedActivity = {
        ...activity,
        user_name: userName,
        user_email: userEmail,
        location_name: locationName,
        user_details: otherUserDetails, // Include other user details
        location_details: otherLocationDetails, // Include other location details
        // Remove nested objects
        user_id: undefined,
        location_id: undefined
      };

      return flattenedActivity;
    });

    res.json(detailedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error); // Log the error for debugging
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

const updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  const updatedActivity = await Activity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedActivity);
});

const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  await Activity.findByIdAndUpdate(req.params.id, { is_deleted: true });

  res.json({ message: 'Activity deleted' });
});

module.exports = {
  registerActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
};
