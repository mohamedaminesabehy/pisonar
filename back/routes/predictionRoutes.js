const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// GET /api/predictions
// Lance le script Python et renvoie la liste triée des patients
router.get('/', predictionController.predictPatients);

module.exports = router;
