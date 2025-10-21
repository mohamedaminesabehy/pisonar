const yup = require('yup');

const partialSchema = yup.object({
    type: yup
        .string()
        .oneOf([
            'Ventilator', 'Defibrillator', 'ECGMachine', 'InfusionPump', 'Stretcher',
            'Monitor', 'SuctionDevice', 'CrashCart', 'Bed', 'Wheelchair',
            'IVStand', 'MedicalCart', 'ExaminationTable'
        ])
        .notRequired(),

    status: yup
        .string()
        .oneOf(['Available', 'Occupied', 'Under Maintenance'])
        .notRequired(),

    location: yup
        .string()
        .notRequired(),

    isFunctional: yup
        .boolean()
        .notRequired(),

    lastMaintenanceDate: yup
        .date()
        .nullable()
        .notRequired()
});

const validatePartialResource = async (req, res, next) => {
    try {
        await partialSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
};

module.exports = { validatePartialResource };
