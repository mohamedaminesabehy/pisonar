// controllers/DischargeController.js
const mongoose     = require('mongoose');
const PatientData  = require('../models/patientData');
const Resource     = require('../models/Resource');
const Nurse        = require('../models/Nurse');
const Notification = require('../models/Notification');

async function dischargePatient(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de patient invalide' });
    }

    const patient = await PatientData.findById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient non trouvé' });
    }

    // 1) Grab assignedResource IDs
    const resourceIds = patient.assignedResources || [];

    // 2) If there are any, fetch their documents so we can read `.type`
    let resourceTypes = [];
    if (resourceIds.length) {
      const docs = await Resource.find({ _id: { $in: resourceIds } }, 'type');
      resourceTypes = docs.map(r => r.type);
    }

    // 3) Notify every nurse about the freed resource TYPES
    if (resourceTypes.length) {
      const message = `Ressources disponibles : ${resourceTypes.join(', ')}`;
      const nurses  = await Nurse.find({}, '_id');

      const notifications = nurses.map(n => ({
        recipient:      n._id,
        recipientModel: 'Nurse',
        patient:        patient._id,
        message,
        resources:      resourceTypes
      }));

      await Notification.insertMany(notifications);
    }

    // 4) Now actually free the resources in the DB
    if (resourceIds.length) {
      await Resource.updateMany(
        { _id: { $in: resourceIds } },
        { $set: { status: 'Available', patientId: null } }
      );
    }

    // 5) Clear the patient’s assignedResources & mark Discharged
    patient.assignedResources = [];
    patient.status            = 'Discharged';
    await patient.save();

    return res.status(200).json({
      message: 'Patient déchargé avec succès',
      patient
    });

  } catch (err) {
    console.error('Erreur lors du déchargement du patient :', err);
    return res.status(500).json({
      error: "Une erreur est survenue lors du déchargement du patient."
    });
  }
}

module.exports = { dischargePatient };
