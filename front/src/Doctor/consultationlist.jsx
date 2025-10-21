import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./consultationlist.css";
import "font-awesome/css/font-awesome.min.css";
import { FaChevronRight, FaChevronLeft, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const ConsultationList = () => {
  const [consultations, setConsultations] = useState([]);
  const [userData, setUserData] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(null);

  const navigate = useNavigate();

  // Fetch user profile and extract doctor info.
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/profile/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const profile = response.data;
      setUserData(profile);
      if (profile?.role === "Doctor") {
        setDoctorId(profile._id);
      }
      return profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Fetch consultations for the connected doctor.
  const fetchConsultations = async () => {
    try {
      const profile = await fetchUserProfile();
      if (!profile || !profile._id) {
        console.warn("No doctor data found from user profile.");
        return;
      }
      const token = localStorage.getItem("token");
      // Adjusted endpoint: consultations of a doctor only.
      const response = await axios.get(`/consultations/consultation/doctor/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching doctor's consultations:", error);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // DELETE actions
  const handleDeleteClick = (id) => {
    setConsultationToDelete(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/consultations/consultation/${consultationToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConsultations();
    } catch (error) {
      console.error("Error deleting consultation:", error);
    } finally {
      setShowDeletePopup(false);
      setConsultationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setConsultationToDelete(null);
  };

  // EDIT actions: open the edit modal with the selected consultation.
  const handleEditClick = (consultation) => {
    setCurrentConsultation({ ...consultation });
    setShowEditModal(true);
  };

  // Handle input changes in the update modal.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentConsultation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // On update submission, remove the date field and set it to today's date automatically.
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // Set appointmentDate to current timestamp (today)
      const updatedConsultation = {
        ...currentConsultation,
        appointmentDate: new Date().toISOString(),
      };
      await axios.put(
        `/consultations/consultation/${currentConsultation._id}`,
        updatedConsultation,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchConsultations();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating consultation:", error);
    }
  };

  // Preview prescription handler.
  const handlePreviewPrescription = async (consultation) => {
    if (!consultation.prescription) {
      Swal.fire("Info", "No prescription is assigned to this consultation.", "info");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/prescriptions/${consultation.prescription}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prescription = response.data.data || response.data;
      const medDetails = prescription.medications
        .map(
          (med) =>
            `${med.medication.nomMedicament} - Quantity: ${med.quantity}, Duration: ${med.duration} days, Times/Day: ${med.timesPerDay}`
        )
        .join("\n");
      Swal.fire({
        title: "Prescription Details",
        html: `
          <p><strong>Prescription Code:</strong> ${prescription.codePrescription}</p>
          <p><strong>Description:</strong> ${prescription.description || "N/A"}</p>
          <p><strong>Medications:</strong></p>
          <pre style="text-align:left;">${medDetails}</pre>
        `,
        icon: "info",
        width: "600px",
      });
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      Swal.fire("Error", "Failed to fetch prescription details.", "error");
    }
  };

  return (
    <div className="consultation-list-container">
      <h2>List of Consultations</h2>
      <div className="consultation-cards">
        {consultations.map((consultation, index) => (
          <div key={consultation._id || index} className="consultation-card-container">
            <div className="consultation-card">
              <h3>{`Consultation #${index + 1}`}</h3>
              <p>
                <strong>Patient:</strong>{" "}
                {consultation.patientId?.firstName || "N/A"}
              </p>
              <p>
                <strong>Doctor:</strong>{" "}
                {consultation.doctorId?.fullName || "N/A"}
              </p>
              <p>
                <strong>Appointment Date:</strong>{" "}
                {consultation.appointmentDate
                  ? new Date(consultation.appointmentDate).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Emergency Level:</strong>{" "}
                {consultation.emergencyLevel || "N/A"}
              </p>
              <p>
                <strong>Reason:</strong> {consultation.reason || "N/A"}
              </p>
              <p>
                <strong>Diagnosis:</strong>{" "}
                {consultation.diagnosis || "Not yet provided"}
              </p>
            </div>
            <div className="card-actions">
              <div className="left-actions">
                <button
                  className="eye-btn"
                  onClick={() => handlePreviewPrescription(consultation)}
                  title="Preview Prescription"
                >
                  <FaEye />
                </button>
              </div>
              <div className="right-actions">
                <button
                  className="update-btn"
                  onClick={() => handleEditClick(consultation)}
                  title="Edit Consultation"
                >
                  <FaEdit />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteClick(consultation._id)}
                  title="Delete Consultation"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={cancelDelete}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <p>Are you sure you want to delete this consultation?</p>
            </div>
            <div className="popup-footer">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (without an appointment date field; today's date is applied automatically upon submission) */}
      {showEditModal && currentConsultation && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-header">
              <h3>Edit Consultation</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <form onSubmit={handleUpdateSubmit}>
                {/* Removed Appointment Date field */}
                <div className="form-group">
                  <label>Emergency Level:</label>
                  <select
                    name="emergencyLevel"
                    value={currentConsultation?.emergencyLevel || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select level</option>
                    <option value="low">Low</option>
                    <option value="medium">Moderate</option>
                    <option value="high">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reason:</label>
                  <textarea
                    name="reason"
                    value={currentConsultation?.reason || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Diagnosis:</label>
                  <textarea
                    name="diagnosis"
                    value={currentConsultation?.diagnosis || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            </div>
            <div className="popup-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" type="submit" onClick={handleUpdateSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationList;
