// routes/eventSchedulerRoutes.js

const express = require('express');
const router = express.Router();
const schedulerCtrl = require('../controllers/eventModelController');

// POST /api/schedule/weekly
router.post('/weekly', schedulerCtrl.runWeeklySchedule);

module.exports = router;
