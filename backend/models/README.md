# Supreme Cheta E-commerce Models

This directory contains all the database models for the Supreme Cheta e-commerce platform. Each model represents a different entity in our system.

## Core Models

### User Related
- `user.js` - User accounts and authentication
- `user_session.js` - User login sessions
- `address.js` - User shipping/billing addresses

### Product Related
- `product.js` - Product information
- `category.js` - Product categories
- `brand.js` - Product brands
- `product_image.js` - Product images
- `product_tag.js` - Product tags for search/filtering

### Order Related
- `order.js` - Customer orders
- `order_item.js` - Individual items in an order
- `payment.js` - Payment information
- `shipping.js` - Shipping details

### Features
- `wishlist.js` - User wishlists
- `shopping_cart.js` - Shopping cart
- `review.js` - Product reviews
- `coupon.js` - Discount coupons
- `notification.js` - User notifications
- `audit_log.js` - System audit logs

## Model Structure
Each model follows this basic structure:
```javascript
const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    // Fields definition
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Methods and middleware
modelSchema.methods.someMethod = function() {
    // Method implementation
};

// Export the model
module.exports = mongoose.model('ModelName', modelSchema);
```

## Best Practices
1. All fields should have proper validation
2. Use appropriate data types and references
3. Include helpful comments for complex logic
4. Add timestamps for tracking creation/updates
5. Use enum for fields with fixed values
6. Index fields that are frequently queried
