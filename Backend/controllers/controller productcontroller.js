const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Get all products with filters
exports.getProducts = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      page = 1, 
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('supplier', 'companyName rating responseTime')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product (supplier only)
exports.createProduct = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.userId });
    
    if (!supplier) {
      return res.status(403).json({ message: 'Only suppliers can create products' });
    }

    const product = new Product({
      ...req.body,
      supplier: supplier._id
    });

    await product.save();

    // Update supplier's product count
    await Supplier.findByIdAndUpdate(supplier._id, {
      $inc: { totalProducts: 1 }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    const supplier = await Supplier.findOne({ user: req.userId });
    if (product.supplier.toString() !== supplier._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    const supplier = await Supplier.findOne({ user: req.userId });
    if (product.supplier.toString() !== supplier._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.remove();

    // Update supplier's product count
    await Supplier.findByIdAndUpdate(supplier._id, {
      $inc: { totalProducts: -1 }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};