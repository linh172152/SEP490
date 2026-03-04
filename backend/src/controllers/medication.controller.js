const MedicationReminder = require('../models/MedicationReminder');
const RobotInteractionLog = require('../models/RobotInteractionLog');
const User = require('../models/User'); 
const Room = require('../models/Room');

const createReminder = async (req, res) => {
  try {
    const { elderlyId, robotId, medicineName, scheduleTime } = req.body;
    
    // Quick validation to ensure schedule time is future parsing
    if (new Date(scheduleTime) < new Date()) {
        return res.status(400).json({ message: 'Schedule time must be in the future' });
    }

    const reminder = await MedicationReminder.create({
      elderlyId,
      robotId,
      medicineName,
      scheduleTime
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create Reminder Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getReminders = async (req, res) => {
  try {
    const { elderlyId } = req.query;
    const { role, id: userId } = req.user;

    let query = {};
    if (elderlyId) query.elderlyId = elderlyId;

    // RBAC Protection wrapper again
    if (role === 'CAREGIVER') {
       if (elderlyId) {
          const elderly = await User.findById(elderlyId);
          const room = await Room.findOne({ _id: elderly.roomId, caregiverId: userId });
          if (!room) return res.status(403).json({ message: 'Outside Caregiver access scope' });
       } else {
          const rooms = await Room.find({ caregiverId: userId }).select('_id');
          const managedElderly = await User.find({ roomId: { $in: rooms.map(r => r._id) } }).select('_id');
          query.elderlyId = { $in: managedElderly.map(e => e._id) };
       }
    }

    if (role === 'FAMILY_MEMBER') {
       const userFamilyElderly = await User.find({ familyId: userId }).select('_id');
       query.elderlyId = { $in: userFamilyElderly.map(e => e._id) };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reminders = await MedicationReminder.find(query)
      .sort({ scheduleTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('robotId', 'name')
      .populate('elderlyId', 'name');
      
    const total = await MedicationReminder.countDocuments(query);

    res.json({
        data: reminders,
        pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'taken' or 'missed'
    
    const reminder = await MedicationReminder.findByIdAndUpdate(
      req.params.id,
      { status, responseAt: new Date() },
      { new: true }
    );

    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    // Business Logic: Auto-generate interaction log on MISSED Medication
    if (status === 'missed') {
       await RobotInteractionLog.create({
           robotId: reminder.robotId,
           elderlyId: reminder.elderlyId,
           type: 'medication',
           content: `Auto-generated: Warning - Failed to take scheduled medication (${reminder.medicineName})`,
           responseStatus: 'ignored',
           isPrivate: false // Explicitly public to caregivers
       });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Update Reminder Status Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateStatus
};
