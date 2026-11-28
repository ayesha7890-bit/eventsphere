const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Koi bhi (login ke bagair) feedback ya issue bhej sakta hai
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    await Feedback.create({ name, email, message });
    res.status(201).json({ message: 'Feedback received' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
