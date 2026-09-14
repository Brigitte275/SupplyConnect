const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const User = require('../models/User');

// Get all suppliers with filters
exports.getSuppliers = async (req, res) => {
  try {
    const { 
      category,
      country,
      verified,
      search,
      page = 1, 
      limit = 12,
      sort = '-rating'
    } = req.query;

    const query = {};

    // Apply filters
    if (category) {
      query.categories = category;
    }

    if (country) {
      query['address.country'] = country;
    }

    if (verified === 'true') {
      query.isVerified = true;
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const suppliers = await Supplier.find(query)
      .populate('user', 'name email phone')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Supplier.countDocuments(query);

    res.json({
      suppliers,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single supplier
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('user', 'name email phone joinedAt');

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Get supplier's products
    const products = await Product.find({ supplier: supplier._id })
      .limit(10)
      .sort('-createdAt');

    res.json({
      ...supplier.toObject(),
      recentProducts: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get supplier's products
exports.getSupplierProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const supplier = await Supplier.findOne({ user: req.params.id });
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const products = await Product.find({ supplier: supplier._id })
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments({ supplier: supplier._id });

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

// Update supplier profile (supplier only)
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.userId });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const allowedUpdates = [
      'companyName', 'businessType', 'categories', 'description',
      'logo', 'coverImage', 'establishedYear', 'employeeCount',
      'website', 'address', 'certificates', 'responseTime'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplier._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply for verification
exports.applyForVerification = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.userId });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // In a real app, you would upload documents and submit for review
    supplier.isVerified = true; // For demo, set to true
    await supplier.save();

    res.json({ message: 'Verification application submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get supplier stats (dashboard)
exports.getSupplierStats = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.userId });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const productCount = await Product.countDocuments({ supplier: supplier._id });
    
    // Get recent orders/inquiries (you'd need an Order model for this)
    // This is a placeholder for now

    res.json({
      productCount,
      totalViews: 1250, // Placeholder - would come from analytics
      totalInquiries: 45, // Placeholder
      averageRating: supplier.rating,
      monthlyGrowth: 12.5 // Placeholder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};