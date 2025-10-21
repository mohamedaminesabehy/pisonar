  import { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import axios from '../api/axios';
  import Swal from 'sweetalert2';
  import {
    FaUser,
    FaEnvelope,
    FaCalendar,
    FaPhone,
    FaStethoscope,
    FaNotesMedical,
    FaHeartbeat,
    FaThermometerHalf,
    FaTint,
    FaCommentMedical,
    FaClock,
    FaFileMedical,
    FaIdCard,
    FaUserMd,
    FaHome
  } from "react-icons/fa";
  import { PlusOutlined } from '@ant-design/icons';
  import "./AddPatientForm.css";

  const AddPatientForm = () => {
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      phoneNumber: "",
      contactInfo: "",
      address: "",
      insurance: "",
      cnam: "",
      medicalHistory: [""],
      chiefComplaint: "",
      symptoms: [""],
      bloodPressure: "",
      glycemicIndex: "",
      oxygenSaturation: "",
      state: "low",
      status: "Waiting for Doctor",
      doctor: ""
    });

    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
      const fetchDoctors = async () => {
        try {
          setLoadingDoctors(true);
          const response = await axios.get("/patients/doctors/available", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setDoctors(response.data.data);
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to load doctors',
            text: error.response?.data?.message || 'Please try again later',
          });
        } finally {
          setLoadingDoctors(false);
        }
      };

      fetchDoctors();
    }, []);

    const handleArrayChange = (field, index, value) => {
      const updatedArray = [...formData[field]];
      updatedArray[index] = value;
      setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const addArrayField = (field) => {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
      let newErrors = {};
      // Vérification des informations personnelles
      if (!formData.firstName) newErrors.firstName = "Le prénom est requis";
      if (!formData.lastName) newErrors.lastName = "Le nom de famille est requis";
      if (!formData.email) {
        newErrors.email = "L'email est requis";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
      if (!formData.age) {
        newErrors.age = "L'âge est requis";
      } else if (isNaN(formData.age) || formData.age <= 0) {
        newErrors.age = "Veuillez entrer un âge valide";
      }
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Le numéro de téléphone est requis";
      } else if (!/^[\d\s\-\+]+$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Format du numéro de téléphone invalide";
      }
      if (!formData.contactInfo) newErrors.contactInfo = "Les informations de contact sont requises";
      if (!formData.address) newErrors.address = "L'adresse est requise";
      if (!formData.insurance) newErrors.insurance = "L'assurance est requise";
      if (!formData.cnam) newErrors.cnam = "Le numéro de CNA est requis";

      // Vérification des informations médicales
      if (!formData.chiefComplaint) {
        newErrors.chiefComplaint = "Le motif de consultation est requis";
      }
      if (formData.symptoms.some(s => !s.trim())) {
        newErrors.symptoms = "Au moins un symptôme est requis";
      }
      if (!formData.bloodPressure) {
        newErrors.bloodPressure = "La tension artérielle est requise";
      } else if (!/^\d{1,3}\/\d{1,3}$/.test(formData.bloodPressure)) {
        newErrors.bloodPressure = "Format invalide (ex: 120/80)";
      }
      if (!formData.glycemicIndex) {
        newErrors.glycemicIndex = "L'index glycémique est requis";
      } else if (isNaN(formData.glycemicIndex) || formData.glycemicIndex <= 0) {
        newErrors.glycemicIndex = "Veuillez entrer un index glycémique valide";
      }
      if (formData.oxygenSaturation === "" || formData.oxygenSaturation === null) {
        newErrors.oxygenSaturation = "La saturation en oxygène est requise";
      } else if (isNaN(formData.oxygenSaturation) || formData.oxygenSaturation < 0 || formData.oxygenSaturation > 100) {
        newErrors.oxygenSaturation = "Veuillez entrer une saturation en oxygène valide (0-100)";
      }

      // Vous pouvez ajouter d'autres validations ici (par exemple pour le champ 'doctor' si nécessaire).

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
    
      try {
        const payload = {
          ...formData,
          medicalHistory: formData.medicalHistory.filter(h => h.trim()),
          symptoms: formData.symptoms.filter(s => s.trim())
        };
    
        // Créer le patient
        const patientResponse = await axios.post("/patients/", payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
    
        // Si un médecin est assigné, créer une notification pour lui
        if (payload.doctor) {
          const notificationPayload = {
            recipient: payload.doctor,
            recipientModel: "Doctor",
            message: `New patient ${payload.firstName} ${payload.lastName} (${payload.state}) has been assigned to you.`,
            patient: patientResponse.data.data._id,
            read: false,
          };
    
          await axios.post("/notification/", notificationPayload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
        }
    
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: "Patient ajouté avec succès !",
          showConfirmButton: false,
          timer: 1500,
        });
    
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          age: "",
          phoneNumber: "",
          contactInfo: "",
          address: "",
          insurance: "",
          cnam: "",
          medicalHistory: [""],
          chiefComplaint: "",
          symptoms: [""],
          bloodPressure: "",
          glycemicIndex: "",
          oxygenSaturation: "",
          state: "Not Urgent",
          status: "Waiting for Doctor",
          doctor: ""
        });
      } catch (error) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to add patient',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    };

    return (
      <div className="medical-staff-container">
        <div className="edit-fo">
          <motion.h1 className="main-title">Add a Patient</motion.h1>
        </div>
        <div className="content-wrapper">
          <div className="form-section">
            <form onSubmit={handleSubmit} className="add-staff-form">
              <div className="form-fields">
                <div className="patient-info-section">
                  <h3 className="patient-info-title">Personal Information</h3>
                  
                  <div className="form-row">
                    <div className={`form-group ${errors.firstName ? "error" : ""}`}>
                      <label><FaUser /> First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>

                    <div className={`form-group ${errors.lastName ? "error" : ""}`}>
                      <label><FaUser /> Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${errors.email ? "error" : ""}`}>
                      <label><FaEnvelope /> Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className={`form-group ${errors.age ? "error" : ""}`}>
                      <label><FaCalendar /> Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                      />
                      {errors.age && <span className="error-message">{errors.age}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${errors.phoneNumber ? "error" : ""}`}>
                      <label><FaPhone /> Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                      {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                    </div>

                    <div className={`form-group ${errors.contactInfo ? "error" : ""}`}>
                      <label><FaPhone /> Contact Info</label>
                      <input
                        type="text"
                        name="contactInfo"
                        value={formData.contactInfo}
                        onChange={handleChange}
                      />
                      {errors.contactInfo && <span className="error-message">{errors.contactInfo}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${errors.address ? "error" : ""}`}>
                      <label><FaHome /> Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                      {errors.address && <span className="error-message">{errors.address}</span>}
                    </div>

                    <div className={`form-group ${errors.insurance ? "error" : ""}`}>
                      <label><FaIdCard /> Insurance</label>
                      <input
                        type="text"
                        name="insurance"
                        value={formData.insurance}
                        onChange={handleChange}
                      />

                    </div>

                    <div className={`form-group ${errors.cnam ? "error" : ""}`}>
                      <label><FaIdCard /> CNAM</label>
                      <input
                        type="text"
                        name="cnam"
                        value={formData.cnam}
                        onChange={handleChange}
                      />

                    </div>
                  </div>
                </div>

                <div className="patient-info-section">
                  <h3 className="patient-info-title">Medical Information</h3>
                  
                  <div className={`form-group ${errors.chiefComplaint ? "error" : ""}`}>
                    <label><FaCommentMedical /> Chief Complaint</label>
                    <input
                      type="text"
                      name="chiefComplaint"
                      value={formData.chiefComplaint}
                      onChange={handleChange}
                    />
                    {errors.chiefComplaint && <span className="error-message">{errors.chiefComplaint}</span>}
                  </div>

                  <div className={`form-group ${errors.symptoms ? "error" : ""}`}>
                    <label><FaNotesMedical /> Symptoms</label>
                    {formData.symptoms.map((symptom, index) => (
                      <div key={index} className="symptom-field">
                        <input
                          type="text"
                          value={symptom}
                          onChange={(e) => handleArrayChange('symptoms', index, e.target.value)}
                          placeholder={`Symptom ${index + 1}`}
                        />
                        {index === formData.symptoms.length - 1 && (
                          <button
                            type="button"
                            className="add-symptom-btn"
                            onClick={() => addArrayField('symptoms')}
                          >
                            <PlusOutlined />
                          </button>
                        )}
                      </div>
                    ))}
                    {errors.symptoms && <span className="error-message">{errors.symptoms}</span>}
                  </div>

                  <div className={`form-group ${errors.medicalHistory ? "error" : ""}`}>
                    <label><FaFileMedical /> Medical History</label>
                    {formData.medicalHistory.map((history, index) => (
                      <div key={index} className="symptom-field">
                        <input
                          type="text"
                          value={history}
                          onChange={(e) => handleArrayChange('medicalHistory', index, e.target.value)}
                          placeholder={`Medical history ${index + 1}`}
                        />
                        {index === formData.medicalHistory.length - 1 && (
                          <button
                            type="button"
                            className="add-symptom-btn"
                            onClick={() => addArrayField('medicalHistory')}
                          >
                            <PlusOutlined />
                          </button>
                        )}
                      </div>
                    ))}
                    {errors.medicalHistory && <span className="error-message">{errors.medicalHistory}</span>}
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${errors.bloodPressure ? "error" : ""}`}>
                      <label><FaHeartbeat /> Blood Pressure</label>
                      <input
                        type="text"
                        name="bloodPressure"
                        value={formData.bloodPressure}
                        onChange={handleChange}
                        placeholder="e.g., 120/80"
                      />
                      {errors.bloodPressure && <span className="error-message">{errors.bloodPressure}</span>}
                    </div>

                    <div className={`form-group ${errors.glycemicIndex ? "error" : ""}`}>
                      <label><FaThermometerHalf /> Glycemic Index</label>
                      <input
                        type="number"
                        name="glycemicIndex"
                        value={formData.glycemicIndex}
                        onChange={handleChange}
                      />
                      {errors.glycemicIndex && <span className="error-message">{errors.glycemicIndex}</span>}
                    </div>

                    <div className={`form-group ${errors.oxygenSaturation ? "error" : ""}`}>
                      <label><FaTint /> Oxygen Saturation</label>
                      <input
                        type="number"
                        name="oxygenSaturation"
                        value={formData.oxygenSaturation}
                        onChange={handleChange}
                        placeholder="Percentage (e.g., 98)"
                      />
                      {errors.oxygenSaturation && <span className="error-message">{errors.oxygenSaturation}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${errors.state ? "error" : ""}`}>
                      <label><FaStethoscope /> State</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="critical">Critical</option>
                      </select>
                      {errors.state && <span className="error-message">{errors.state}</span>}
                    </div>

                    <div className={`form-group ${errors.status ? "error" : ""}`}>
                      <label><FaClock /> Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="Waiting for Doctor">Waiting for Doctor</option>
                        <option value="Under Examination">Under Examination</option>
                        <option value="Discharged">Discharged</option>
                      </select>
                      {errors.status && <span className="error-message">{errors.status}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${errors.doctor ? "error" : ""}`}>
                      <label><FaUserMd /> Assign Doctor</label>
                      <select
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        disabled={loadingDoctors}
                      >
                        <option value="">{loadingDoctors ? "Loading doctors..." : "Select a doctor"}</option>
                        {doctors.map(doctor => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.fullName} ({doctor.specialization})
                          </option>
                        ))}
                      </select>
                      {errors.doctor && <span className="error-message">{errors.doctor}</span>}
                    </div>
                  </div>
                </div>

                <motion.button 
                  type="submit" 
                  className="submit-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Patient
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  export default AddPatientForm;
