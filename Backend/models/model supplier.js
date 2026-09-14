const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    enum: ['Manufacturer', 'Distributor', 'Wholesaler', 'Exporter'],
    required: true
  },
  categories: [{
    type: String,
    enum: ['electronics', 'textiles', 'machinery', 'agriculture']
  }],
  description: String,
  logo: String,
  coverImage: String,
  establishedYear: Number,
  employeeCount: String,
  website: String,
  address: {
    street: String,
    city: String,
    country: String,
    zipCode: String
  },
  certificates: [{
    name: String,
    file: String,
    issuedBy: String,
    validUntil: Date
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  responseTime: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Supplier', supplierSchema);