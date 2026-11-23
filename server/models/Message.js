const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    exhibitorApp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExhibitorRegistration',
      required: true
    },
    exhibitorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo'
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    reply: {
      type: String,
      default: ''
    },
    repliedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);