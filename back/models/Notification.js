const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Doctor', 'Nurse']
  },
  message: {
    type: String,
    required: true
  },
  // Le champ "patient" est optionnel. Définissez-le s'il doit être présent.
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientData'
  },
  // Le champ "event" est optionnel. Si vous souhaitez qu'il soit requis, ajoutez required: true.
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  // ← NEW: which resources just freed up
  resources: [{
    type: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
