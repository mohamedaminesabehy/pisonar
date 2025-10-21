// FaceLogin.jsx
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

function FaceLogin() {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('');

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setStatus('Verifying...');

    try {
      const res = await axios.post('http://localhost:5000/api/face-login', {
        image: imageSrc,
      });
      setStatus(res.data.message);
    } catch (err) {
      setStatus('Login failed');
    }
  };

  return (
    <div>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={capture}>Login with Face</button>
      <p>{status}</p>
    </div>
  );
}

export default FaceLogin;
