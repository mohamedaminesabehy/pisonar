// controllers/cnamController.js
const CNAM = require('../models/CNAM');

// Create a new CNAM




exports.createCNAM = async (req, res) => {
  try {
    // 1) Log for debugging
    console.log('createCNAM body:', req.body);

    // 2) Destructure and rename incoming expirationDate string
    const { code, percentage, cansilationDate: expDateStr } = req.body;

    // 3) Parse into JS Date or null
    const cansilationDate = expDateStr ? new Date(expDateStr) : null;

    // 4) Compute active flag
    const isActive = !cansilationDate || cansilationDate > new Date();

    // 5) Build & save (expirationDate ALWAYS passed, even if null)
    const cnam = new CNAM({
      code,
      percentage,
      cansilationDate,
      isActive,
    });
    const saved = await cnam.save();

    return res.status(201).json(saved);
  } catch (error) {
    console.error('createCNAM error:', error);
    return res.status(400).json({ error: error.message });
  }
};


// Get all CNAMs
exports.getAllCNAMs = async (req, res) => {
  try {
    const cnams = await CNAM.find().sort({ code: 1 });
    return res.status(200).json(cnams);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a single CNAM by ID
exports.getCNAMById = async (req, res) => {
  try {
    const cnam = await CNAM.findById(req.params.id);
    if (!cnam) {
      return res.status(404).json({ error: 'CNAM not found' });
    }
    return res.status(200).json(cnam);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update an existing CNAM
exports.updateCNAM = async (req, res) => {
  try {
    const { code, percentage, cancellationDate } = req.body;
    const cnam = await CNAM.findById(req.params.id);
    if (!cnam) {
      return res.status(404).json({ error: 'CNAM not found' });
    }

    // update fields if provided
    if (code !== undefined) cnam.code = code;
    if (percentage !== undefined) cnam.percentage = percentage;

    // parse & set the cancellation date
    const parsedDate = cancellationDate ? new Date(cancellationDate) : null;
    cnam.cancellationDate = parsedDate;

    // recalculate isActive
    cnam.isActive = !parsedDate || parsedDate > new Date();

    await cnam.save();
    return res.status(200).json(cnam);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete a CNAM
exports.deleteCNAM = async (req, res) => {
  try {
    const cnam = await CNAM.findByIdAndDelete(req.params.id);
    if (!cnam) {
      return res.status(404).json({ error: 'CNAM not found' });
    }
    return res.status(200).json({ message: 'CNAM deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
