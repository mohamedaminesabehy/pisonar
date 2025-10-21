const Pharmacy = require("../models/Pharmacy");

// Middleware pour valider les données avant d'ajouter/modifier un médicament
const validatePharmacyData = (req, res, next) => {
    const { codeMedicament, nomMedicament, quantite, prix } = req.body;

    if (!nomMedicament || !quantite || !prix) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (quantite < 0 || prix < 0) {
        return res.status(400).json({ error: "Quantity and price must be positive values." });
    }

    next();
};

// Middleware pour vérifier l'unicité du code médicament
const checkUniqueCode = async (req, res, next) => {
    try {
        const { codeMedicament } = req.body;

        if (codeMedicament) {
            const existingMed = await Pharmacy.findOne({ codeMedicament });
            if (existingMed) {
                return res.status(400).json({ error: "Medication code already exists." });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ error: "Server error during code verification." });
    }
};

// Middleware pour s'assurer qu'un médicament existe avant modification/suppression
const checkPharmacyExists = async (req, res, next) => {
    try {
        const { id } = req.params;
        const medication = await Pharmacy.findById(id);

        if (!medication) {
            return res.status(404).json({ error: "Medication not found." });
        }

        req.medication = medication;
        next();
    } catch (error) {
        res.status(500).json({ error: "Server error during medication lookup." });
    }
};

module.exports = {
    validatePharmacyData,
    checkUniqueCode,
    checkPharmacyExists
};
