const Restaurant = require('../../models/Partner/Restaurant');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const saltRounds = 10; // You can adjust the number of salt rounds for bcrypt

const registerRestaurant = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone_number,
    password,
    business_name,
    owner_name,
    image_url,
    logo_url,
    address,
    city,
    pincode,
    businessHours,
    location_id
  } = req.body;

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
    !businessHours ||
    !location_id
  ) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create a new user
  const user = await User.create({
    name,
    email,
    phone_number,
    password: hashedPassword, // Save the hashed password
    role: 'Restaurant'
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  // Create a new restaurant using the user's _id and provided location_id
  const restaurant = await Restaurant.create({
    user_id: user._id,
    business_name,
    owner_name,
    image_url,
    logo_url,
    address,
    city,
    pincode,
    businessHours,
    location_id,
    isNew: true
  });

  if (restaurant) {
    res.status(201).json({
      _id: restaurant._id,
      user_id: restaurant.user_id,
      business_name: restaurant.business_name,
      owner_name: restaurant.owner_name,
      image_url: restaurant.image_url,
      logo_url: restaurant.logo_url,
      address: restaurant.address,
      single_line_address: restaurant.single_line_address,
      city: restaurant.city,
      pincode: restaurant.pincode,
      category: restaurant.category,
      businessHours: restaurant.businessHours,
      location_id: restaurant.location_id,
      isActive: restaurant.isActive,
      is_deleted: restaurant.is_deleted,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
      isNew: true
    });
  } else {
    res.status(400);
    throw new Error('Invalid restaurant data');
  }
});

const getRestaurants = asyncHandler(async (req, res) => {
  try {
    // Build the query object from request query parameters
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

    // Filter out only the allowed fields from the query parameters
    for (const field of allowedFields) {
      if (req.query[field]) {
        query[field] = req.query[field];
      }
    }

    // If is_deleted is in the query, we need to filter by the owner's is_deleted status
    if (req.query.is_deleted !== undefined) {
      const isDeleted = req.query.is_deleted === 'true'; // Convert string to boolean
      console.log('is deleted', isDeleted);
      // Fetch restaurants with the specified fields and apply the query filters
      const restaurants = await Restaurant.find(query)
        .populate({
          path: 'user_id',
          select: 'name email is_deleted',
          match: { is_deleted: isDeleted } // Filter users where is_deleted matches the query
        })
        .populate('location_id', 'name')
        .lean();
      console.log(restaurants);
      // Filter out restaurants where user_id is null (due to the match condition)
      const filteredRestaurants = restaurants.filter(
        (restaurant) => restaurant.user_id !== null
      );

      // Flatten user and location details into each restaurant object
      const detailedRestaurants = filteredRestaurants.map((restaurant) => {
        const userDetails = restaurant.user_id;
        const locationDetails = restaurant.location_id;

        // Extract relevant fields from user and location details
        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        // Flatten the restaurant object
        const flattenedRestaurant = {
          ...restaurant,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,
          // Remove nested objects
          user_id: undefined,
          location_id: undefined
        };

        return flattenedRestaurant;
      });

      res.json(detailedRestaurants);
    } else {
      // If is_deleted is not in the query, proceed without filtering by is_deleted
      const restaurants = await Restaurant.find(query)
        .populate({
          path: 'user_id',
          select: 'name email is_deleted',
          match: { is_deleted: false } // Default filter: only non-deleted users
        })
        .populate('location_id', 'name')
        .lean();

      // Filter out restaurants where user_id is null (due to the match condition)
      const filteredRestaurants = restaurants.filter(
        (restaurant) => restaurant.user_id !== null
      );

      // Flatten user and location details into each restaurant object
      const detailedRestaurants = filteredRestaurants.map((restaurant) => {
        const userDetails = restaurant.user_id;
        const locationDetails = restaurant.location_id;

        // Extract relevant fields from user and location details
        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        // Flatten the restaurant object
        const flattenedRestaurant = {
          ...restaurant,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,
          // Remove nested objects
          user_id: undefined,
          location_id: undefined
        };

        return flattenedRestaurant;
      });

      res.json(detailedRestaurants);
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
});

const getRestaurantById = asyncHandler(async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate({
        path: 'user_id',
        select: 'name email is_deleted',
        match: { is_deleted: false } // Filter users where is_deleted is false
      })
      .populate('location_id', 'name')
      .lean();

    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    // Merge user details into the restaurant object
    const userDetails = restaurant.user_id;
    if (!userDetails) {
      res.status(404);
      throw new Error('User not found or user is deleted');
    }

    const { name: userName, email: userEmail } = userDetails;
    const locationDetails = restaurant.location_id;
    const { name: locationName } = locationDetails;

    const detailedRestaurant = {
      ...restaurant,
      user_name: userName,
      user_email: userEmail,
      location_name: locationName,
      // Remove nested objects
      user_id: undefined,
      location_id: undefined
    };

    res.json(detailedRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedRestaurant);
});

const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  await Restaurant.findByIdAndDelete(req.params.id);

  res.json({ message: 'Restaurant deleted' });
});

module.exports = {
  registerRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
};
