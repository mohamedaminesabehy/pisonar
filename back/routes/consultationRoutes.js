const express = require("express");
const router = express.Router();
const consultationController = require("../controllers/consultationController");
const authorizeRole = require("../middlewares/authorizeRole");

// 🔹 Seuls les docteurs peuvent créer, modifier et supprimer une consultation
router.post("/consultation/add", authorizeRole(['Doctor']), consultationController.createConsultation);
router.put("/consultation/:id", authorizeRole(['Doctor']), consultationController.updateConsultation);
router.delete("/consultation/:id", authorizeRole(['Doctor']), consultationController.deleteConsultation);

// 🔹 Les docteurs peuvent voir toutes les consultations, les patients voient seulement les leurs
router.get("/consultation", authorizeRole(['Doctor', 'Patient']), consultationController.getAllConsultations);
router.get("/consultation/:id", authorizeRole(['Doctor', 'Patient']), consultationController.getConsultationById);
router.get("/:userId", authorizeRole(['Doctor', 'Patient']), consultationController.getConsultationsByUser);


router.get('/consultation/doctor/:doctorId', consultationController.getConsultationsByDoctor);

router.put("/:id", authorizeRole(['Doctor']), consultationController.updateConsultationP);

module.exports = router;
