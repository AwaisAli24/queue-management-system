const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Add a new user to the queue
// @route   POST /api/queue
// @access  Public
const addToQueue = async (req, res, next) => {
  try {
    const { name, serviceType } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const user = await User.create({
      name,
      serviceType: serviceType || 'other',
      joinTime: new Date()
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User added to queue successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in queue (sorted by joinTime)
// @route   GET /api/queue
// @access  Public
const getQueue = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ joinTime: 1 }) // Sort by joinTime ascending (oldest first)
      .select('-__v');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a user from the queue
// @route   DELETE /api/queue/:id
// @access  Public
const removeFromQueue = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found in queue'
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'User removed from queue successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get queue statistics
// @route   GET /api/queue/stats
// @access  Public
const getQueueStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    
    const serviceTypeStats = await User.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      }
    ]);

    const averageWaitTime = await User.aggregate([
      {
        $addFields: {
          waitTime: { $subtract: [new Date(), '$joinTime'] }
        }
      },
      {
        $group: {
          _id: null,
          avgWaitTime: { $avg: '$waitTime' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        serviceTypeStats,
        averageWaitTime: averageWaitTime[0]?.avgWaitTime || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

router.post('/', addToQueue);
router.get('/', getQueue);
router.get('/stats', getQueueStats);
router.delete('/:id', removeFromQueue);

module.exports = router; 