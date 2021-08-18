// api/v1/auth

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const expressJson = require('express').json();

const authenticateJWT = require('../../../../../middlewares/authenticateJWT');
const { validateSignIn } = require('./validate.js');
const { User, Admin } = require('../../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'admin/auth' });
});

router.post('/sign-in', expressJson, async (req, res) => {
  try {
    // Validate input
    const error = validateSignIn(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is admin
    const admin = await Admin.findOne({
      where: { UserId: user.id }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const dataPayload = {
      id: user.id,
      email: user.email
    };

    const accessToken = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET || 'tokensecret');
    return res.json({
      accessToken,
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.userId } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    // Check if user is admin
    const admin = await Admin.findOne({
      where: { UserId: user.id }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const dataPayload = {
      id: user.id,
      email: user.email
    };

    const accessToken = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET || 'tokensecret');
    return res.json({
      accessToken,
      data: dataPayload
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
