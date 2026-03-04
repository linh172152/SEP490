const Room = require('../models/Room');
const Robot = require('../models/Robot');
const User = require('../models/User');
const MedicationReminder = require('../models/MedicationReminder');
const RobotInteractionLog = require('../models/RobotInteractionLog');

// CAREGIVER DASHBOARD View
const getCaregiverDashboard = async (req, res) => {
  try {
    const caregiverId = req.user.id;
    
    // Find assigned room
    const roomInfo = await Room.findOne({ caregiverId }).populate('elderlyIds');
    if (!roomInfo) {
      return res.status(404).json({ message: 'No active room assignment found' });
    }

    // Capture bound Robot
    const robotStatus = await Robot.findOne({ roomId: roomInfo._id });

    // Build the rich elderly payloads
    const elderlyList = [];
    for (const elID of roomInfo.elderlyIds) {
      const elderly = await User.findById(elID).select('-password');
      if (!elderly) continue;

      // Only today's medication
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const medicationToday = await MedicationReminder.find({ 
        elderlyId: elID,
        scheduleTime: { $gte: startOfDay, $lte: endOfDay }
      });

      // Quick mood summary calculated from emotionally driven interaction logs (Private ignored, CAREGIVER is safe here)
      const recentInteractions = await RobotInteractionLog.find({ 
          elderlyId: elID, 
          isPrivate: false 
      }).sort({ createdAt: -1 }).limit(10);
      
      const lastInteraction = recentInteractions.length > 0 ? recentInteractions[0] : null;

      elderlyList.push({
        id: elderly._id,
        name: elderly.name,
        medicationToday,
        lastInteraction,
        stats: { interactionCount: recentInteractions.length }
      });
    }

    return res.json({
       roomInfo: { id: roomInfo._id, name: roomInfo.name },
       robotStatus: robotStatus ? { id: robotStatus._id, name: robotStatus.name, status: robotStatus.status, battery: robotStatus.batteryLevel } : null,
       elderlyList
    });
  } catch (error) {
    console.error('Caregiver Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// FAMILY DASHBOARD View
const getFamilyDashboard = async (req, res) => {
  try {
     const { id: familyUserId } = req.user;
     const elderlyId = req.params.elderlyId;

     const elderlyInfo = await User.findOne({ _id: elderlyId, familyId: familyUserId, role: 'ELDERLY' }).select('-password');
     if (!elderlyInfo) {
       return res.status(403).json({ message: 'Forbidden - Unrecognized family link' });
     }

     const medicationHistory = await MedicationReminder.find({ elderlyId }).sort({ scheduleTime: -1 }).limit(20);
     
     // Family gets EVERYTHING (isPrivate = true | false)
     const chatHistory = await RobotInteractionLog.find({ elderlyId }).sort({ createdAt: -1 }).limit(50);
     
     const emotionalTrend = chatHistory
        .filter(log => log.type === 'emotion')
        .map(log => ({ time: log.createdAt, score: log.content.includes('happy') ? 8 : log.content.includes('sad') ? 3 : 5 }));

     return res.json({
        elderlyInfo,
        medicationHistory,
        emotionalTrend,
        chatHistory
     });
  } catch (error) {
    console.error('Family Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCaregiverDashboard,
  getFamilyDashboard
};
