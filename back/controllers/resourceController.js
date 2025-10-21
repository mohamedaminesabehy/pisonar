const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const Patient = require('../models/patientData');

// Create a Resource
exports.createResource = async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all Resources
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a Resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).json({ error: 'Resource not found' });
    res.status(200).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update a Resource
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).json({ error: 'Resource not found' });
    // Update only the provided fields
    Object.keys(req.body).forEach((key) => {
      resource[key] = req.body[key];
    });
    await resource.save();
    res.status(200).json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a Resource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource)
      return res.status(404).json({ error: 'Resource not found' });
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Assign Resources To a Patient
exports.assignResourcesToPatient = async (req, res) => {
  const { resourceIds, patientId } = req.body; // Expect an array of resource IDs and a valid patient ID

  // Validate the inputs
  if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
    return res.status(400).json({ error: 'Invalid resourceIds provided' });
  }
  if (!patientId) {
    return res.status(400).json({ error: 'Invalid patientId provided' });
  }
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: 'patientId is not a valid ObjectId' });
  }

  try {
    // Check if the patient exists.
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Validate each resourceId and update the corresponding resource.
    const updatedResourceIds = await Promise.all(
      resourceIds.map(async (resourceId) => {
        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
          throw new Error(`Invalid resource ID: ${resourceId}`);
        }
        const resource = await Resource.findById(resourceId);
        if (!resource) {
          throw new Error(`Resource with id ${resourceId} not found`);
        }
        // Marquer la ressource comme Occupied et lui assigner le patient via le champ "Patient"
        resource.status = 'Occupied';
        resource.Patient = patientId;
        await resource.save();
        return resource._id;
      })
    );

    // Fusionner les ressources assignées déjà au patient et les nouvelles.
    const existingResources = patient.assignedResources.map((id) => id.toString());
    const newResources = updatedResourceIds.map((id) => id.toString());
    const combinedResources = Array.from(new Set([...existingResources, ...newResources]));
    patient.assignedResources = combinedResources;

    // Sauvegarder le patient mis à jour.
    await patient.save();

    return res.status(200).json({
      message: 'Resources assigned successfully',
      resources: updatedResourceIds,
    });
  } catch (err) {
    console.error('Error assigning resources:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Remove a Resource from a Patient
exports.removeResourceFromPatient = async (req, res) => {
  const { patientId, resourceId } = req.params;

  // Validate IDs.
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: 'Invalid patientId' });
  }
  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({ error: 'Invalid resourceId' });
  }

  try {
    // Trouver le patient.
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Trouver la ressource.
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Retirer l'ID de la ressource du tableau des ressources assignées du patient.
    patient.assignedResources = patient.assignedResources.filter(
      (id) => id.toString() !== resourceId
    );
    await patient.save();

    // Réinitialiser l'assignation de la ressource.
    resource.Patient = null;
    resource.status = 'Available';
    await resource.save();

    return res.status(200).json({
      message: 'Resource removed from patient successfully.',
    });
  } catch (err) {
    console.error('Error removing resource assignment:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

