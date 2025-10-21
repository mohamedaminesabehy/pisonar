const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Resource type is required'],
        enum: [
            // Emergency-critical
            'Ventilator',
            'Defibrillator',
            'ECGMachine',
            'InfusionPump',
            'Stretcher',
            'Monitor',
            'SuctionDevice',
            'CrashCart',

            // Core care materials
            'Bed',
            'Wheelchair',
            'IVStand',
            'MedicalCart',
            'ExaminationTable'
        ],
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Available', 'Occupied', 'Under Maintenance'],
        default: 'Available',
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    isFunctional: {
        type: Boolean,
        required: true,
        default: true
    },
    lastMaintenanceDate: {
        type: Date,
        required: false
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientData',
        default: null
    },

});

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
