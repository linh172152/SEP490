const mongoose = require('mongoose');

const robotInteractionLogSchema = new mongoose.Schema(
  {
    robotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Robot',
      required: [true, 'Robot ID is required'],
    },
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming elderly is stored in a User collection or Elderly collection
      required: [true, 'Elderly ID is required'],
    },
    type: {
      type: String,
      enum: ['medication', 'chat', 'emotion'],
      required: [true, 'Interaction type is required'],
    },
    content: {
      type: String,
      required: [true, 'Interaction content is required'],
    },
    responseStatus: {
      type: String,
      enum: ['taken', 'ignored', 'refused', null],
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Business Logic Middleware: Force isPrivate depending on type before saving
robotInteractionLogSchema.pre('save', function (next) {
  if (this.type === 'chat') {
    this.isPrivate = true;
  } else if (this.type === 'medication') {
    this.isPrivate = false;
  }
  next();
});

// Indexes
robotInteractionLogSchema.index({ robotId: 1 });
robotInteractionLogSchema.index({ elderlyId: 1 });
robotInteractionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RobotInteractionLog', robotInteractionLogSchema);
