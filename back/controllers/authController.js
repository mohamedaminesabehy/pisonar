const User = require('../models/User');
const Patient = require('../models/patientData');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/nodemailer');
const upload = require('../middlewares/multerConfig'); // Configuration de Multer pour le téléchargement de fichiers

// Générer un OTP (One-Time Password)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Envoyer un OTP par e-mail
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Expéditeur
    to: email, // Destinataire
    subject: 'Email Verification OTP', // Sujet de l'e-mail
    text: `Your OTP for email verification is: ${otp}`, // Corps du texte
    html: `<p>Your OTP for email verification is: <b>${otp}</b></p>`, // Corps HTML
  };

  await transporter.sendMail(mailOptions);
};

// Envoyer un OTP pour la vérification de l'e-mail
exports.sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Trouver l'utilisateur par e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Vérifier que l'utilisateur est un patient
    if (user.role !== 'Patient') {
      return res.status(403).json({ error: 'OTP verification is only allowed for Patients' });
    }

    // Générer un OTP
    const otp = generateOTP();

    // Définir l'OTP et sa date d'expiration (10 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Sauvegarder l'utilisateur avec l'OTP
    await user.save();

    // Envoyer l'OTP par e-mail
    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vérifier l'OTP soumis par l'utilisateur
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Trouver l'utilisateur par e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Vérifier que l'utilisateur est un patient
    if (user.role !== 'Patient') {
      return res.status(403).json({ error: 'OTP verification is only allowed for Patients' });
    }

    // Vérifier si l'OTP correspond et n'est pas expiré
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Effacer l'OTP et marquer l'e-mail comme vérifié
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isEmailVerified = true; // Marquer l'e-mail comme vérifié
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Inscription (uniquement pour les patients) avec téléchargement de fichier
exports.register = [
  upload.single('photo'),
  async (req, res) => {
    try {
      const { role, ...userData } = req.body;

      if (role !== 'Patient') {
        return res.status(403).json({ error: 'Registration is only allowed for Patients' });
      }

      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      // Check if patient data exists for this email
      const patientData = await Patient.findOne({ email: userData.email });
      if (!patientData) {
        return res.status(404).json({ error: 'No patient data found for this email. Please contact administration.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const otp = generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000;
      const isEmailVerified = false;

      let photo = undefined;
      if (req.file) {
        photo = `/uploads/${req.file.filename}`;
      }

      // Create the User with only the required fields and reference to patientData
      const newUser = new User({
        email: userData.email,
        password: hashedPassword,
        photo,
        patient: patientData._id,
        otp,
        otpExpires,
        isEmailVerified,
        role: 'Patient',
      });
      await newUser.save();

      await sendOTP(userData.email, otp);

      res.status(201).json({ message: 'OTP sent to your email. Please verify to complete registration.' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
];

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

   

    let isMatch;
    if (user.role === 'Admin') {
      // Les mots de passe des administrateurs sont en texte brut
      isMatch = password === user.password;
    } else {
      // Pour les autres rôles, comparer les mots de passe hachés
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    // Retourner le token et le rôle
    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Réinitialisation du mot de passe
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vérifier l'OTP pour la réinitialisation du mot de passe
exports.verifyOTPForPasswordReset = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified. You can now reset your password.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Déconnexion
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};