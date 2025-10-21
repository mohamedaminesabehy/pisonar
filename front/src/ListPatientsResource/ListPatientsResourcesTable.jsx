import { useEffect, useState } from "react";
import axios from "../api/axios";
import "./ListPatientsResources.css";
import { FaBox, FaSearch } from "react-icons/fa";

const ListPatientsResources = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [resourceToRemove, setResourceToRemove] = useState(null);

  useEffect(() => {
    fetchPatientsWithResources();
  }, []);

  // Fetch patients and filter out those with assigned resources.
  // We expect that the backend returns the assignedResources field populated.
  const fetchPatientsWithResources = async () => {
    try {
      const res = await axios.get("/patients/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Accommodate for various API response structures.
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

      // Get only patients with assigned resources.
      const patientsWithResources = patientsArray.filter(
        (user) =>
          user.assignedResources && user.assignedResources.length > 0
      );
      setPatients(patientsWithResources);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  // When a user clicks Remove, remember which resource to remove.
  const handleRemoveClick = (patientId, resourceId) => {
    setResourceToRemove({ patientId, resourceId });
    setShowConfirm(true);
  };

  // Confirm removal of the resource.
  const confirmRemove = async () => {
    if (!resourceToRemove) return;
    const { patientId, resourceId } = resourceToRemove;
    try {
      await axios.delete(`/resources/remove/${patientId}/${resourceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setShowConfirm(false);
      setResourceToRemove(null);
      fetchPatientsWithResources();
    } catch (err) {
      console.error("Failed to remove resource:", err);
    }
  };

  // Filter patients by concatenated first and last name.
  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="assign-container">
      <div className="section-header">
        <h2>
          <FaBox /> Patients & Assigned Resources
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

      {filteredPatients.length === 0 ? (
        <p>No matching patients with assigned resources.</p>
      ) : (
        <div className="table-container">
          <table className="assign-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Email</th>
                <th>Assigned Resources</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.firstName}</td>
                  <td>{patient.email}</td>
                  <td>
                    <ul className="resource-list">
                      {patient.assignedResources.map((resource) =>
                        // Since the assignedResources are populated, they are objects.
                        typeof resource === "object" && resource !== null ? (
                          <li key={resource._id}>
                            {resource.type || "Unknown Resource"} –{" "}
                            {resource.location || "Unknown Location"}
                            <button
                              className="remove-btn"
                              onClick={() =>
                                handleRemoveClick(patient._id, resource._id)
                              }
                            >
                              Remove
                            </button>
                          </li>
                        ) : (
                          <li key={resource}>
                            {resource}{" "}
                            <button
                              className="remove-btn"
                              onClick={() =>
                                handleRemoveClick(patient._id, resource)
                              }
                            >
                              Remove
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirm && (
        <div className="popup-overlay">
          <div className="assign-popup">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to remove this resource from the patient?
            </p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={confirmRemove}>
                Delete
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
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

export default ListPatientsResources;
