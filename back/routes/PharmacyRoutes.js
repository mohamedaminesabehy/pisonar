const express = require("express");
const router = express.Router();
const pharmacyController = require("../controllers/PharmacyController"); // Import du contrôleur
const { validatePharmacyData, checkUniqueCode, checkPharmacyExists } = require("../middlewares/Pharmacy"); // Import des middlewares

// ✅ Ajouter un médicament avec validation et code unique
router.post("/", validatePharmacyData, checkUniqueCode, pharmacyController.ajouterMedicament);

// ✅ Mettre à jour un médicament (par ID) avec validation
router.put("/:id", checkPharmacyExists, validatePharmacyData, pharmacyController.updateMedicament);

// ✅ Récupérer tous les médicaments
router.get("/", pharmacyController.getAllMedicaments);

// ✅ Récupérer un médicament par son code
router.get("/:codeMedicament", pharmacyController.getMedicamentByCode);

// ✅ Vérifier si un médicament est en stock (nouvelle route)
router.get("/check-stock/:medId", pharmacyController.checkMedicationStock);

// ✅ Supprimer un médicament (avec vérification de l'existence)
router.delete("/:id", checkPharmacyExists, pharmacyController.deleteMedicament);

// ✅ Rechercher des médicaments par nom ou description
router.get('/search', pharmacyController.searchMedicaments);





module.exports = router;







