const mongoose = require('mongoose');

const exhibitorRegistrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },

    companyName: { type: String, required: true, trim: true },
    companyLogo: String,
    companyDescription: { type: String, required: true },
    category: { type: String, required: true },
    productsServices: { type: [String], required: true },
    website: String,

    contactPerson: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: String,

    preferredBoothSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true
    },
    staffCount: Number,

    documents: [{ name: String, url: String }],

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String,
    assignedBooth: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
  { timestamps: true }
);


exhibitorRegistrationSchema.index({ user: 1, expo: 1 }, { unique: true });

module.exports = mongoose.model('ExhibitorRegistration', exhibitorRegistrationSchema);