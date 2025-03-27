const Restaurant = require('../../models/Partner/Restaurant');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    name,
    email,
    phone_number,
    password: hashedPassword,
    role: 'Restaurant'
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

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

      const restaurants = await Restaurant.find(query)
        .populate({
          path: 'user_id',
          select: 'name email is_deleted',
          match: { is_deleted: isDeleted }
        })
        .populate('location_id', 'name')
        .lean();
      console.log(restaurants);

      const filteredRestaurants = restaurants.filter(
        (restaurant) => restaurant.user_id !== null
      );

      const detailedRestaurants = filteredRestaurants.map((restaurant) => {
        const userDetails = restaurant.user_id;
        const locationDetails = restaurant.location_id;

        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        const flattenedRestaurant = {
          ...restaurant,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,

          user_id: undefined,
          location_id: undefined
        };

        return flattenedRestaurant;
      });

      res.json(detailedRestaurants);
    } else {
      const restaurants = await Restaurant.find(query)
        .populate({
          path: 'user_id',
          select: 'name email is_deleted',
          match: { is_deleted: false }
        })
        .populate('location_id', 'name')
        .lean();

      const filteredRestaurants = restaurants.filter(
        (restaurant) => restaurant.user_id !== null
      );

      const detailedRestaurants = filteredRestaurants.map((restaurant) => {
        const userDetails = restaurant.user_id;
        const locationDetails = restaurant.location_id;

        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        const flattenedRestaurant = {
          ...restaurant,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,

          user_id: undefined,
          location_id: undefined
        };

        return flattenedRestaurant;
      });

      res.json(detailedRestaurants);
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: error.message });
  }
});

const getRestaurantById = asyncHandler(async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate({
        path: 'user_id',
        select: 'name email is_deleted',
        match: { is_deleted: false }
      })
      .populate('location_id', 'name')
      .lean();

    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

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

      user_id: undefined,
      location_id: undefined
    };

    res.json(detailedRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  registerRestaurant,
  getRestaurants,
  getRestaurantById
};
