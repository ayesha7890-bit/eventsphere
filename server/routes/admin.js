const express = require('express')
const Expo = require('../models/expo');
const ExhibitorRegistration = require('../models/ExhibitorRegistration');
const { protect, allowRoles } = require('../middleware/auth');
const Booth = require('../models/Booth');

const router = express.Router();

router.use(protect, allowRoles('admin'));
// EXPO
router.put('/expos/:id', async (req, res) => {
  try {
    const fields = ['title', 'description', 'theme', 'location', 'startDate', 'endDate', 'banner', 'status'];
    const updates = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const expo = await Expo.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!expo) return res.status(404).json({ message: 'Expo not found' });
    res.json(expo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.delete('/expos/:id', async (req, res) => {
  try {
    const expo = await Expo.findByIdAndDelete(req.params.id);
    if (!expo) return res.status(404).json({ message: 'Expo not found' });
    await ExhibitorRegistration.deleteMany({ expo: expo._id });
    res.json({ message: 'Expo deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// EXHIBITORS APPLICATION 
router.get('/registrations', async (req, res) => {
  try {
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.expo) filter.expo = req.query.expo;
    const list = await ExhibitorRegistration.find(filter)
      .populate('user', 'name email')
      .populate('expo', 'title')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/registrations/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    const reg = await ExhibitorRegistration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });

    reg.status = status;
    reg.rejectionReason = status === 'rejected' ? rejectionReason : undefined;
    reg.reviewedBy = req.user.id;
    reg.reviewedAt = new Date();
    await reg.save();
    res.json(reg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// BOOTHS

// 1. Get all booths of selected expo
router.get('/booths', async (req, res) => {
  try {
    const { expo } = req.query;

    if (!expo) {
      return res.status(400).json({ message: 'Expo ID is required' });
    }

    const booths = await Booth.find({ expo })
      .populate('assignedTo', 'companyName')
      .sort({ code: 1 });

    res.json(booths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 2. Add multiple booths
router.post('/booths', async (req, res) => {
  try {
    const { expo, codes, size } = req.body;

    if (!expo || !codes) {
      return res.status(400).json({
        message: 'Expo and booth codes are required'
      });
    }

    const expoExists = await Expo.findById(expo);

    if (!expoExists) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    const codeList = codes
      .split(',')
      .map(code => code.trim().toUpperCase())
      .filter(Boolean);

    let created = 0;
    const skipped = [];

    for (const code of codeList) {
      const exists = await Booth.findOne({ expo, code });

      if (exists) {
        skipped.push(code);
        continue;
      }

      await Booth.create({
        expo,
        code,
        size: size || 'medium'
      });

      created++;
    }

    res.status(201).json({
      message: 'Booths added successfully',
      created,
      skipped
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// 3. Delete free booth
router.delete('/booths/:id', async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);

    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    if (booth.assignedTo) {
      return res.status(400).json({
        message: 'Reserved booth cannot be deleted'
      });
    }

    await booth.deleteOne();

    res.json({ message: 'Booth deleted successfully' });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
const Session = require('../models/Session');

// GET all sessions for an expo
router.get('/sessions', async (req, res) => {
  try {
    const filter = req.query.expo ? { expo: req.query.expo } : {};
    const sessions = await Session.find(filter).sort({ startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a session
router.post('/sessions', async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a session
router.put('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a session
router.delete('/sessions/:id', async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;