const mongoose = require('mongoose');

const medicationReminderSchema = new mongoose.Schema(
  {
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: [true, 'Elderly ID is required'],
    },
    robotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Robot',
      required: [true, 'Robot ID is required for dispatching'],
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    scheduleTime: {
      type: Date,
      required: [true, 'Schedule time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'taken', 'missed'],
      default: 'pending',
    },
    responseAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast cron resolution
medicationReminderSchema.index({ scheduleTime: 1, status: 1 });
medicationReminderSchema.index({ elderlyId: 1 });

module.exports = mongoose.model('MedicationReminder', medicationReminderSchema);
