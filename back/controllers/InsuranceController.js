// controllers/insuranceController.js
const Insurance = require('../models/Insurance');

// Create a new Insurance
exports.createInsurance = async (req, res) => {
  try {
    // 1) Log for debugging
    console.log('createInsurance body:', req.body);

    // 2) Destructure and rename incoming expirationDate string
    const { code, percentage, expirationDate: expDateStr } = req.body;

    // 3) Parse into JS Date or null
    const expirationDate = expDateStr ? new Date(expDateStr) : null;

    // 4) Compute active flag
    const isActive = !expirationDate || expirationDate > new Date();

    // 5) Build & save (expirationDate ALWAYS passed, even if null)
    const ins = new Insurance({
      code,
      percentage,
      expirationDate,
      isActive,
    });
    const saved = await ins.save();

    return res.status(201).json(saved);
  } catch (error) {
    console.error('createInsurance error:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Get all Insurances
exports.getAllInsurances = async (req, res) => {
  try {
    const list = await Insurance.find().sort({ code: 1 });
    return res.status(200).json(list);
  } catch (error) {
    console.error('getAllInsurances error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get one Insurance by ID
exports.getInsuranceById = async (req, res) => {
  try {
    const ins = await Insurance.findById(req.params.id);
    if (!ins) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    return res.status(200).json(ins);
  } catch (error) {
    console.error('getInsuranceById error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update an existing Insurance
exports.updateInsurance = async (req, res) => {
  try {
    const { code, percentage, expirationDate } = req.body;

    // 1. parse expirationDate
    const parsedDate = expirationDate ? new Date(expirationDate) : null;
    // 2. recalc active
    const isActive = !parsedDate || parsedDate > new Date();

    // 3. find & update in one go
    const updated = await Insurance.findByIdAndUpdate(
      req.params.id,
      {
        // only overwrite the fields you care about
        ...(code        !== undefined && { code }),
        ...(percentage  !== undefined && { percentage }),
        expirationDate: parsedDate,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    console.error('updateInsurance error:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Delete an Insurance
exports.deleteInsurance = async (req, res) => {
  try {
    const removed = await Insurance.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    return res.status(200).json({ message: 'Insurance deleted successfully' });
  } catch (error) {
    console.error('deleteInsurance error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
