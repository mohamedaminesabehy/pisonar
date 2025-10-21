import { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import axios from "../api/axios";
import "./Profile.css";
import doc3 from "/src/assets/images/admin.jpg";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Backend base URL (adjust if your backend runs on a different port or domain)
  const BASE_URL = "http://localhost:3006";

  // Default skills and languages
  const defaultSkills = ["General Medicine", "Pediatrics", "Cardiology", "Emergency Care", "Patient Consultation", "Medical Diagnostics"];
  const defaultLanguages = ["English", "French", "Arabic"];

  // Default cover image
  const coverImage = "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/profile/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token
          },
        });
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle Edit button click
  const handleEditClick = () => {
    navigate("/edit-staff");
  };

  if (loading) {
    return <div className="loading-message">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Destructure user data or use default values
  const {
    fullName = "",
    email = "user@example.com",
    role = "",
    photo = doc3,
    dateOfBirth = "",
    gender = "",
    specialization = "",
    skills = defaultSkills,
    about = "A dedicated healthcare professional with years of experience in the medical field.",
    languages = defaultLanguages,
    address = "",
    level = "",
    medicalHistory = [],
    insuranceNumber = ""
  } = userData || {};

  // Calculate age from dateOfBirth
  const age = dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : "N/A";

  // Determine display name based on role
  const displayName = role === "Doctor" ? `Dr. ${fullName}` : fullName;

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <img
          src={coverImage || "/placeholder.svg"}
          alt="Cover"
          className="imagggg"
          onError={(e) => (e.target.src = "/placeholder.svg")} // Fallback for cover image
        />
        <div className="banner-overlay"></div>
        <button className="change-cover-btn">
          <FaCamera />
          <span>Change Cover</span>
        </button>
      </div>

      <div className="profile-main">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                <img
                  src={
                    photo && photo !== doc3
                      ? `${BASE_URL}${photo}` // Construct full URL if photo exists
                      : doc3 // Default to doc3 if no photo
                  }
                  alt="Profile"
                  onError={(e) => (e.target.src = doc3)} // Fallback to doc3 on error
                />
                <button className="change-avatar-btn">
                  <FaCamera />
                </button>
              </div>
            </div>
            <div className="profile-basic-info">
              <h2>{displayName}</h2>
              <p className="role">{role}</p>
              <p className="email">{email}</p>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={handleEditClick}>
            Edit Profile
          </button>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            About Me
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "about" && (
            <div className="about-section">
              <div className="about-text">
                <h3>About Me</h3>
                <p>{about}</p>
              </div>

              {/* Conditional rendering based on role */}
              {(role === "Doctor" || role === "Nurse") && (
                <div className="skills-section">
                  <h3>Skills</h3>
                  <div className="skills-container">
                    {skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="languages-section">
                <h3>Languages</h3>
                <div className="languages-container">
                  {languages.map((language, index) => (
                    <span key={index} className="language-tag">
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              <div className="personal-info">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender:</span>
                    <span className="info-value">{gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age:</span>
                    <span className="info-value">{age}</span>
                  </div>
                  {(role === "Doctor" || role === "Nurse") && (
                    <div className="info-item">
                      <span className="info-label">Specialization:</span>
                      <span className="info-value">{specialization}</span>
                    </div>
                  )}
                  {role === "Nurse" && (
                    <div className="info-item">
                      <span className="info-label">Level:</span>
                      <span className="info-value">{level}</span>
                    </div>
                  )}
                  {role === "Patient" && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Medical History:</span>
                        <span className="info-value">{medicalHistory.join(", ")}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Insurance Number:</span>
                        <span className="info-value">{insuranceNumber}</span>
                      </div>
                    </>
                  )}
                  {(role === "Doctor" || role === "Nurse" || role === "Patient") && (
                    <div className="info-item">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;