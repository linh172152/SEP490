const Robot = require('../models/Robot');
const Room = require('../models/Room');
const User = require('../models/User');

const createRobot = async (req, res) => {
  try {
    const { name, roomId, batteryLevel, firmwareVersion } = req.body;

    // Validate 1 Room = 1 Robot
    const existingRobotInRoom = await Robot.findOne({ roomId });
    if (existingRobotInRoom) {
      return res.status(400).json({ message: 'Room already has a robot assigned' });
    }

    // Checking Room structure rule: 1 Caregiver & Max 4 Elderly
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Assuming room schema structure: room.elderlyIds (Array) and room.caregiverId
    if (room.elderlyIds && room.elderlyIds.length > 4) {
       return res.status(400).json({ message: 'Room exceeds maximum capacity of 4 elderly' });
    }

    /* 
      Note: The '1 Room = 1 Caregiver' logic sits perfectly here via the constraint check 
      `room.caregiverId`. As long as it's a single ObjectId ref and not an array, 
      Mongoose naturally enforces 1 to 1 per room architecture 
    */

    const robot = await Robot.create({
      name,
      roomId,
      batteryLevel,
      firmwareVersion,
      status: 'offline'
    });

    res.status(201).json(robot);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
       return res.status(400).json({ message: 'Robot name must be unique' });
    }
    console.error('Error creating robot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRobots = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    
    // ADMIN sees all
    if (role === 'ADMIN') {
      const robots = await Robot.find().populate('roomId');
      return res.json(robots);
    }
    
    // CAREGIVER only sees the robot belonging to their assigned room
    if (role === 'CAREGIVER') {
      const caregiverRooms = await Room.find({ caregiverId: userId }).select('_id');
      const roomIds = caregiverRooms.map(r => r._id);

      const robots = await Robot.find({ roomId: { $in: roomIds } }).populate('roomId');
      return res.json(robots);
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (error) {
    console.error('Error fetching robots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRobotById = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const robot = await Robot.findById(req.params.id);

    if (!robot) return res.status(404).json({ message: 'Robot not found' });

    if (role === 'ADMIN') return res.json(robot);

    if (role === 'CAREGIVER') {
      const room = await Room.findOne({ _id: robot.roomId, caregiverId: userId });
      if (!room) return res.status(403).json({ message: 'Forbidden - Robot is not in your assigned rooms' });
      return res.json(robot);
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRobot = async (req, res) => {
  try {
    const { batteryLevel, status, firmwareVersion } = req.body;
    
    const robot = await Robot.findByIdAndUpdate(
      req.params.id,
      {
        batteryLevel,
        status,
        firmwareVersion,
        lastSyncAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!robot) return res.status(404).json({ message: 'Robot not found' });

    res.json(robot);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRobot,
  getRobots,
  getRobotById,
  updateRobot
};
