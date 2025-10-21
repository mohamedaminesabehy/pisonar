// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/process', chatbotController.processQuery);

module.exports = router;