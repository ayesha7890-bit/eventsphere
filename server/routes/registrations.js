const express = require('express');
const Expo = require('../models/expo');
const ExhibitorRegistration = require('../models/ExhibitorRegistration');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Exhibitor expo ke liye register karta hai
router.post('/', protect, allowRoles('exhibitor'), async (req, res) => {
  try {
    const {
      expo, companyName, companyLogo, companyDescription, category,
      productsServices, website, contactPerson, contactEmail,
      contactPhone, address, preferredBoothSize, staffCount, documents
    } = req.body;

    const expoExists = await Expo.findById(expo);
    if (!expoExists) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    // Sirf zaroori fields lete hain. status/booth admin ka kaam hai.
    const registration = await ExhibitorRegistration.create({
      user: req.user.id,
      expo,
      companyName,
      companyLogo,
      companyDescription,
      category,
      productsServices,
      website,
      contactPerson,
      contactEmail,
      contactPhone,
      address,
      preferredBoothSize,
      staffCount,
      documents
    });

    res.status(201).json(registration);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You already registered for this expo' });
    }
    res.status(400).json({ message: err.message });
  }
});

// My Applications ka page ye raasta istemal karta hai
router.get('/my', protect, allowRoles('exhibitor'), async (req, res) => {
  try {
    const list = await ExhibitorRegistration.find({ user: req.user.id })
      .populate('expo', 'title startDate location')
      .populate('assignedBooth', 'code size')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;