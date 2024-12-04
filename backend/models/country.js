const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    country_id: {
      type: String,
      required: true,
      unique: true,
    },
    country_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false, // No need for createdAt and updatedAt fields
  }
);

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
