const express = require('express');
const router = express.Router();
const User = require('../models/User');

const calculatePredictedWaitTime = (queueLength, timeOfDay, serviceType) => {
  const baseTimePerPerson = 5;
  
  const hour = new Date().getHours();
  let timeMultiplier = 1;
  
  if (hour >= 9 && hour <= 11) timeMultiplier = 1.5;
  else if (hour >= 14 && hour <= 16) timeMultiplier = 1.3;
  else if (hour >= 17 && hour <= 19) timeMultiplier = 1.8;
  
  const serviceMultipliers = {
    'consultation': 1.5,
    'payment': 0.8,
    'documentation': 2.0,
    'support': 1.2,
    'other': 1.0
  };
  
  const serviceMultiplier = serviceMultipliers[serviceType] || 1.0;
  
  const predictedMinutes = queueLength * baseTimePerPerson * timeMultiplier * serviceMultiplier;
  
  return Math.round(predictedMinutes);
};

const predictWaitTime = async (req, res, next) => {
  try {
    const { queueLength, timeOfDay, serviceType } = req.body;
    
    let currentQueueLength = queueLength;
    if (!currentQueueLength) {
      currentQueueLength = await User.countDocuments();
    }
    
    const currentTime = timeOfDay || new Date();
    
    const currentServiceType = serviceType || 'other';
    
    const predictedWaitTime = calculatePredictedWaitTime(
      currentQueueLength,
      currentTime,
      currentServiceType
    );
    
    const queueStats = await User.aggregate([
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
        predictedWaitTimeMinutes: predictedWaitTime,
        predictedWaitTimeFormatted: `${predictedWaitTime} minutes`,
        currentQueueLength,
        serviceType: currentServiceType,
        timeOfDay: currentTime,
        queueStats,
        averageWaitTime: averageWaitTime[0]?.avgWaitTime || 0,
        factors: {
          baseTimePerPerson: 5,
          timeMultiplier: currentTime.getHours() >= 9 && currentTime.getHours() <= 11 ? 1.5 : 
                         currentTime.getHours() >= 14 && currentTime.getHours() <= 16 ? 1.3 :
                         currentTime.getHours() >= 17 && currentTime.getHours() <= 19 ? 1.8 : 1,
          serviceMultiplier: {
            'consultation': 1.5,
            'payment': 0.8,
            'documentation': 2.0,
            'support': 1.2,
            'other': 1.0
          }[currentServiceType] || 1.0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPredictionInfo = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        algorithm: 'Simple Linear Prediction',
        description: 'Predicts wait time based on queue length, time of day, and service type',
        factors: {
          baseTimePerPerson: '5 minutes per person',
          timeMultipliers: {
            'Morning Rush (9-11 AM)': 1.5,
            'Afternoon Rush (2-4 PM)': 1.3,
            'Evening Rush (5-7 PM)': 1.8,
            'Other Times': 1.0
          },
          serviceMultipliers: {
            'consultation': 1.5,
            'payment': 0.8,
            'documentation': 2.0,
            'support': 1.2,
            'other': 1.0
          }
        },
        formula: 'Wait Time = Queue Length × Base Time × Time Multiplier × Service Multiplier'
      }
    });
  } catch (error) {
    next(error);
  }
};

router.post('/', predictWaitTime);
router.get('/info', getPredictionInfo);

module.exports = router; 