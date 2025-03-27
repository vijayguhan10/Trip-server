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
    role: 'Shop'
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

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

      const shops = await Shop.find(query)
        .populate({
          path: 'user_id',
          select: 'name email',
          match: { is_deleted: isDeleted }
        })
        .populate('location_id', 'name')
        .lean();

      console.log(shops);

      const filteredShops = shops.filter((shop) => shop.user_id !== null);

      const detailedShops = filteredShops.map((shop) => {
        const userDetails = shop.user_id;
        const locationDetails = shop.location_id;

        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        const flattenedShop = {
          ...shop,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,

          user_id: undefined,
          location_id: undefined
        };

        return flattenedShop;
      });

      res.json(detailedShops);
    } else {
      const shops = await Shop.find(query)
        .populate({
          path: 'user_id',
          select: 'name email',
          match: { is_deleted: false }
        })
        .populate('location_id', 'name')
        .lean();

      const filteredShops = shops.filter((shop) => shop.user_id !== null);

      const detailedShops = filteredShops.map((shop) => {
        const userDetails = shop.user_id;
        const locationDetails = shop.location_id;

        const { name: userName, email: userEmail } = userDetails;
        const { name: locationName } = locationDetails;

        const flattenedShop = {
          ...shop,
          user_name: userName,
          user_email: userEmail,
          location_name: locationName,

          user_id: undefined,
          location_id: undefined
        };

        return flattenedShop;
      });

      res.json(detailedShops);
    }
  } catch (error) {
    console.error('Error fetching shops:', error);
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

    const userDetails = shop.user_id;
    const locationDetails = shop.location_id;

    const { name: userName, email: userEmail } = userDetails;
    const { name: locationName } = locationDetails;

    const detailedShop = {
      ...shop,
      user_name: userName,
      user_email: userEmail,
      location_name: locationName,

      user_id: undefined,
      location_id: undefined
    };

    res.json(detailedShop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  registerShop,
  getShops,
  getShopById
};
