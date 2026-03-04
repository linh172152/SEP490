const mongoose = require('mongoose');

const robotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Robot name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Robot name must be at least 3 characters'],
      maxlength: [30, 'Robot name cannot exceed 30 characters'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
      unique: true, // 1 Room = 1 Robot
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    firmwareVersion: {
      type: String,
      default: '1.0.0',
    },
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
robotSchema.index({ roomId: 1 });
robotSchema.index({ status: 1 });

module.exports = mongoose.model('Robot', robotSchema);
