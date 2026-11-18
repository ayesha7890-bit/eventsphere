const mongoose = require('mongoose');

const exhibitorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    companyLogo: String,
    companyDescription: String,
    category: String,
    productsServices: [String],
    website: String,
    contactPerson: String,
    contactEmail: String,
    contactPhone: String,
    address: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExhibitorProfile', exhibitorProfileSchema);