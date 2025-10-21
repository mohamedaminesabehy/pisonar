const mongoose = require("mongoose");
const Pharmacy = require("../models/Pharmacy");

// 🔹 Ajouter un médicament avec code unique
async function ajouterMedicament(req, res) {
    try {
        const { nomMedicament, quantite, prix } = req.body;

        if (!nomMedicament || quantite < 0 || prix < 0) {
            return res.status(400).json({ error: "Invalid input data." });
        }

        // Vérifier si le médicament existe déjà
        const existingMedicament = await Pharmacy.findOne({ nomMedicament });
        if (existingMedicament) {
            return res.status(400).json({ error: "Medication already exists." });
        }

        // Générer un code unique pour le médicament
        const codeMedicament = `MED-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

        const newMedicament = new Pharmacy({
            _id: new mongoose.Types.ObjectId(),
            codeMedicament,
            nomMedicament,
            quantite,
            prix
        });

        await newMedicament.save();
        res.status(201).json({ message: "Medication added successfully.", data: newMedicament });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// 🔹 Récupérer tous les médicaments
async function getAllMedicaments(req, res) {
    try {
        const medicaments = await Pharmacy.find();
        res.status(200).json(medicaments);
    } catch (error) {
        res.status(500).json({ error: "Error fetching medications." });
    }
}

// 🔹 Récupérer un médicament par son code
async function getMedicamentByCode(req, res) {
    try {
        const { codeMedicament } = req.params;
        const medicament = await Pharmacy.findOne({ codeMedicament });

        if (!medicament) {
            return res.status(404).json({ error: "Medication not found." });
        }

        res.status(200).json(medicament);
    } catch (error) {
        res.status(500).json({ error: "Error fetching medication." });
    }
}

// 🔹 Vérifier si un médicament est en stock
async function checkMedicationStock(req, res) {
    try {
        const { medId } = req.params;
        const medication = await Pharmacy.findById(medId);

        if (!medication) {
            return res.status(404).json({ error: "Medication not found." });
        }

        const inStock = medication.quantite > 0;
        res.status(200).json({ inStock, stock: medication.quantite });
    } catch (error) {
        res.status(500).json({ error: "Error checking medication stock." });
    }
}

// 🔹 Mettre à jour un médicament (par ID)
async function updateMedicament(req, res) {
    try {
        const { quantite, prix } = req.body;

        if (quantite !== undefined && quantite < 0) {
            return res.status(400).json({ error: "Quantity cannot be negative." });
        }
        if (prix !== undefined && prix < 0) {
            return res.status(400).json({ error: "Price cannot be negative." });
        }

        const updatedMedicament = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedMedicament) {
            return res.status(404).json({ error: "Medication not found." });
        }

        res.status(200).json({ message: "Medication updated successfully.", data: updatedMedicament });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// 🔹 Supprimer un médicament (par ID)
async function deleteMedicament(req, res) {
    try {
        const deletedMedicament = await Pharmacy.findByIdAndDelete(req.params.id);

        if (!deletedMedicament) {
            return res.status(404).json({ error: "Medication not found." });
        }

        res.status(200).json({ message: "Medication deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error deleting medication." });
    }
}



async function searchMedicaments(req, res) {
    try {
      const { search } = req.query;
      if (!search || search.trim().length < 2) {
        return res.status(400).json({ error: "Please provide at least 2 characters for the search." });
      }
      const regex = new RegExp(search, "i");
      const medicaments = await Pharmacy.find({
        $or: [
          { nomMedicament: { $regex: regex } },
          { codeMedicament: { $regex: regex } }
        ]
      });
      res.status(200).json(medicaments);
    } catch (error) {
      res.status(500).json({ error: "Error searching medications." });
    }
  }

 
  




module.exports = {
    ajouterMedicament,
    getAllMedicaments,
    getMedicamentByCode,
    checkMedicationStock, 
    updateMedicament,
    deleteMedicament,
    searchMedicaments
};
