const Product = require('../../models/Partner/Product');


const createProduct = async (req, res) => {
  console.log(req.body);
  try {
    const {
      name,
      price,
      discounted_price,
      image_url,
      description,
      shop_id,
      filter = []
    } = req.body;
    const newProduct = new Product({
      name,
      price,
      discounted_price,
      image_url,
      description,
      user_id: req.user._id,
      shop_id,
      filter
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getAllProducts = async (req, res) => {
  try {
    
    let query = {};

    
    const { name, category, minPrice, maxPrice, filter, is_deleted, shop_id } =
      req.query;

    if (!shop_id) {
      return res.status(400).json({ error: 'Shop Id is missing' }); 
    }

    
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
      query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    }
    if (filter) {
      query.filter = { $in: filter.split(',') };
    }
    if (is_deleted !== undefined) {
      query.is_deleted = is_deleted === 'true';
    }
    query.shop_id = shop_id; 

    
    const products = await Product.find(query);
    console.log(products);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log(product, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to update this product' });
    }

    const { filter = [] } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, filter },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
