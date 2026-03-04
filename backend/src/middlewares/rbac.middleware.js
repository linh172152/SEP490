const Room = require('../models/Room'); // Assuming Room model exists
const User = require('../models/User'); // Assuming User model exists

/**
 * Basic Role Check Middleware
 * @param {Array<string>} allowedRoles ['ADMIN', 'CAREGIVER', 'FAMILY_MEMBER']
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Unauthorized - No role found' });
      }

      if (!allowedRoles.includes(req.user.role)) {
         return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};

/**
 * Caregiver Room Access Authorization Middleware
 * Validates that CAREGIVER is only accessing data inside a room assigned to them.
 * Admin bypasses entirely.
 */
const checkRoomAccess = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const roomId = req.params.roomId || req.body.roomId || req.query.roomId;

    if (!roomId) {
        return res.status(400).json({ message: 'Room ID is required for access check' });
    }

    if (role === 'ADMIN') return next();

    if (role === 'CAREGIVER') {
       // Validate assignment connection
       // Wait for Room model implementation mapping: { _id: roomId, caregiverId: req.user.id }
       const room = await Room.findOne({ _id: roomId, caregiverId: userId });
       
       if (!room) {
           return res.status(403).json({ message: 'Forbidden - You are not assigned to this room' });
       }
       return next();
    }

    // Default deny for other roles attempting explicit room access
    return res.status(403).json({ message: 'Forbidden - Room access restricted to Caregivers and Admins' });
  } catch (error) {
    console.error('Room access check error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Family Member Elderly Access Authorization Middleware
 * Validates that FAMILY_MEMBER is only checking on elderly under their explicit custody tree.
 * Admin bypasses entirely.
 */
const checkElderlyAccess = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const elderlyId = req.params.elderlyId || req.body.elderlyId || req.query.elderlyId;

    if (!elderlyId) {
        return res.status(400).json({ message: 'Elderly ID is required for access check' });
    }

    if (role === 'ADMIN') return next();

    if (role === 'FAMILY_MEMBER') {
       // Validate family tree connection
       // User model represents the Elderly here: { _id: elderlyId, familyId: req.user.id }
       const elderly = await User.findOne({ _id: elderlyId, familyId: userId, role: 'ELDERLY' });
       
       if (!elderly) {
           return res.status(403).json({ message: 'Forbidden - This elderly is not assigned to your family' });
       }
       return next();
    }
    
    // CAREGIVERS accessing specific Elderly also need to be validated if they own the room that elderly is in
    if (role === 'CAREGIVER') {
       const elderly = await User.findOne({ _id: elderlyId, role: 'ELDERLY' });
       if (!elderly || !elderly.roomId) return res.status(404).json({ message: 'Elderly or Room association not found' });
       
       const room = await Room.findOne({ _id: elderly.roomId, caregiverId: userId });
       if (!room) {
           return res.status(403).json({ message: 'Forbidden - Elderly is not within a room you manage' });
       }
       return next();
    }

    return res.status(403).json({ message: 'Forbidden - Invalid access clearance' });
  } catch (error) {
    console.error('Elderly access check error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  checkRole,
  checkRoomAccess,
  checkElderlyAccess
};
