import { useState } from "react";
import { motion } from "framer-motion";
import axios from '../api/axios';
import Swal from 'sweetalert2';
import doc3 from "/src/assets/images/infirmier.jpg";
import doc4 from "/src/assets/images/taa.jpg";
import {
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaVenusMars,
  FaLock,
  FaStethoscope,
  FaNotesMedical,
  FaUserMd,
  FaUserNurse,
  FaImage,
} from "react-icons/fa";
import "./AddDoctorForm.css";

const AddDoctorForm = () => {
  const [staffType, setStaffType] = useState("doctor");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    photo: null,
    specialization: "",
    nurseLevel: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (staffType === "doctor" && !formData.specialization)
      newErrors.specialization = "Specialization is required";
    if (staffType === "nurse" && !formData.nurseLevel)
      newErrors.nurseLevel = "Level is required";
    if (!formData.photo) newErrors.photo = "Image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("dateOfBirth", formData.dateOfBirth);
    data.append("gender", formData.gender);
    data.append("password", formData.password);
    data.append("photo", formData.photo);
    if (staffType === "doctor") {
      data.append("specialization", formData.specialization);

    } else {
      data.append("level", formData.nurseLevel);

    }

    try {
      const endpoint = staffType === "doctor" ? "/doctors" : "/nurses";
      const response = await axios.post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: `${staffType === "doctor" ? "Doctor" : "Nurse"} added successfully!`,
        showConfirmButton: false,
        timer: 1500,
      });

      setFormData({
        fullName: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        password: "",
        photo: null,
        specialization: "",
        nurseLevel: "",
      });
      setPreviewImage(null);
      setErrors({});
    } catch (error) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to add staff member.',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <div className="medical-staff-container">
      <div className="edit-fo">
        <motion.h1 className="main-title">Medical Staff Management</motion.h1>
      </div>
      <div className="content-wrapper">
        <div className="form-section">
          <div className="staff-type-selection">
            <button
              className={`staff-type-btn ${staffType === "doctor" ? "active" : ""}`}
              onClick={() => setStaffType("doctor")}
            >
              <FaUserMd className="btn-icon" /> Doctor
            </button>
            <button
              className={`staff-type-btn ${staffType === "nurse" ? "active" : ""}`}
              onClick={() => setStaffType("nurse")}
            >
              <FaUserNurse className="btn-icon" /> Nurse
            </button>
          </div>
          <form onSubmit={handleSubmit} className="add-staff-form">
            <div className="form-header">
              <img
                src={staffType === "doctor" ? doc4 : doc3}
                alt="Medical Staff"
                className="staff-icon"
              />
              <h2 className="text">{staffType === "doctor" ? "Add a Doctor" : "Add a Nurse"}</h2>
            </div>
            <div className="form-fields">
              <div className={`form-group ${errors.fullName ? "error" : ""}`}>
                <label>
                  <FaUser /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className={`form-group ${errors.email ? "error" : ""}`}>
                <label>
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-row">
                <div className={`form-group ${errors.dateOfBirth ? "error" : ""}`}>
                  <label>
                    <FaCalendar /> Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                  {errors.dateOfBirth && (
                    <span className="error-message">{errors.dateOfBirth}</span>
                  )}
                </div>
                <div className={`form-group ${errors.gender ? "error" : ""}`}>
                  <label>
                    <FaVenusMars /> Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && (
                    <span className="error-message">{errors.gender}</span>
                  )}
                </div>
              </div>

              {staffType === "doctor" && (
                <div className={`form-group ${errors.specialization ? "error" : ""}`}>
                  <label>
                    <FaStethoscope /> Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                  {errors.specialization && (
                    <span className="error-message">{errors.specialization}</span>
                  )}
                </div>
              )}

              {staffType === "nurse" && (
                <div className={`form-group ${errors.nurseLevel ? "error" : ""}`}>
                  <label>
                    <FaNotesMedical /> Level
                  </label>
                  <select
                    name="nurseLevel"
                    value={formData.nurseLevel}
                    onChange={handleChange}
                  >
                    <option value="">Select Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Specialist">Specialist</option>
                  </select>
                  {errors.nurseLevel && (
                    <span className="error-message">{errors.nurseLevel}</span>
                  )}
                </div>
              )}

              <div className={`form-group ${errors.password ? "error" : ""}`}>
                <label>
                  <FaLock /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className={`form-group ${errors.photo ? "error" : ""}`}>
                <label>
                  <FaImage /> Upload Image
                </label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                />
                {previewImage && (
                  <img src={previewImage} alt="Preview" className="image-preview" />
                )}
                {errors.photo && (
                  <span className="error-message">{errors.photo}</span>
                )}
              </div>

              <motion.button type="submit" className="submit-btn">
                Add
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctorForm;
