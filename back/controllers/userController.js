const User = require('../models/User');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Patient = require('../models/patientData');


// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get User By ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get User Full Name By ID
exports.getUserFullNameById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('firstName lastName');
        if (!user) return res.status(404).json({ error: 'User not found' });
        const fullName = `${user.firstName} ${user.lastName}`;
        res.status(200).json({ fullName });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
