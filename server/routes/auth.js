const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Public signup can only be exhibitor or attendee. Admin is created by hand.
    const userRole = ['exhibitor', 'attendee'].includes(role) ? role : 'attendee';

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashed,
      role: userRole,
      phone
    });

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Forgot password: reset link banata hai
router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const reply = { message: 'If this email is registered, a reset link has been created.' };
    const user = await User.findOne({ email });
    if (!user) return res.json(reply);

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = hashToken(token); // database mein sirf hash save hota hai
    user.resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Email service nahi hai, to link sirf development mein seedha response mein aata hai.
    // Production mein ye link email (nodemailer) se bhejna hoga.
    if (process.env.NODE_ENV !== 'production') {
      const base = process.env.CLIENT_URL || 'http://localhost:5173';
      reply.resetLink = base + '/reset-password/' + token;
    }
    res.json(reply);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password: naya password set karta hai
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({
      resetToken: hashToken(req.params.token),
      resetTokenExpire: { $gt: new Date() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or expired' });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    res.json({ message: 'Password updated. You can log in now.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;