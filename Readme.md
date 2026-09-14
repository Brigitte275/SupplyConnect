# SupplyConnect API Documentation

## Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

## Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (supplier only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier details
- `GET /api/suppliers/:id/products` - Get supplier's products

## Messages
- `GET /api/messages` - Get user's messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read