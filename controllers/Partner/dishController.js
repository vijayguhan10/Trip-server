const Dish = require('../../models/Partner/Dish');

const createDish = async (req, res) => {
  try {
    const {
      name,
      price,
      discounted_price,
      image_url,
      description,
      category,
      restaurant_id,
      filter = []
    } = req.body;

    const newDish = new Dish({
      name,
      price,
      discounted_price,
      image_url,
      description,
      category,
      user_id: req.user._id,
      restaurant_id,
      filter
    });

    const savedDish = await newDish.save();
    res.status(201).json(savedDish);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllDishes = async (req, res) => {
  try {
    let query = {};

    const {
      name,
      category,
      minPrice,
      maxPrice,
      filter,
      is_deleted,
      restaurant_id
    } = req.query;

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (minPrice) {
      query.price = { $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }
    if (filter) {
      query.filter = { $in: filter.split(',') };
    }
    if (is_deleted !== undefined) {
      query.is_deleted = is_deleted === 'true';
    }
    if (restaurant_id) {
      query.restaurant_id = restaurant_id;
    }

    const dishes = await Dish.find(query);
    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    res.status(200).json(dish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    console.log(dish, req.body);
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    if (dish.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to update this dish' });
    }

    const { filter = [] } = req.body;

    const updatedDish = await Dish.findByIdAndUpdate(
      req.params.id,
      { ...req.body, filter },
      { new: true }
    );
    res.status(200).json(updatedDish);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    if (dish.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to delete this dish' });
    }

    await Dish.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish
};
