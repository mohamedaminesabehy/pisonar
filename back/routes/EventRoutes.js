const express = require('express');
const router = express.Router();
const eventController = require('../controllers/EventController');
const authorizeRole = require('../middlewares/authorizeRole');
const authenticate = require('../routes/profileRoutes'); // Assuming authenticate middleware is here

// Only Admin can create, update, or delete events
router.post('/', authenticate, authorizeRole(['Admin']), eventController.createEvent);
router.get('/', authenticate, eventController.getAllEvents);
router.get('/:id', authenticate, eventController.getEventById);
router.put('/:id', authenticate, authorizeRole(['Admin']), eventController.updateEvent);
router.delete('/:id', authenticate, authorizeRole(['Admin']), eventController.deleteEvent);
router.post("/export-pdf", authenticate, authorizeRole(["Admin"]), eventController.exportScheduleToPDF);

module.exports = router;