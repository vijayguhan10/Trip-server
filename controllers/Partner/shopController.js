const Shop = require('../../models/Partner/Shop');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

const registerShop = asyncHandler(async (req, res) => {
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
    image_url,
    logo_url,
    location_id,
    map_url = '',
    description = ''
  } = req.body;
  //To be added - map_url and description
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
    role: 'Shop'
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  // Create a new shop using the user's _id and provided location_id
  const shop = await Shop.create({
    user_id: user._id,
    location_id,
    business_name,
    owner_name,
    address,
    city,
    pincode,
    businessHours,
    image_url,
    logo_url,
    isNew: true
  });

  if (shop) {
    res.status(201).json({
      _id: shop._id,
      user_id: shop.user_id,
      business_name: shop.business_name,
      owner_name: shop.owner_name,
      address: shop.address,
      city: shop.city,
      pincode: shop.pincode,
      businessHours: shop.businessHours,
      image_url: shop.image_url,
      logo_url: shop.logo_url,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      isNew: true
    });
  } else {
    res.status(400);
    throw new Error('Invalid shop data');
  }
});

const getShops = asyncHandler(async (req, res) => {
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

    // Fetch shops with all fields and apply the query filters
    const shops = await Shop.find(query)
      .populate('user_id') // Populate all fields of the user
      .populate('location_id') // Populate all fields of the location
      .lean();

    // Flatten user and location details into each shop object
    const detailedShops = shops.map((shop) => {
      const userDetails = shop.user_id;
      const locationDetails = shop.location_id;

      // Extract relevant fields from user and location details
      const {
        name: userName,
        email: userEmail,
        ...otherUserDetails
      } = userDetails;
      const { name: locationName, ...otherLocationDetails } = locationDetails;

      // Flatten the shop object
      const flattenedShop = {
        ...shop,
        user_name: userName,
        user_email: userEmail,
        location_name: locationName,
        user_details: otherUserDetails, // Include other user details
        location_details: otherLocationDetails, // Include other location details
        // Remove nested objects
        user_id: undefined,
        location_id: undefined
      };

      return flattenedShop;
    });

    res.json(detailedShops);
  } catch (error) {
    console.error('Error fetching shops:', error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
});

const getShopById = asyncHandler(async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('user_id', 'name email')
      .populate('location_id', 'name')
      .lean();

    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }

    // Merge user details into the shop object
    const userDetails = shop.user_id;
    const locationDetails = shop.location_id;

    const { name: userName, email: userEmail } = userDetails;
    const { name: locationName } = locationDetails;

    const detailedShop = {
      ...shop,
      user_name: userName,
      user_email: userEmail,
      location_name: locationName,
      // Remove nested objects
      user_id: undefined,
      location_id: undefined
    };

    res.json(detailedShop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const updateShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    res.status(404);
    throw new Error('Shop not found');
  }

  const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });

  res.json(updatedShop);
});

const deleteShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    res.status(404);
    throw new Error('Shop not found');
  }

  await Shop.findByIdAndUpdate(req.params.id, { is_deleted: true });

  res.json({ message: 'Shop deleted' });
});

module.exports = {
  registerShop,
  getShops,
  getShopById,
  updateShop,
  deleteShop
};
