const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplier);
router.get('/:id/products', supplierController.getSupplierProducts);

// Protected routes (supplier only)
router.put('/profile', auth, supplierController.updateSupplier);
router.post('/verify', auth, supplierController.applyForVerification);
router.get('/stats/dashboard', auth, supplierController.getSupplierStats);

module.exports = router;