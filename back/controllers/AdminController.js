const Admin = require('../models/Admin');

// Créer un administrateur
exports.createAdmin = async (req, res) => {
    try {
        const admin = new Admin(req.body);
        await admin.save();
        res.status(201).json(admin);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Récupérer tous les administrateurs
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Récupérer un administrateur par ID
exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Mettre à jour un administrateur
exports.updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        // Mettre à jour uniquement les champs fournis dans la requête
        Object.keys(req.body).forEach((key) => {
            admin[key] = req.body[key];
        });

        await admin.save();
        res.status(200).json(admin);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Supprimer un administrateur
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};