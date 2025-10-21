const Emergency = require('../models/Emergency');
const upload = require('../middlewares/multerConfig'); // Adjust path to your multer config

// Create a new emergency
exports.createEmergency = async (req, res) => {
  try {
    const { title, description, longitude, latitude } = req.body;
    const image = req.file ? req.file.path : null; // Get file path from multer

    // Validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (isNaN(lon) || isNaN(lat)) {
      return res.status(400).json({ error: 'Longitude and latitude must be valid numbers' });
    }
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Invalid longitude or latitude range' });
    }

    const emergency = new Emergency({
      title,
      description,
      position: { longitude: lon, latitude: lat },
      image // Store file path (e.g., 'Uploads/123456789.jpg')
    });

    await emergency.save();
    res.status(201).json(emergency);
  } catch (error) {
    console.error('Error creating emergency:', error);
    res.status(500).json({ error: 'Server error while creating emergency' });
  }
};

// Get all emergencies
exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find();
    res.status(200).json(emergencies);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching emergencies' });
  }
};

// Get a single emergency by ID
exports.getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.status(200).json(emergency);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching emergency' });
  }
};

// Update an emergency
exports.updateEmergency = async (req, res) => {
  try {
    const { title, description, longitude, latitude } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    // Validation
    if (longitude !== undefined && latitude !== undefined) {
      const lon = parseFloat(longitude);
      const lat = parseFloat(latitude);
      if (isNaN(lon) || isNaN(lat)) {
        return res.status(400).json({ error: 'Longitude and latitude must be valid numbers' });
      }
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
        return res.status(400).json({ error: 'Invalid longitude or latitude range' });
      }
    }

    const updateData = {
      title,
      description,
      image
    };
    if (longitude !== undefined && latitude !== undefined) {
      updateData.position = { longitude: parseFloat(longitude), latitude: parseFloat(latitude) };
    }

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.status(200).json(emergency);
  } catch (error) {
    console.error('Error updating emergency:', error);
    res.status(500).json({ error: 'Server error while updating emergency' });
  }
};

// Delete an emergency
exports.deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndDelete(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.status(200).json({ message: 'Emergency deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting emergency' });
  }
};