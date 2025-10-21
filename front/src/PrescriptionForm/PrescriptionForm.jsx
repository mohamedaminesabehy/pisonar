import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import {
  FaClipboard,
  FaUserMd,
  FaSearch,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./PrescriptionForm.css";

const PrescriptionForm = () => {
  // Retrieve the consultation ID from router state.
  const location = useLocation();
  const consultationId = location.state?.consultationId; 

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patient: "",
    patientName: "",
    doctor: "",
    description: "",
    medications: [],

  });

  const [medications, setMedications] = useState([]);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchMedications();
  }, []);

  // Fetch logged-in user's profile.
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/profile/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data) {
        setFormData((prev) => ({
          ...prev,
          doctor: response.data._id,
        }));
        fetchLastConsultation(response.data._id);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Fetch the last consultation of the logged-in doctor.
  const fetchLastConsultation = async (doctorId) => {
    try {
      const response = await axios.get(`/consultations/consultation/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Extract the array of consultations (use response.data.data if needed)
      const consultations = response.data.data || response.data;
      if (consultations && consultations.length > 0) {
        // Sort consultations by appointment date descending.
        const sortedConsultations = consultations.sort(
          (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );
        const lastConsultation = sortedConsultations[0];
        if (lastConsultation && lastConsultation.patientId) {
          setFormData((prev) => ({
            ...prev,
            patient: lastConsultation.patientId._id || lastConsultation.patientId,
            patientName: `${lastConsultation.patientId.firstName || ""} ${lastConsultation.patientId.lastName || ""}`.trim(),
          }));
        } else {
          console.warn("The last consultation has no patient info.");
        }
      } else {
        console.warn("No consultation found for this doctor.");
      }
    } catch (error) {
      console.error("Error fetching last consultation:", error);
    }
  };

  // Fetch all medications.
  const fetchMedications = async () => {
    try {
      const response = await axios.get("/pharmacy");
      if (response.data && Array.isArray(response.data)) {
        setMedications(response.data);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMedicationChange = (medicationId, field, value) => {
    setSelectedMedications((prev) =>
      prev.map((med) =>
        med.medication === medicationId ? { ...med, [field]: value } : med
      )
    );
  };

  const handleMedicationSelection = (medicationId) => {
    if (!selectedMedications.some((m) => m.medication === medicationId)) {
      setSelectedMedications((prev) => [
        ...prev,
        { medication: medicationId, quantity: 1, duration: 1, timesPerDay: 1 },
      ]);
      setSearchTerm("");
      setShowDropdown(false);
    }
  };

  const removeMedication = (medicationId) => {
    setSelectedMedications((prev) =>
      prev.filter((med) => med.medication !== medicationId)
    );
  };

  const handleMedicationSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build prescription data with the selected medications.
    const prescriptionData = { ...formData, medications: selectedMedications };
    try {
      const response = await axios.post("/prescriptions/", prescriptionData);
      if (response.status === 201) {
        // Retrieve the created prescription ID.
        const createdPrescriptionId =
          response.data?.data?._id || response.data?._id;
        // If a consultation ID was passed and the prescription was created, update the consultation.
        if (consultationId && createdPrescriptionId) {
          await axios.put(
            `/consultations/consultation/${consultationId}`,
            { prescription: createdPrescriptionId },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
        }
        Swal.fire("Success", "Prescription added and consultation updated successfully!", "success");
        navigate("/prescription-history");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add prescription.", "error");
      console.error(error);
    }
  };

  return (
    <div className="prescription-container">
      <h1 className="main-title">Prescription Management</h1>
      <div className="form-section">
        <form onSubmit={handleSubmit}>
   
          {/* Patient info (disabled input) */}
          <div className="form-group">
            <label><FaUserMd /> Patient</label>
            <input type="text" value={formData.patientName} disabled placeholder="Patient Name" />
          </div>
          {/* Description */}
          <div className="form-group">
            <label><FaClipboard /> Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description (optional)"
            />
          </div>
          {/* Medication search and selection */}
          <div className="form-group search-group">
            <label><FaSearch /> Search Medication</label>
            <input
              type="text"
              placeholder="Search medication..."
              value={searchTerm}
              onChange={handleMedicationSearch}
            />
            {showDropdown && searchTerm && (
              <div className="medication-dropdown">
                {medications
                  .filter((m) =>
                    m.nomMedicament.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((m) => (
                    <div
                      key={m._id}
                      className="medication-item"
                      onClick={() => handleMedicationSelection(m._id)}
                    >
                      {m.nomMedicament}
                    </div>
                  ))}
              </div>
            )}
          </div>
          {selectedMedications.length > 0 && (
            <div className="selected-medications">
              {selectedMedications.map((med) => (
                <div key={med.medication} className="medication-item">
                  <span>
                    {medications.find((m) => m._id === med.medication)?.nomMedicament}
                  </span>
                  <div className="medication-inputs">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={med.quantity}
                      onChange={(e) =>
                        handleMedicationChange(med.medication, "quantity", e.target.value)
                      }
                    />
                    <label>Days</label>
                    <input
                      type="number"
                      min="1"
                      value={med.duration}
                      onChange={(e) =>
                        handleMedicationChange(med.medication, "duration", e.target.value)
                      }
                    />
                    <label>Times/Day</label>
                    <input
                      type="number"
                      min="1"
                      value={med.timesPerDay}
                      onChange={(e) =>
                        handleMedicationChange(med.medication, "timesPerDay", e.target.value)
                      }
                    />
                    <FaTimes
                      className="remove-medication"
                      onClick={() => removeMedication(med.medication)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
       
          <button type="submit" className="submit-btn">
            Add Prescription
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
