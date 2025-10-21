import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import "./addconsultationform.css";

const AddConsultationForm = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Initialize the consultation data with today's date in ISO format.
  const today = new Date();
  const todayISO = today.toISOString();

  const [consultation, setConsultation] = useState({
    patientId: patientId || "",
    doctorId: "",
    appointmentDate: todayISO, // Will be updated at submit time.
    emergencyLevel: "",
    reason: "",
    diagnosis: "",
  });

  const [error, setError] = useState("");

  const emergencyLevels = [
    { value: "low", label: "Low" },
    { value: "moderate", label: "Moderate" },
    { value: "critical", label: "Critical" },
  ];

  // Fetch the connected doctor's profile and set doctorId.
  useEffect(() => {
    async function fetchDoctor() {
      try {
        const response = await axios.get("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data && response.data._id) {
          setConsultation((prev) => ({
            ...prev,
            doctorId: response.data._id,
          }));
        } else {
          console.warn("No doctor ID returned from /api/profile/me");
        }
      } catch (error) {
        console.error("Error fetching doctor info:", error);
      }
    }
    fetchDoctor();
  }, []);

  // Handle input change for both regular inputs and react-select.
  const handleChange = (e) => {
    if (e.target) {
      setConsultation((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    } else {
      // For react-select, e is the selected option.
      setConsultation((prev) => ({ ...prev, emergencyLevel: e.value }));
    }
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Update the appointment date to the current time at submission.
    const nowISO = new Date().toISOString();
    const updatedConsultation = { ...consultation, appointmentDate: nowISO };

    setError("");
    try {
      const response = await axios.post(
        "/consultations/consultation/add",
        updatedConsultation
      );
      if (response.status === 201) {
        // Extract the created consultation's ID from the "consultation" property.
        const createdConsultationId = response.data.consultation?._id;
        if (!createdConsultationId) {
          console.warn(
            "Consultation ID not found in response, redirecting without the ID."
          );
          navigate("/c-prescription");
        } else {
          // Navigate and pass the consultation ID via state.
          navigate("/c-prescription", {
            state: { consultationId: createdConsultationId },
          });
        }
      }
    } catch (error) {
      setError("Erreur lors de l'ajout de la consultation. Veuillez réessayer.");
      console.error(error);
    }
  };

  if (!patientId) {
    return (
      <div className="error-message">
        Veuillez sélectionner un patient avant de créer une consultation.
      </div>
    );
  }

  return (
    <div className="consultation-container">
      <div className="content-wrapper">
        <div className="form-section">
          <form onSubmit={handleSubmit} className="add-consultation-form">
            <div className="form-header">
              <h3>Add the details of the consultation</h3>
            </div>
            <div className="form-fields">
              {/* Hidden input to include the doctor's ID */}
              <input
                type="hidden"
                name="doctorId"
                value={consultation.doctorId}
              />

              {/* The date field is omitted from the form; today's date is automatically used */}

              <div className="form-group">
                <label>level of urgence</label>
                <Select
                  name="emergencyLevel"
                  value={emergencyLevels.find(
                    (option) => option.value === consultation.emergencyLevel
                  )}
                  onChange={handleChange}
                  options={emergencyLevels}
                  placeholder="Sélectionnez le niveau d'urgence"
                  required
                />
              </div>

              <div className="form-group">
                <label>Raison</label>
                <input
                  type="text"
                  name="reason"
                  value={consultation.reason}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Diagnostic</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={consultation.diagnosis}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Submit the consultation
            </button>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddConsultationForm;
