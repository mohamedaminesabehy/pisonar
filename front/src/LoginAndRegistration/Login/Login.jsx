import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from '../../api/axios';
import Swal from 'sweetalert2';
import "./Login.css";
import equipe2 from "/src/assets/images/tttttt.jpg";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Login Successful!',
        showConfirmButton: false,
        timer: 1500,
      });

      if (role === 'Patient') {
        navigate('/dashboard');
      } else if (role === 'Doctor') {
        navigate('/dashboard');
      } else if (role === 'Admin') {
        navigate('/dashboard');
      } else if (role === 'Nurse') {
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Please check your email and password.';
      setError(errorMessage);
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Invalid Credentials',
        text: errorMessage,
        showConfirmButton: false,
        timer: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" role="main">
      <div className="login-form-container">
        <h1 className="login-title">Sign In</h1>
        <p className="login-subtitle">Access your medical records and appointments</p>

        {error && (
          <div className="error-message" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
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
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && <span id="email-error" className="error-text">{error}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "password-error" : undefined}
              minLength="8"
            />
            {error && <span id="password-error" className="error-text">{error}</span>}
          </div>
          <div className="form-options">
            <label className="remember-label">
              <input 
                type="checkbox" 
                aria-label="Remember me"
              /> 
              Remember me
            </label>
            <Link 
              to="/forgot-password" 
              className="forgot-link"
              aria-label="Forgot password? Click to reset your password"
            >
              Forgot Password?
            </Link>
          </div>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
      <div className="login-image-container" role="complementary" aria-label="Healthcare team illustration">
        <img
          src={equipe2 || "/placeholder.svg"}
          alt="Healthcare team providing medical services"
          className="login-image"
        />
      </div>
    </div>
  );
}