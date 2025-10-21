import { useState } from "react";
import axios from '../../api/axios'; // Import Axios
import Swal from 'sweetalert2'; // Import SweetAlert
import "./Registration.css";
import sigupImage from "/src/assets/images/sigup.PNG";
import OTPPopup from './OTPPopup'; // Import the OTPPopup component

export default function Registration() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // For image preview

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0], // Store the file object
      }));
      setPreviewImage(URL.createObjectURL(files[0])); // Preview the selected image
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    // Create FormData object to handle file upload
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", "Patient");
    if (formData.photo) {
      data.append("photo", formData.photo); // Append the file
    }

    try {
      // Send registration data to the backend
      const response = await axios.post('/auth/register', data, {
        headers: {
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      });

      // Show OTP popup after successful registration
      setShowOTPPopup(true);
      Swal.fire({
        title: 'Registration successful!',
        text: response.data.message || 'OTP sent to your email. Please verify to complete registration.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      Swal.fire({
        title: 'Registration failed',
        text: error.response?.data?.error || error.message,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = () => {
    setRegistrationSuccess(true);
    setShowOTPPopup(false);

    // Show SweetAlert after successful OTP verification
    Swal.fire({
      title: 'Success!',
      text: 'Registration and OTP verification successful!',
      icon: 'success',
      confirmButtonText: 'OK',
    });
  };

  const handleOTPClose = () => {
    setShowOTPPopup(false);
  };

  return (
    <div className="registration-container">
      <div className="registration-form-container">
        <h2 className="registration-title">Patient Sign Up</h2>
        <p className="registration-subtitle">Join our healthcare community for personalized care</p>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="photo">Upload Photo</label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*" // Restrict to images
              onChange={handleInputChange}
            />
            {previewImage && (
              <img src={previewImage} alt="Preview" className="image-preview" style={{ maxWidth: "100px", marginTop: "10px" }} />
            )}
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" required />I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>
      <div className="registration-image-container">
        <img src={sigupImage} alt="Medical Illustration" className="registration-image" />
      </div>

      {showOTPPopup && (
        <OTPPopup
          email={formData.email}
          onVerify={handleOTPVerify}
          onClose={handleOTPClose}
        />
      )}

      {registrationSuccess && (
        <div className="toast success">
          <p>Registration successful! Welcome to our healthcare community.</p>
        </div>
      )}
    </div>
  );
}