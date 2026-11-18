const express = require('express');
const router = express.Router();
const AttendeeRegistration = require('../models/AttendeeRegistration');
const ExhibitorRegistration = require('../models/ExhibitorRegistration');
const Expo = require('../models/expo');
const { protect, allowRoles } = require('../middleware/auth');

// 1. Attendee kisi expo ke liye register kare
router.post('/register/:expoId', protect, allowRoles('attendee'), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.expoId);
    if (!expo) return res.status(404).json({ message: 'Expo not found' });

    const existing = await AttendeeRegistration.findOne({
      user: req.user.id,
      expo: req.params.expoId,
    });
    if (existing) {
      return res.status(400).json({ message: 'Aap is expo ke liye pehle hi register hain' });
    }

    const reg = await AttendeeRegistration.create({
      user: req.user.id,
      expo: req.params.expoId,
    });

    res.status(201).json({ message: 'Successfully registered for Expo!', registration: reg });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 2. Attendee apni registered expos aur bookmarked sessions dekhe
router.get('/my-events', protect, allowRoles('attendee'), async (req, res) => {
  try {
    const events = await AttendeeRegistration.find({ user: req.user.id })
      .populate('expo')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 3. Session Bookmark / Unbookmark toggle karein
router.post('/bookmark/:expoId', protect, allowRoles('attendee'), async (req, res) => {
  try {
    const { sessionTitle } = req.body;
    let reg = await AttendeeRegistration.findOne({
      user: req.user.id,
      expo: req.params.expoId,
    });

    // Agar pehle register nahi hai to auto-register karke bookmark kar dein
    if (!reg) {
      reg = await AttendeeRegistration.create({
        user: req.user.id,
        expo: req.params.expoId,
        bookmarkedSessions: [sessionTitle],
      });
      return res.json({ message: 'Registered & Session Bookmarked!', bookmarkedSessions: reg.bookmarkedSessions });
    }

    const index = reg.bookmarkedSessions.indexOf(sessionTitle);
    if (index > -1) {
      reg.bookmarkedSessions.splice(index, 1); // Remove bookmark
    } else {
      reg.bookmarkedSessions.push(sessionTitle); // Add bookmark
    }

    await reg.save();
    res.json({ message: 'Bookmarks updated', bookmarkedSessions: reg.bookmarkedSessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 4. Approved Exhibitors Search & Filter (Directory)
router.get('/exhibitors', async (req, res) => {
  try {
    const { search, category, expoId } = req.query;
    const filter = { status: 'approved' };

    if (expoId) filter.expo = expoId;
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { companyDescription: { $regex: search, $options: 'i' } },
        { productsServices: { $regex: search, $options: 'i' } },
      ];
    }

    const exhibitors = await ExhibitorRegistration.find(filter)
      .populate('expo', 'title location date')
      .select('-documents');

    res.json(exhibitors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;