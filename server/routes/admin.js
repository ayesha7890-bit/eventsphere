const express = require('express');
const Expo = require('../models/expo');
const ExhibitorRegistration = require('../models/ExhibitorRegistration');
const Booth = require('../models/Booth');
const Session = require('../models/Session');
const User = require('../models/user');
const Feedback = require('../models/Feedback');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Is file ke SAARE routes sirf admin ke liye
router.use(protect, allowRoles('admin'));

// Body se sirf allowed fields uthata hai
function pick(body, fields) {
  const out = {};
  fields.forEach((f) => {
    if (body[f] !== undefined) out[f] = body[f];
  });
  return out;
}

// ================= EXPO =================
router.put('/expos/:id', async (req, res) => {
  try {
    const updates = pick(req.body, ['title', 'description', 'theme', 'location', 'startDate', 'endDate', 'banner', 'status']);
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
    // Expo ke saath uska baaqi data bhi saaf
    await ExhibitorRegistration.deleteMany({ expo: expo._id });
    await Booth.deleteMany({ expo: expo._id });
    await Session.deleteMany({ expo: expo._id });
    res.json({ message: 'Expo deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ================= EXHIBITOR APPLICATIONS =================
router.get('/registrations', async (req, res) => {
  try {
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.expo) filter.expo = req.query.expo;
    const list = await ExhibitorRegistration.find(filter)
      .populate('user', 'name email')
      .populate('expo', 'title')
      .populate('assignedBooth', 'code')
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

    // Reject hone par booth wapas khali ho jaye
    if (status === 'rejected' && reg.assignedBooth) {
      await Booth.updateOne({ _id: reg.assignedBooth }, { assignedTo: null });
      reg.assignedBooth = undefined;
    }

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

// ================= BOOTHS =================
router.get('/booths', async (req, res) => {
  try {
    const filter = req.query.expo ? { expo: req.query.expo } : {};
    const booths = await Booth.find(filter).populate('assignedTo', 'companyName').sort({ code: 1 });
    res.json(booths);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ek saath kai booth: codes = "A1, A2, A3"
router.post('/booths', async (req, res) => {
  try {
    const { expo, codes, size } = req.body;
    const list = [...new Set(String(codes || '').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean))];
    if (!expo || list.length === 0) {
      return res.status(400).json({ message: 'Expo and booth codes are required' });
    }
    if (!(await Expo.exists({ _id: expo }))) {
      return res.status(404).json({ message: 'Expo not found' });
    }
    const existing = await Booth.find({ expo, code: { $in: list } }).distinct('code');
    const fresh = list.filter((c) => !existing.includes(c));
    if (fresh.length > 0) {
      await Booth.insertMany(fresh.map((code) => ({ expo, code, size })));
    }
    res.status(201).json({ created: fresh.length, skipped: existing });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/booths/:id', async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) return res.status(404).json({ message: 'Booth not found' });
    if (booth.assignedTo) {
      return res.status(400).json({ message: 'Booth is assigned. Unassign it first' });
    }
    await booth.deleteOne();
    res.json({ message: 'Booth deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Booth assign / badlo / hatao (boothId null = unassign)
router.patch('/registrations/:id/booth', async (req, res) => {
  try {
    const { boothId } = req.body;
    const reg = await ExhibitorRegistration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (reg.status !== 'approved') {
      return res.status(400).json({ message: 'Approve the application before assigning a booth' });
    }
    if (boothId && String(reg.assignedBooth) === String(boothId)) {
      return res.json(reg);
    }

    // Pehle naya booth claim karo (sirf agar usi expo ka ho aur khali ho)
    let booth = null;
    if (boothId) {
      booth = await Booth.findOneAndUpdate(
        { _id: boothId, expo: reg.expo, assignedTo: null },
        { assignedTo: reg._id },
        { new: true }
      );
      if (!booth) return res.status(400).json({ message: 'Booth is not available' });
    }
    // Phir purana booth khali karo
    if (reg.assignedBooth) {
      await Booth.updateOne({ _id: reg.assignedBooth }, { assignedTo: null });
    }
    reg.assignedBooth = booth ? booth._id : undefined;
    await reg.save();
    res.json(reg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ================= SCHEDULE =================
const sessionFields = ['expo', 'title', 'speaker', 'description', 'room', 'startTime', 'endTime'];

router.get('/sessions', async (req, res) => {
  try {
    const filter = req.query.expo ? { expo: req.query.expo } : {};
    const sessions = await Session.find(filter).sort({ startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const data = pick(req.body, sessionFields);
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    const session = await Session.create(data);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/sessions/:id', async (req, res) => {
  try {
    const data = pick(req.body, sessionFields);
    if (data.startTime && data.endTime && new Date(data.endTime) <= new Date(data.startTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    const session = await Session.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ================= REPORTS =================
router.get('/reports', async (req, res) => {
  try {
    const [expos, exhibitors, attendees, sessions, booths, assignedBooths, byStatus, perExpo] = await Promise.all([
      Expo.countDocuments(),
      User.countDocuments({ role: 'exhibitor' }),
      User.countDocuments({ role: 'attendee' }),
      Session.countDocuments(),
      Booth.countDocuments(),
      Booth.countDocuments({ assignedTo: { $ne: null } }),
      ExhibitorRegistration.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ExhibitorRegistration.aggregate([
        {
          $group: {
            _id: '$expo',
            total: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
          }
        },
        { $lookup: { from: 'expos', localField: '_id', foreignField: '_id', as: 'expo' } },
        { $unwind: '$expo' },
        { $project: { _id: 0, title: '$expo.title', total: 1, approved: 1 } }
      ])
    ]);

    const registrations = { pending: 0, approved: 0, rejected: 0 };
    byStatus.forEach((s) => {
      registrations[s._id] = s.count;
    });

    res.json({
      totals: { expos, exhibitors, attendees, sessions, booths, assignedBooths },
      registrations,
      perExpo
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= FEEDBACK =================
router.get('/feedback', async (req, res) => {
  try {
    res.json(await Feedback.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/feedback/:id/resolve', async (req, res) => {
  try {
    const item = await Feedback.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Feedback not found' });
    item.resolved = !item.resolved;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
