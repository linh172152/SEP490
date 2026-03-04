const cron = require('node-cron');
const MedicationReminder = require('../models/MedicationReminder');
const RobotInteractionLog = require('../models/RobotInteractionLog');

/**
 * Sweeps the database every 5 minutes looking for medications that 
 * were scheduled over 30 minutes ago and are still marked 'pending'.
 * Maps them to 'missed' and automatically dispatches a Robot Interaction Warning.
 */
const checkMissedMedications = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000); // 30 mins in ms
    
    // Find all unresponded medicines that expired over 30 mins ago
    const pendingMedications = await MedicationReminder.find({
      status: 'pending',
      scheduleTime: { $lt: thirtyMinutesAgo }
    });

    if (pendingMedications.length === 0) return;

    for (const reminder of pendingMedications) {
       // Mark as missed
       reminder.status = 'missed';
       reminder.responseAt = new Date();
       await reminder.save();

       // Issue the auto interaction log
       await RobotInteractionLog.create({
         robotId: reminder.robotId,
         elderlyId: reminder.elderlyId,
         type: 'medication',
         content: `Auto-generated: Warning - Elapsed 30 mins and failed to take scheduled medication (${reminder.medicineName})`,
         responseStatus: 'ignored',
         isPrivate: false 
       });
       
       console.log(`[Auto-Cron] Marked medication ID ${reminder._id} as missed. Dispatching Warning.`);
    }

  } catch (error) {
    console.error('[Auto-Cron] Error checking missed medications:', error);
  }
};

// Schedule it to run every 5 minutes 
const initCronJobs = () => {
    cron.schedule('*/5 * * * *', checkMissedMedications);
    console.log('[Cron Job] Medication reminder sweeper initialized (Interval: 5m)');
};

module.exports = { initCronJobs };
