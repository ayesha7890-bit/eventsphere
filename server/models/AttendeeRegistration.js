const mongoose = require('mongoose');

const attendeeRegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },
    bookmarkedSessions: [
      {
        type: String, // Session ID ya title store karne ke liye
      },
    ],
    status: {
      type: String,
      default: 'registered',
    },
  },
  { timestamps: true }
);

// Ek attendee ek expo mein ek hi baar register ho
attendeeRegistrationSchema.index({ user: 1, expo: 1 }, { unique: true });

module.exports = mongoose.model('AttendeeRegistration', attendeeRegistrationSchema);