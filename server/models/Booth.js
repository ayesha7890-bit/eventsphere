const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema(
  {
    expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    // null matlab booth khali hai, warna us registration ki id
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ExhibitorRegistration', default: null }
  },
  { timestamps: true }
);

// Ek expo mein ek code (jaise A1) dobara nahi aa sakta
boothSchema.index({ expo: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Booth', boothSchema);
