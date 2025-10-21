import { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css"; // Import the CSS file

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:3006/auth/forgot-password", { email });
      setMessage(response.data.message);
      setStep(2); // Move to OTP verification step
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("http://localhost:3006/auth/verify-otp-password-reset", { email, otp });
      setMessage(response.data.message);
      setStep(3); // Move to password reset step
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post("http://localhost:3006/auth/reset-password", { email, newPassword });
      setMessage(response.data.message);
      setError("");
      // Redirect to the login page after resetting the password
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Password Reset</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {step === 1 && (
        <div>
          <p>Enter your email to receive an OTP:</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOtp}>Send OTP</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>Enter the OTP received in your email:</p>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p>Enter your new password:</p>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleResetPassword}>Reset Password</button>
        </div>
      )}
    </div>
  );
}