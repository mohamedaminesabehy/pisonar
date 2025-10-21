import  { useState, useEffect } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSort,
  FaUndo,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientList.css";

const PatientListN = () => {
  const [patients, setPatients] = useState([]);
  const [backendPatients, setBackendPatients] = useState([]); // liste triée côté serveur
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const statePriority = { Critical: 0, Moderate: 1, Low: 2 };
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get("/patients?populate=doctor", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPatients(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch patients", "error");
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await axios.get("/patients/doctors/available", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctors(res.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load doctors", "error");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will not be able to recover this patient!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });
      if (result.isConfirmed) {
        await axios.delete(`/patients/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        Swal.fire("Deleted!", "Patient has been deleted.", "success");
        fetchPatients();
        setBackendPatients([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete patient", "error");
    }
  };

  const handleView = (patient) => {
    setCurrentPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleEdit = (patient) => {
    const symptomsString = Array.isArray(patient.symptoms)
      ? patient.symptoms.join(", ")
      : "";
    const medicalHistoryString = Array.isArray(patient.medicalHistory)
      ? patient.medicalHistory.join(", ")
      : "";
    setCurrentPatient({ ...patient, symptomsString, medicalHistoryString });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedPatient = {
        ...currentPatient,
        symptoms: currentPatient.symptomsString
          ? currentPatient.symptomsString
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        medicalHistory: currentPatient.medicalHistoryString
          ? currentPatient.medicalHistoryString
              .split(",")
              .map((h) => h.trim())
              .filter(Boolean)
          : [],
      };
      await axios.put(`/patients/${currentPatient._id}`, updatedPatient, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("Success", "Patient updated successfully", "success");
      setIsEditModalOpen(false);
      fetchPatients();
      setBackendPatients([]);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update patient", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setCurrentPatient((prev) => ({ ...prev, [name]: value }));
  };

  // Recherche
  const filteredPatients = patients.filter((p) =>
    (`${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Tri local
  const localSorted = [...filteredPatients].sort((a, b) => {
    const aSt = (a.status || "").toLowerCase();
    const bSt = (b.status || "").toLowerCase();
    if (aSt === "discharged" && bSt !== "discharged") return 1;
    if (aSt !== "discharged" && bSt === "discharged") return -1;
    return (statePriority[a.state] ?? 99) - (statePriority[b.state] ?? 99);
  });

  const displayList = backendPatients.length > 0 ? backendPatients : localSorted;

  const handleSortPatients = async () => {
    try {
      const res = await axios.get("/predictions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBackendPatients(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Impossible de trier via le serveur", "error");
    }
  };

  return (
    <div className="container">
      <h2 className="title">Patient List</h2>

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-buttons">
          <button
            onClick={handleSortPatients}
            className="btn-sort"
            title="Trier par priorité"
          >
            <FaSort /> Sorting And Prediction
          </button>
          {backendPatients.length > 0 && (
            <button
              onClick={() => setBackendPatients([])}
              className="btn-reset"
              title="Réinitialiser"
            >
              <FaUndo /> Reset 
            </button>
          )}
        </div>
      </div>

      {displayList.length === 0 ? (
        <p className="no-results">No patients found</p>
      ) : (
        <div className="table-responsive">
          <table className="patient-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Age</th>
                <th>Chief Complaint</th>
                <th>State</th>
                <th>Status</th>
                <th>Predicted Waiting Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((patient) => {
                const stateClass = (patient.state || "")
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                const statusClass = (patient.status || "")
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <tr key={patient.id}>
                    <td>{patient.firstName}</td>
                    <td>{patient.lastName}</td>
                    <td>{patient.age}</td>
                    <td>{patient.chiefComplaint}</td>
                    <td>
                      <span className={`badge state-${stateClass}`}>
                        {patient.state}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${statusClass}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td>
  {typeof patient.predicted_waiting_time === "number"
    ? `${Math.round(patient.predicted_waiting_time)} min`
    : "Not assigned"}
</td>

                    <td className="actions">
                      <button
                        onClick={() => handleView(patient)}
                        className="btn-view"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(patient)}
                        className="btn-edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="btn-delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && currentPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Patient Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="patient-details-grid">
                <div className="detail-item">
                  <span className="detail-label">First Name:</span>
                  <span className="detail-value">
                    {currentPatient.firstName}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name:</span>
                  <span className="detail-value">
                    {currentPatient.lastName}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{currentPatient.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{currentPatient.age}</span>
                </div>
                {/* Ajoutez d'autres détails si besoin */}
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Patient</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-grid">
                {/* Personal Info */}
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={currentPatient.firstName || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={currentPatient.lastName || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={currentPatient.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={currentPatient.age || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Insurance</label>
                  <input
                    type="text"
                    name="insurance"
                    value={currentPatient.insurance || ""}
                    onChange={handleInputChange}
                    />
                    </div>
                    <div className="form-group">
                  <label>CNAM</label>
                  <input
                    type="text"
                    name="cnam"
                    value={currentPatient.cnam || ""}
                    onChange={handleInputChange}
                  />
                </div>


                {/* Medical Info */}
                <div className="form-group">
                  <label>Chief Complaint</label>
                  <input
                    type="text"
                    name="chiefComplaint"
                    value={currentPatient.chiefComplaint || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Symptoms (comma separated)</label>
                  <textarea
                    name="symptomsString"
                    value={currentPatient.symptomsString || ""}
                    onChange={handleTextareaChange}
                  />
                </div>
                <div className="form-group">
                  <label>Medical History (comma separated)</label>
                  <textarea
                    name="medicalHistoryString"
                    value={currentPatient.medicalHistoryString || ""}
                    onChange={handleTextareaChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Blood Pressure</label>
                    <input
                      type="text"
                      name="bloodPressure"
                      value={currentPatient.bloodPressure || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Glycemic Index</label>
                    <input
                      type="number"
                      name="glycemicIndex"
                      value={currentPatient.glycemicIndex || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Oxygen Saturation</label>
                    <input
                      type="number"
                      name="oxygenSaturation"
                      value={currentPatient.oxygenSaturation || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>State</label>
                    <select
                      name="state"
                      value={currentPatient.state || "Low"}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={currentPatient.status || "Waiting for Doctor"}
                      onChange={handleInputChange}
                    >
                      <option value="Waiting for Doctor">
                        Waiting for Doctor
                      </option>
                      <option value="Under Examination">
                        Under Examination
                      </option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign Doctor</label>
                  <select
                    name="doctor"
                    value={currentPatient.doctor || ""}
                    onChange={handleInputChange}
                    disabled={loadingDoctors}
                  >
                    <option value="">
                      {loadingDoctors
                        ? "Loading doctors..."
                        : "Select a doctor"}
                    </option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.fullName} ({doc.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientListN;
