const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig'); // Adjust path to your multer config
const {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  updateEmergency,
  deleteEmergency
} = require('../controllers/emergencyController'); // Adjust path to your controller

router.post('/', upload.single('image'), createEmergency);
router.get('/', getAllEmergencies);
router.get('/:id', getEmergencyById);
router.put('/:id', upload.single('image'), updateEmergency);
router.delete('/:id', deleteEmergency);

module.exports = router;