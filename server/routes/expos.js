const express = require('express');
const Expo = require('../models/expo');
const Session = require('../models/Session');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Sab expos dekhna (koi bhi dekh sakta hai)
router.get('/', async (req, res) => {
  try {
    const expos = await Expo.find().sort({ startDate: 1 });
    res.json(expos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ek expo dekhna
router.get('/:id', async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ message: 'Expo not found' });
    res.json(expo);
  } catch (err) {
    res.status(404).json({ message: 'Expo not found' });
  }
});

// Ek expo ke sessions (schedule), koi bhi dekh sakta hai
router.get('/:id/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ expo: req.params.id }).sort({ startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(404).json({ message: 'Expo not found' });
  }
});

// Naya expo banana (sirf admin)
router.post('/', protect, allowRoles('admin'), async (req, res) => {
  try {
    const expo = await Expo.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(expo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// const Session = require('../models/Session');

router.get('/:id/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ expo: req.params.id }).sort({ startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;