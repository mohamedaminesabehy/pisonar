import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaVenusMars,
  FaImage,
  FaTools,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaLanguage,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./EditProfile.css";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    photo: null,
    specialization: "",
    nurseLevel: "",
    medicalHistory: [],
    insuranceNumber: "",
    skills: [],
    languages: [],
    about: "",
    address: "",
    role: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:3006";

  // URL de l'image de secours locale
  const FALLBACK_IMAGE = "/src/assets/images/admin.jpg";

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const userData = response.data;

        setFormData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : "",
          gender: userData.gender || "",
          password: "",
          photo: null,
          specialization: userData.specialization || "",
          nurseLevel: userData.level || "",
          medicalHistory: userData.medicalHistory || [],
          insuranceNumber: userData.insuranceNumber || "",
          skills: userData.skills || [],
          languages: userData.languages || [],
          about: userData.about || "",
          address: userData.address || "",
          role: userData.role || "",
        });

        if (userData.photo) {
          setPreviewImage(`${BASE_URL}${userData.photo}`);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSend = new FormData();
    dataToSend.append("fullName", formData.fullName);
    dataToSend.append("email", formData.email);
    dataToSend.append("dateOfBirth", formData.dateOfBirth);
    dataToSend.append("gender", formData.gender);
    if (formData.password) dataToSend.append("password", formData.password);
    if (formData.photo) dataToSend.append("photo", formData.photo);
    dataToSend.append("specialization", formData.specialization);
    dataToSend.append("level", formData.nurseLevel);
    dataToSend.append("medicalHistory", formData.medicalHistory.join(", "));
    dataToSend.append("insuranceNumber", formData.insuranceNumber);
    dataToSend.append("skills", formData.skills.join(", "));
    dataToSend.append("languages", formData.languages.join(", "));
    dataToSend.append("about", formData.about);
    dataToSend.append("address", formData.address);
    dataToSend.append("role", formData.role);

    try {
      const response = await axios.put("/api/profile/update", dataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Profile updated successfully:", response.data);

      if (response.data.photo) {
        setPreviewImage(`${BASE_URL}${response.data.photo}`);
      }

      // Show success modal and redirect after 2 seconds
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/profile"); // Redirect to /profile
      }, 2000);

    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="loading-message">Loading profile...</div>;
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-fo">
        <motion.h1 className="main-title">Edit Profile</motion.h1>
      </div>
      <div className="content-wrapper">
        <div className="form-section">
          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-header">
              <div className="image-upload">
                <label htmlFor="image-upload">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="profile-image"
                      onError={(e) => (e.target.src = FALLBACK_IMAGE)} // Fallback on error
                    />
                  ) : (
                    <div className="image-placeholder">
                      <FaImage />
                      <span>Upload Image</span>
                    </div>
                  )}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  hidden
                />
              </div>
              <h2>Edit Your Profile</h2>
            </div>
            <div className="form-fields">
              <div className={`form-group ${errors.fullName ? "error" : ""}`}>
                <label>
                  <FaUser /> Full Name
                </label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className={`form-group ${errors.email ? "error" : ""}`}>
                <label>
                  <FaEnvelope /> Email
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className={`form-group ${errors.dateOfBirth ? "error" : ""}`}>
                  <label>
                    <FaCalendar /> Date of Birth
                  </label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                  {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>
                <div className={`form-group ${errors.gender ? "error" : ""}`}>
                  <label>
                    <FaVenusMars /> Gender
                  </label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>
              </div>

              {formData.role === "Doctor" && (
                <>
                  <div className="form-group">
                    <label>
                      <FaTools /> Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Enter your specialization"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaTools /> Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills.join(", ")}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value.split(", ") })
                      }
                      placeholder="Enter your skills (comma-separated)"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaLanguage /> Languages
                    </label>
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages.join(", ")}
                      onChange={(e) =>
                        setFormData({ ...formData, languages: e.target.value.split(", ") })
                      }
                      placeholder="Enter languages you speak (comma-separated)"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaInfoCircle /> About
                    </label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaMapMarkerAlt /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  </div>
                </>
              )}

              {formData.role === "Nurse" && (
                <>
                  <div className="form-group">
                    <label>
                      <FaTools /> Level
                    </label>
                    <input
                      type="text"
                      name="nurseLevel"
                      value={formData.nurseLevel}
                      onChange={handleChange}
                      placeholder="Enter your level"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaTools /> Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills.join(", ")}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value.split(", ") })
                      }
                      placeholder="Enter your skills (comma-separated)"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaLanguage /> Languages
                    </label>
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages.join(", ")}
                      onChange={(e) =>
                        setFormData({ ...formData, languages: e.target.value.split(", ") })
                      }
                      placeholder="Enter languages you speak (comma-separated)"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaInfoCircle /> About
                    </label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaMapMarkerAlt /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  </div>
                </>
              )}

              {formData.role === "Patient" && (
                <>
                  <div className="form-group">
                    <label>
                      <FaTools /> Medical History
                    </label>
                    <input
                      type="text"
                      name="medicalHistory"
                      value={formData.medicalHistory.join(", ")}
                      onChange={(e) =>
                        setFormData({ ...formData, medicalHistory: e.target.value.split(", ") })
                      }
                      placeholder="Enter your medical history (comma-separated)"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaTools /> Insurance Number
                    </label>
                    <input
                      type="text"
                      name="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={handleChange}
                      placeholder="Enter your insurance number"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaMapMarkerAlt /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  </div>
                </>
              )}

              <motion.button
                type="submit"
                className="submit-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Update Profile
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="success-modal"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <p>Profile updated successfully! Redirecting to profile...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProfile;