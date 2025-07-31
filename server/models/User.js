const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['consultation', 'payment', 'documentation', 'support', 'other'],
    default: 'other'
  },
  joinTime: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

userSchema.index({ joinTime: 1 });

userSchema.virtual('waitTime').get(function() {
  return Date.now() - this.joinTime.getTime();
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 