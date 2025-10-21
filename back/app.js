var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const mongo = require('mongoose');

var app = express();
const connectDB = require('./config/db');
connectDB();

var PrescriptionRouter = require('./routes/PrescriptionRoutes');
var pharmacyRouter = require('./routes/PharmacyRoutes');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var resourceRouter = require('./routes/resourceRoutes');
var userRouter = require('./routes/userRoutes');
var authRouter = require('./routes/authRoutes');
var doctorRouter = require('./routes/DoctorRoutes'); 
var nurseRouter = require('./routes/NurseRoutes'); 
var consultationRouter=require('./routes/consultationRoutes')
var adminRouter = require('./routes/AdminRoutes'); 
var patientRouter = require('./routes/patientdataRoutes'); 
var notificationRoutes = require('./routes/NotificationRoutes');
var dischargeRouter = require('./routes/DischargeRoutes');
var insuranceRouter = require('./routes/InsuranceRoutes');
var cnamRouter = require('./routes/CNAMRoutes');
const eventRouter = require('./routes/EventRoutes');
const notificationRouter = require('./routes/NotificationRoutes');
const leaveRequestRouter = require('./routes/LeaveRequestRoutes'); // Add this line
const eventModelRoutes = require('./routes/eventModelRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const predictionRoutes = require('./routes/predictionRoutes')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// CORS configuration - CORRECTION
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', indexRouter);
app.use('/usersA', usersRouter);
app.use('/resources', resourceRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/doctors', doctorRouter); 
app.use('/nurses', nurseRouter); 
app.use('/admins', adminRouter); 
app.use('/patients', patientRouter); 
app.use('/notification', notificationRoutes);
app.use('/consultations', consultationRouter);
app.use('/pharmacy', pharmacyRouter);
app.use('/prescriptions', PrescriptionRouter);
// Add this with your other routes
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/events', eventRouter);
app.use('/notifications', notificationRouter);
app.use('/discharge', dischargeRouter);
app.use('/leave-requests', leaveRequestRouter); // Add this line
app.use('/insurance', insuranceRouter);
app.use('/cnam', cnamRouter);
app.use('/schedule', eventModelRoutes);
app.use('/emergencies', emergencyRoutes);

app.use('/chatbot', chatbotRoutes);
app.use('/schedule', eventModelRoutes);
app.use('/predictions', predictionRoutes);





app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});
// Démarrer le serveur
const PORT =3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = app;