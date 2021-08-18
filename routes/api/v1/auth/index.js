// api/v1/auth

const expressJson = require('express').json();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const router = require('express').Router();

dotenv.config();

const sequelize = require('../../../../sequelize.js');
const authenticateJWT = require('../../../../middlewares/authenticateJWT');
const {
  validateSignIn,
  validateSignUp
} = require('./validate.js');
const { User } = require('../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'auth' });
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
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.userId } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user id' });
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

router.post('/sign-up', expressJson, async (req, res) => {
  try {
    // Validate input
    const error = validateSignUp(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    // Check if the user is already in database
    const emailExist = await User.findOne({ where: { email: req.body.email } });
    if (emailExist) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = User.build({
      email: req.body.email,
      passwordHash: hashedPassword
    });

    const savedUser = await user.save();

    const dataPayload = {
      id: savedUser.id,
      email: savedUser.email
    };

    return res.json({
      message: 'Success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
