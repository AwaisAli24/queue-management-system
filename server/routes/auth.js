const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const AuthUser = require('../models/AuthUser');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
};

const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const userExists = await AuthUser.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const user = await AuthUser.create({
      username,
      password,
      role: role || 'staff'
    });

    if (user) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          role: user.role
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const user = await AuthUser.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Google authentication failed`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Google authentication failed`);
    }

    const token = generateToken(user._id);
    
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  })(req, res, next);
};

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router; 