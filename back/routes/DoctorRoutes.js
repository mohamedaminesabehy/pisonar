const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/DoctorController');
const authorizeRole = require('../middlewares/authorizeRole');


// Only Admin can add a doctor
router.post('/', authorizeRole(['Admin']), doctorController.createDoctor);

router.get('/', doctorController.getAllDoctors);

router.get('/:id', doctorController.getDoctorById);

router.patch('/:id', authorizeRole(['Admin']), doctorController.updateDoctor);

router.delete('/:id', authorizeRole(['Admin']), doctorController.deleteDoctor);

module.exports = router;