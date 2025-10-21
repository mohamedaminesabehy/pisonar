const express = require('express');
const router = express.Router();
const dischargeController = require('../controllers/DischargeController');



router.patch('/:id', dischargeController.dischargePatient);

module.exports = router;