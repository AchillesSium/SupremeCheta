const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
      ref: 'User', // Assumes there is a User model
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postal_code: {
      type: String,
      required: true,
    },
    country_id: {
      type: String, // Unique identifier for the country (e.g., ISO code)
      required: true,
    },
    country_name: {
      type: String,
      required: true,
    },
    is_default: {
      type: Boolean,
      default: false, // Indicates if the address is the default for the user
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
