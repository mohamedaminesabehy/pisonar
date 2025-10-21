const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    codeMedicament: {
        type: String,
        required: true,
        unique: true
    },
    nomMedicament: {
        type: String,
        required: true
    },
    quantite: {
        type: Number,
        required: true,
        min: 0
    },
    prix: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

// Génération automatique du code médicament avant l'enregistrement
pharmacySchema.pre("save", function (next) {
    if (!this.codeMedicament) {
        this.codeMedicament = `MED-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }
    next();
});

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
module.exports = Pharmacy;
