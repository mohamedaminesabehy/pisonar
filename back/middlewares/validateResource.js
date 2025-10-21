// middlewares/validateResource.js
const yup = require('yup');

// Define Resource Validation Schema
const resourceSchema = yup.object({
    type: yup
        .string()
        .oneOf(
            [
                'Ventilator',
                'Defibrillator',
                'ECGMachine',
                'InfusionPump',
                'Stretcher',
                'Monitor',
                'SuctionDevice',
                'CrashCart',
                'Bed',
                'Wheelchair',
                'IVStand',
                'MedicalCart',
                'ExaminationTable'
            ],
            'Invalid resource type'
        )
        .required('Resource type is required'),

    status: yup
        .string()
        .oneOf(['Available', 'Occupied', 'Under Maintenance'], 'Invalid status')
        .required('Status is required'),

    location: yup
        .string()
        .required('Location is required'),

    isFunctional: yup
        .boolean()
        .required('Functionality status is required'),

    lastMaintenanceDate: yup
        .date()
        .nullable()
});

// Middleware to Validate Request Data
const validateResource = async (req, res, next) => {
    try {
        await resourceSchema.validate(req.body, { abortEarly: false });
        next(); // Continue if validation passes
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
};

module.exports = { validateResource }; // ✅ object export
