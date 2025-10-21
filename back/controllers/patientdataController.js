// controllers/patientDataController.js
const mongoose    = require('mongoose');
const PatientData = require('../models/patientData');
const Insurance   = require('../models/Insurance');
const CNAM        = require('../models/CNAM');

///////////////////////////////
// CREATE Patient Data
///////////////////////////////
exports.createPatientData = async (req, res) => {
  try {
    const {
      doctor: doctorId,
      insurance: insuranceCode,
      cnam: cnamCode,
      ...otherFields
    } = req.body;

    // 1) Verify doctor if provided
    if (doctorId) {
      const doctorExists = await mongoose.model('Doctor').exists({ _id: doctorId });
      if (!doctorExists) {
        return res.status(400).json({ success: false, message: 'Doctor not found' });
      }
    }

    // 2) Map insuranceCode → _id or null
    let insuranceId = null;
    if (insuranceCode) {
      const ins = await Insurance.findOne({ code: insuranceCode.trim() });
      insuranceId = ins ? ins._id : null;
    }

    // 3) Map cnamCode → _id or null
    let cnamId = null;
    if (cnamCode) {
      const cn = await CNAM.findOne({ code: cnamCode.trim() });
      cnamId = cn ? cn._id : null;
    }

    // 4) Build & save
    const patient = new PatientData({
      ...otherFields,
      doctor:    doctorId || null,
      insurance: insuranceId,
      cnam:      cnamId,
    });
    await patient.save();

    return res.status(201).json({ success: true, data: patient });
  } catch (err) {
    console.error('createPatientData error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

///////////////////////////////
// GET ALL Patient Data
///////////////////////////////
exports.getAllPatientsData = async (req, res) => {
  try {
    const patients = await PatientData.find()
      .populate('doctor',    'fullName specialization')
      .populate('insurance', 'code percentage expirationDate isActive')
      .populate('cnam',      'code percentage cancellationDate isActive');

    return res.status(200).json({
      success: true,
      count:   patients.length,
      data:    patients
    });
  } catch (err) {
    console.error('getAllPatientsData error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

///////////////////////////////
// GET ONE by ID
///////////////////////////////
exports.getPatientData = async (req, res) => {
  try {
    const patient = await PatientData.findById(req.params.id)
      .populate('doctor',    'fullName specialization')
      .populate('insurance', 'code percentage expirationDate isActive')
      .populate('cnam',      'code percentage cancellationDate isActive');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.status(200).json({ success: true, data: patient });
  } catch (err) {
    console.error('getPatientData error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

///////////////////////////////
// UPDATE Patient Data
///////////////////////////////
exports.updatePatientData = async (req, res) => {
  try {
    const {
      doctor: doctorId,
      insurance: insuranceCode,
      cnam: cnamCode,
      ...otherFields
    } = req.body;

    const updates = { ...otherFields };

    // 1) Verify doctor if provided
    if (doctorId !== undefined) {
      if (doctorId) {
        const doctorExists = await mongoose.model('Doctor').exists({ _id: doctorId });
        if (!doctorExists) {
          return res.status(400).json({ success: false, message: 'Doctor not found' });
        }
        updates.doctor = doctorId;
      } else {
        updates.doctor = null;
      }
    }

    // 2) Map insuranceCode → _id or null
    if (insuranceCode !== undefined) {
      if (insuranceCode) {
        const ins = await Insurance.findOne({ code: insuranceCode.trim() });
        updates.insurance = ins ? ins._id : null;
      } else {
        updates.insurance = null;
      }
    }

    // 3) Map cnamCode → _id or null
    if (cnamCode !== undefined) {
      if (cnamCode) {
        const cn = await CNAM.findOne({ code: cnamCode.trim() });
        updates.cnam = cn ? cn._id : null;
      } else {
        updates.cnam = null;
      }
    }

    // 4) Apply update
    const updated = await PatientData.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('updatePatientData error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

///////////////////////////////
// DELETE Patient Data
///////////////////////////////
exports.deletePatientData = async (req, res) => {
  try {
    const removed = await PatientData.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('deletePatientData error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

///////////////////////////////
// GET by EMAIL
///////////////////////////////
exports.getPatientDataByEmail = async (req, res) => {
  try {
    const patient = await PatientData.findOne({ email: req.params.email })
      .populate('doctor',    'fullName specialization')
      .populate('insurance', 'code percentage expirationDate isActive')
      .populate('cnam',      'code percentage cancellationDate isActive');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.status(200).json({ success: true, data: patient });
  } catch (err) {
    console.error('getPatientDataByEmail error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

///////////////////////////////
// GET AVAILABLE DOCTORS
///////////////////////////////
exports.getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await mongoose.model('Doctor')
      .find({}, '_id fullName specialization');
    return res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    console.error('getAvailableDoctors error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

///////////////////////////////
// GET Patients BY DOCTOR
///////////////////////////////
exports.getPatientsByDoctor = async (req, res) => {
  try {
    const patients = await PatientData.find({ doctor: req.params.doctorId })
      .populate('doctor',    'fullName email')
      .populate('insurance', 'code')
      .populate('cnam',      'code');

    return res.status(200).json({ success: true, data: patients });
  } catch (err) {
    console.error('getPatientsByDoctor error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
