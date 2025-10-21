const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/NurseController');
const authorizeRole = require('../middlewares/authorizeRole');

// Only Admin can add a nurse
router.post('/', authorizeRole(['Admin']), nurseController.createNurse);

// Other routes
router.get('/', nurseController.getAllNurses);
router.get('/:id', nurseController.getNurseById);
router.patch('/:id', authorizeRole(['Admin']), nurseController.updateNurse);
router.delete('/:id', authorizeRole(['Admin']), nurseController.deleteNurse);

module.exports = router;