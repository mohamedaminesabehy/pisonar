import { useState, useEffect } from "react";
import axios from "../api/axios";
import "./AssignRessource.css";
import { FaBox, FaSearch } from "react-icons/fa";

const AssignRessource = () => {
  const [patients, setPatients] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedResources, setSelectedResources] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchAvailableResources();
  }, []);

  // Fetch patients et filtrer ceux qui n'ont pas de ressources assignées ET dont le status n'est pas "Discharged"
  const fetchPatients = async () => {
    try {
      const res = await axios.get("/patients/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Full response data:", res.data); // Inspection de la forme de la réponse

      // Extraction de la liste des patients selon différentes structures possibles.
      let patientsArray;
      if (Array.isArray(res.data)) {
        patientsArray = res.data;
      } else if (Array.isArray(res.data.patients)) {
        patientsArray = res.data.patients;
      } else if (Array.isArray(res.data.data)) {
        patientsArray = res.data.data;
      } else {
        console.error("Unexpected patients data structure:", res.data);
        return;
      }

      // Filtrer les patients qui n'ont PAS de ressources assignées ET dont le status n'est pas "Discharged"
      const filteredPatients = patientsArray.filter(
        (patient) =>
          (!patient.assignedResources || patient.assignedResources.length === 0) &&
          patient.status !== "Discharged"
      );
      setPatients(filteredPatients);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  // Fetch des ressources disponibles (status "Available")
  const fetchAvailableResources = async () => {
    try {
      const res = await axios.get("/resources", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const available = res.data.filter((r) => r.status === "Available");
      setResources(available);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  // Ouvrir le popup d'assignation pour un patient.
  const openAssignPopup = (patient) => {
    setSelectedPatient(patient);
    setSelectedResources([]);
    setShowPopup(true);
  };

  // Gérer le changement de l'état de la checkbox.
  const handleCheckboxChange = (resourceId) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  // Appel API pour assigner les ressources sélectionnées au patient.
  const handleAssign = async () => {
    if (!selectedResources.length || !selectedPatient) return;
    try {
      const response = await axios.post(
        "/resources/as",
        {
          resourceIds: selectedResources,
          patientId: selectedPatient._id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Si l'assignation a réussi.
      if (response.status === 200) {
        setToastMessage("Resources assigned successfully!");
        setTimeout(() => setToastMessage(null), 3000);

        // Retirer le patient de la liste puisqu'il reçoit une assignation.
        setPatients((prev) =>
          prev.filter((p) => p._id !== selectedPatient._id)
        );

        // Réinitialiser le popup et les sélections.
        setSelectedPatient(null);
        setSelectedResources([]);
        setShowPopup(false);

        // Rafraîchir la liste des ressources disponibles.
        fetchAvailableResources();
      }
    } catch (err) {
      console.error("Assignment failed:", err);
      alert("Failed to assign resources.");
    }
  };

  // Filtrer les patients par nom (firstName + lastName).
  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="assign-container">
      <div className="section-header">
        <h2>
          <FaBox /> Assign Resources to Patients
        </h2>
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {toastMessage && (
        <div className="toast-message success">{toastMessage}</div>
      )}

      {filteredPatients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <div className="table-container">
          <table className="assign-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Address</th>
                <th>Insurance No.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.firstName}</td>
                  <td>{patient.email}</td>
                  <td>{patient.gender}</td>
                  <td>
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString()
                      : "Invalid Date"}
                  </td>
                  <td>{patient.address || "—"}</td>
                  <td>{patient.insuranceNumber || "—"}</td>
                  <td>
                    <button
                      className="assign-btn"
                      onClick={() => openAssignPopup(patient)}
                    >
                      Assign Resource
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="assign-popup">
            <h3>
              Assign Resources to{" "}
              {selectedPatient
                ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                : ""}
            </h3>
            <div className="checkbox-list">
              {resources.map((res) => (
                <label key={res._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    value={res._id}
                    checked={selectedResources.includes(res._id)}
                    onChange={() => handleCheckboxChange(res._id)}
                  />
                  {res.type} – {res.location}
                </label>
              ))}
            </div>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleAssign}>
                Confirm
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignRessource;
