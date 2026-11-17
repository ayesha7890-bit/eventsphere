const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
    title: { type: String, required: true, trim: true },
    speaker: { type: String, trim: true },
    description: String,
    room: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
