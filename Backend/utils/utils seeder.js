const mongoose = require('mongoose');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Smartphone X12",
    description: "Latest smartphone with advanced features",
    category: "electronics",
    price: 599.99,
    unit: "piece",
    minOrderQuantity: 10,
    stock: 1000,
    images: ["https://example.com/phone.jpg"],
    specifications: [
      { key: "RAM", value: "8GB" },
      { key: "Storage", value: "128GB" }
    ]
  },
  {
    name: "Cotton Fabric Roll",
    description: "High-quality cotton fabric for garments",
    category: "textiles",
    price: 4.99,
    unit: "meter",
    minOrderQuantity: 100,
    stock: 5000,
    images: ["https://example.com/fabric.jpg"]
  },
  // Add more sample products
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await Product.deleteMany({});
    
    // Create a sample supplier
    const supplier = await Supplier.findOne();
    
    if (supplier) {
      // Add products with supplier reference
      const productsWithSupplier = sampleProducts.map(product => ({
        ...product,
        supplier: supplier._id
      }));
      
      await Product.insertMany(productsWithSupplier);
      console.log('Database seeded successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();