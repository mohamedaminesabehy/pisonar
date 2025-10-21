const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'] },
    start: { type: Date, required: [true, 'Start date is required'] },
    end: { type: Date, required: [true, 'End date is required'] },
    assignedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    assignedNurses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nurse' }],
    shift: { 
        type: String, 
        required: [true, 'Shift is required'], 
        enum: ['Morning', 'Evening', 'Night'] 
    },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;