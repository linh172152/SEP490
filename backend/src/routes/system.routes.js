const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware'); // General JWT verify (Assume existing)
const { checkRole } = require('../middlewares/rbac.middleware');

const robotController = require('../controllers/robot.controller');
const interactionController = require('../controllers/interaction.controller');
const medicationController = require('../controllers/medication.controller');
const dashboardController = require('../controllers/dashboard.controller');


// Apply authentication to ALL API routes under this segment
router.use(authMiddleware);

// --- ROBOT MANAGEMENT --- 
router.post('/robots', checkRole(['ADMIN']), robotController.createRobot);
router.get('/robots', checkRole(['ADMIN', 'CAREGIVER']), robotController.getRobots);
router.get('/robots/:id', checkRole(['ADMIN', 'CAREGIVER']), robotController.getRobotById);
router.patch('/robots/:id', checkRole(['ADMIN', 'CAREGIVER']), robotController.updateRobot);

// --- ROBOT INTERACTION LOGS ---
router.post('/robot-logs', checkRole(['ADMIN', 'CAREGIVER']), interactionController.createLog);
// We validate explicitly in controller because Family/Caregiver have different payload responses dynamically
router.get('/robot-logs', checkRole(['ADMIN', 'CAREGIVER', 'FAMILY_MEMBER']), interactionController.getLogs); 

// --- MEDICATION SYSTEM ---
router.post('/medication', checkRole(['ADMIN', 'CAREGIVER']), medicationController.createReminder);
router.get('/medication', checkRole(['ADMIN', 'CAREGIVER', 'FAMILY_MEMBER']), medicationController.getReminders);
router.patch('/medication/:id', checkRole(['ADMIN', 'CAREGIVER']), medicationController.updateStatus);

// --- DASHBOARD AGGREGATES ---
router.get('/caregiver/my-room', checkRole(['CAREGIVER']), dashboardController.getCaregiverDashboard);
router.get('/family/my-elderly/:elderlyId', checkRole(['FAMILY_MEMBER']), dashboardController.getFamilyDashboard);

module.exports = router;
