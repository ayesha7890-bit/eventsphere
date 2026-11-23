const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const ExhibitorRegistration = require('../models/ExhibitorRegistration');
const authMod = require('../middleware/auth');

const auth =
  typeof authMod === 'function'
    ? authMod
    : Object.values(authMod).find((fn) => typeof fn === 'function');

// 1. Attendee kisi Exhibitor ko inquiry/message bheje
router.post('/', auth, async (req, res) => {

  try {
    const { exhibitorId, subject, message } = req.body;
    if (!exhibitorId || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const exApp = await ExhibitorRegistration.findById(exhibitorId);
    if (!exApp) {
      return res.status(404).json({ message: 'Exhibitor not found.' });
    }

    const receiverUserId = exApp.user || exApp.exhibitor || exApp.createdBy;
    if (!receiverUserId) {
      return res.status(400).json({ message: 'Exhibitor user account link not found.' });
    }
const senderId = String(req.user.id || req.user._id);
    if (String(receiverUserId) === senderId) {
      return res.status(400).json({ message: 'you cannot send a message to yourself.' });
    }
    const newMsg = await Message.create({
      sender: req.user.id || req.user._id,
      exhibitorApp: exApp._id,
      exhibitorUser: receiverUserId,
      expo: exApp.expo,
      subject,
      message
    });

    res.status(201).json({ message: 'Inquiry sent successfully!', data: newMsg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Logged-in user (Attendee ya Exhibitor) apne saare messages dekhe
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const query =
      req.user.role === 'exhibitor'
        ? { exhibitorUser: userId }
        : { sender: userId };

    const list = await Message.find(query)
      .populate('sender', 'name email')
      .populate('exhibitorApp', 'companyName category')
      .populate('expo', 'title')
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Exhibitor kisi inquiry ka reply bheje
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply khali nahi ho sakta.' });
    }

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message nahi mila.' });

    msg.reply = reply.trim();
    msg.repliedAt = new Date();
    await msg.save();

    res.json({ message: 'Reply sent!', data: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;