const Consultation = require("../models/consultation");
const mongoose = require('mongoose');
const User= require("../models/User")



exports.getConsultationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1) Validation de l’ID user
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID format." });
    }

    // 2) Charger le user pour en extraire le champ `patient`
    const user = await User.findById(userId).select("patient");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    if (!user.patient) {
      return res
        .status(404)
        .json({ success: false, message: "No patient associated to this user." });
    }

    // 3) Récupérer toutes les consultations pour ce patient
    const consultations = await Consultation.find({ patientId: user.patient })
      .populate("doctorId",  "fullName")           // n'afficher que le nom du médecin
      .populate("patientId", "firstName lastName") // n'afficher que prénom+nom du patient

    return res
      .status(200)
      .json({ success: true, data: consultations });

  } catch (error) {
    console.error("getConsultationsByUser error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ➤ Créer une nouvelle consultation
exports.createConsultation = async (req, res) => {
  try {
    const consultation = new Consultation(req.body);
    await consultation.save();
    res.status(201).json({ message: "Consultation created successfully", consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Récupérer toutes les consultations avec populate pour afficher les noms
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('patientId', 'firstName')   // Récupère le fullName du patient
      .populate('doctorId', 'fullName');   // Récupère le fullName du docteur
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Récupérer une consultation par ID avec populate
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName');
      console.log("Consultations after populate:", consultations);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.status(200).json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







// ➤ Mettre à jour une consultation
exports.updateConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.status(200).json({ message: "Consultation updated successfully", consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Supprimer une consultation
exports.deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.status(200).json({ message: "Consultation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getConsultationsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    // Recherche des consultations avec le doctorId fourni
    const consultations = await Consultation.find({ doctorId: doctorId })
      .populate('patientId')   // Facultatif : remplacez par vos besoins (extraction des infos patient)
      .populate('doctorId');   // Facultatif : remplacez par vos besoins (extraction des infos médecin)
    
    return res.status(200).json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des consultations pour le médecin :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des consultations"
    });
  }
};

exports.updateConsultationP = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the consultation ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid consultation ID format." });
    }
    
    // Build an update object that only contains the prescription field.
    // This way you ensure you are only updating that reference.
    const updateFields = {
      prescription: req.body.prescription,
    };

    const updatedConsultation = await Consultation.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!updatedConsultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }
    
    res.status(200).json({ message: "Consultation updated successfully", consultation: updatedConsultation });
  } catch (error) {
    console.error("Error in updateConsultation:", error);
    res.status(500).json({ error: error.message });
  }
};