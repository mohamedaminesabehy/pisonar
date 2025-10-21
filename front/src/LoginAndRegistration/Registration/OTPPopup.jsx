import React, { useState } from 'react';
import axios from '../../api/axios'; // Import Axios

const OTPPopup = ({ email, onVerify, onClose }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Send OTP to the backend for verification
      const response = await axios.post('/auth/verify-otp', { email, otp });
      if (response.data.message === 'Email verified successfully') {
        onVerify(); // Notify the parent component that OTP is verified
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="otp-popup-overlay">
      <div className="otp-popup">
        <h2>Enter OTP</h2>
        <p>Please enter the OTP sent to your email.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default OTPPopup;