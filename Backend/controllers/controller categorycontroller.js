const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort('displayOrder')
      .populate('parentCategory', 'name');

    // Update product counts
    for (let category of categories) {
      const count = await Product.countDocuments({ category: category.name.toLowerCase() });
      if (category.productCount !== count) {
        category.productCount = count;
        await category.save();
      }
    }

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ]
    }).populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by category
exports.getCategoryProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const category = await Category.findOne({ 
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ 
      category: category.name.toLowerCase() 
    })
      .populate('supplier', 'companyName rating')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments({ 
      category: category.name.toLowerCase() 
    });

    res.json({
      category,
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

// Create category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, parentCategory, displayOrder } = req.body;

    // Check if category exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      description,
      icon,
      parentCategory,
      displayOrder
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const allowedUpdates = ['name', 'description', 'icon', 'image', 'parentCategory', 'isActive', 'displayOrder'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        category[key] = req.body[key];
      }
    });

    await category.save();

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if any products use this category
    const productCount = await Product.countDocuments({ 
      category: category.name.toLowerCase() 
    });

    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productCount} products are using this category.` 
      });
    }

    await category.remove();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};