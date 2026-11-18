const express = require('express');
const ExhibitorProfile = require('../models/ExhibitorProfile');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Apni profile dekhna (nahi bani to null)
router.get('/me', protect, allowRoles('exhibitor'), async (req, res) => {
  try {
    const profile = await ExhibitorProfile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile banana ya badalna
router.put('/me', protect, allowRoles('exhibitor'), async (req, res) => {
  try {
    const {
      companyName, companyLogo, companyDescription, category,
      productsServices, website, contactPerson, contactEmail,
      contactPhone, address
    } = req.body;

    const profile = await ExhibitorProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        companyName, companyLogo, companyDescription, category,
        productsServices, website, contactPerson, contactEmail,
        contactPhone, address
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;