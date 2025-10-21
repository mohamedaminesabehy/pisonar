const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    codePrescription: {
        type: String,
        required: true,
        unique: true
    },

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientData",  // ✅ Référence au patient
        required: true
    },

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // ✅ Référence au docteur
        required: true
    },

    medications: [
        {
            medication: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Pharmacy",  // ✅ Référence au médicament
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            duration: {  
                type: Number,
                required: true,
                min: 1
            },
            timesPerDay: {  
                type: Number,
                required: true,
                min: 1
            }
        }
    ],



    description: {
        type: String,
        required: false, // 🔹 Ce champ est optionnel
        trim: true
    },

    status: {
        type: String,
        enum: ["Pending", "Failed", "Delivered"], // 🔹 Statut avec 3 valeurs possibles
        default: "Pending"
    },

    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"]
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

// 🔹 Génération automatique d'un code prescription unique avant l'enregistrement
prescriptionSchema.pre("save", function (next) {
    if (!this.codePrescription) {
        this.codePrescription = `PRES-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }
    next();
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
module.exports = Prescription;
