const express = require('express');
const mongoose = require('mongoose');
const Booth = require('../models/Booth');
const ExhibitorRegistration = require('../models/ExhibitorRegistration');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Is file ke saare raaste sirf exhibitor ke liye
router.use(protect, allowRoles('exhibitor'));

// Ek expo ke booths aur meri registration ka status
router.get('/expo/:expoId', async (req, res) => {
  try {
    const { expoId } = req.params;
    if (!mongoose.isValidObjectId(expoId)) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    const registration = await ExhibitorRegistration.findOne({
      user: req.user.id,
      expo: expoId
    }).select('status assignedBooth rejectionReason');

    const booths = await Booth.find({ expo: expoId })
      .populate('assignedTo', 'companyName')
      .sort({ code: 1 });

    res.json({ registration, booths });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Booth reserve karna
router.post('/:boothId/reserve', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.boothId)) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    const booth = await Booth.findById(req.params.boothId);
    if (!booth) return res.status(404).json({ message: 'Booth not found' });

    const reg = await ExhibitorRegistration.findOne({ user: req.user.id, expo: booth.expo });
    if (!reg) {
      return res.status(400).json({ message: 'Apply for this expo first' });
    }
    if (reg.status !== 'approved') {
      return res.status(400).json({ message: 'Your application is not approved yet' });
    }

    const already = await Booth.exists({ expo: booth.expo, assignedTo: reg._id });
    if (reg.assignedBooth || already) {
      return res.status(400).json({ message: 'You already have a booth for this expo' });
    }

    // Booth tabhi milega jab abhi khali ho
    const taken = await Booth.findOneAndUpdate(
      { _id: booth._id, assignedTo: null },
      { assignedTo: reg._id },
      { new: true }
    );
    if (!taken) {
      return res.status(409).json({ message: 'This booth was just taken. Please choose another.' });
    }

    reg.assignedBooth = booth._id;
    await reg.save();

    res.json({ message: 'Booth reserved', booth: taken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;