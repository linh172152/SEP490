const RobotInteractionLog = require('../models/RobotInteractionLog');
const User = require('../models/User'); 
const Room = require('../models/Room');

const createLog = async (req, res) => {
  try {
    const { robotId, elderlyId, type, content, responseStatus } = req.body;

    const log = await RobotInteractionLog.create({
      robotId,
      elderlyId,
      type,
      content,
      responseStatus
      // isPrivate will be auto-calculated by the Schema pre-save hook based on 'type'
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create Log Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLogs = async (req, res) => {
  try {
    const { elderlyId } = req.query;
    const { role, id: userId } = req.user;

    let query = {};

    if (elderlyId) {
      query.elderlyId = elderlyId;
    }

    // Role-Based Filtering System
    
    if (role === 'CAREGIVER') {
        // Find elderly first to confirm Caregiver holds that Room mapping
        if (elderlyId) {
            const elderly = await User.findOne({ _id: elderlyId, role: 'ELDERLY' });
            if (!elderly) return res.status(404).json({ message: 'Elderly not found '});
            
            const roomMatch = await Room.findOne({ _id: elderly.roomId, caregiverId: userId });
            if (!roomMatch) return res.status(403).json({ message: 'Forbidden - Elderly outside care scope' });
        } else {
            // Need to limit all logs to ONLY elderly under their rooms
            const rooms = await Room.find({ caregiverId: userId }).select('_id');
            const roomIds = rooms.map(r => r._id);
            const managedElderly = await User.find({ roomId: { $in: roomIds }, role: 'ELDERLY' }).select('_id');
            query.elderlyId = { $in: managedElderly.map(e => e._id) };
        }

        // Caregiver is absolutely BLOCKED from seeing private logs (chat interactions)
        query.isPrivate = false;
    }

    if (role === 'FAMILY_MEMBER') {
        const managedElderly = await User.find({ familyId: userId, role: 'ELDERLY' }).select('_id');
        const familyElderlyIds = managedElderly.map(e => e._id.toString());
        
        if (elderlyId && !familyElderlyIds.includes(elderlyId.toString())) {
             return res.status(403).json({ message: 'Forbidden - Family access breach '});
        }
        
        if (!elderlyId) {
            query.elderlyId = { $in: familyElderlyIds };
        }
        
        // Family SEES EVERYTHING (Privacy filter removed so full chat is visible)
    }

    if (role === 'ADMIN') {
        // Admin SEES EVERYTHING
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await RobotInteractionLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('robotId', 'name')
      .populate('elderlyId', 'name');

    const total = await RobotInteractionLog.countDocuments(query);

    res.json({
      data: logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch Logs Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createLog,
  getLogs
};
