const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/PrescriptionController"); // Import du contrôleur
const { checkPrescriptionExists, validatePrescriptionData } = require("../middlewares/Prescription"); // Import des middlewares

// ✅ Ajouter une ordonnance avec validation
router.post("/", validatePrescriptionData, prescriptionController.addPrescription);

// ✅ Récupérer toutes les ordonnances
router.get("/", prescriptionController.getAllPrescriptions);

// ✅ Récupérer une ordonnance par ID
router.get("/:id", checkPrescriptionExists, prescriptionController.getPrescriptionById);

// ✅ Mettre à jour une ordonnance (avec validation)
router.put("/:id", checkPrescriptionExists, prescriptionController.updatePrescription);

// ✅ Supprimer une ordonnance
router.delete("/:id", checkPrescriptionExists, prescriptionController.deletePrescription);

router.get("/doctor/:doctorId", prescriptionController.getPrescriptionsByDoctor);

router.get("/user/:userId", prescriptionController.getPrescriptionsByUser);

module.exports = router;
