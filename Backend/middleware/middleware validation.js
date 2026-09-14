const { body, validationResult } = require('express-validator');

// Validation rules for different operations
const validate = {
  // Product validation
  product: [
    body('name').notEmpty().withMessage('Product name is required').trim(),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['electronics', 'textiles', 'machinery', 'agriculture']).withMessage('Invalid category'),
    body('price').isNumeric().withMessage('Price must be a number').custom(value => value >= 0),
    body('unit').isIn(['piece', 'kg', 'ton', 'meter', 'set']).withMessage('Invalid unit'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer')
  ],

  // Supplier validation
  supplier: [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('businessType').isIn(['Manufacturer', 'Distributor', 'Wholesaler', 'Exporter']),
    body('categories').isArray().withMessage('Categories must be an array')
  ],

  // Message validation
  message: [
    body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
    body('content').notEmpty().withMessage('Message content is required').trim()
  ],

  // Category validation
  category: [
    body('name').notEmpty().withMessage('Category name is required').trim(),
    body('description').optional().trim()
  ],

  // Handle validation results
  handleErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    next();
  }
};

module.exports = validate;