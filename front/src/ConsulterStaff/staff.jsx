import { useState, useEffect } from "react";
import axios from '../api/axios';
import { FaChevronRight, FaChevronLeft, FaUserMd, FaUserNurse, FaUsers } from "react-icons/fa";
import "./staff.css";

const Staff = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false); // New state for details popup
  const [selectedStaff, setSelectedStaff] = useState(null); // New state for selected staff member
  const itemsPerPage = 5;

  const BASE_URL = "http://localhost:3006";
  const FALLBACK_IMAGE = "/src/assets/images/admin.jpg";

  const fetchStaffMembers = async (role) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = role === "doctor" ? "/doctors" : "/nurses";
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStaffMembers(response.data);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      setError("Failed to load staff members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMembers(selectedRole);
  }, [selectedRole]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = staffMembers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const maxPages = Math.ceil(staffMembers.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, maxPages));
  };

  const showDetails = (staff) => {
    setSelectedStaff(staff); // Set the selected staff member
    setShowDetailsPopup(true); // Show the details popup
  };

  const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedStaff(null);
  };

  const showDeleteConfirmation = (id) => {
    setStaffToDelete(id);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;

    try {
      const endpoint = selectedRole === "doctor" ? `/doctors/${staffToDelete}` : `/nurses/${staffToDelete}`;
      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccessMessage("Staff member successfully deleted!");
      fetchStaffMembers(selectedRole);
      setTimeout(() => setSuccessMessage(null), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error("Error deleting staff member:", error);
      setError("Failed to delete staff member. Please try again.");
    } finally {
      setShowDeletePopup(false);
      setStaffToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setStaffToDelete(null);
  };

  return (
    <div className="staff-container">
      <div className="role-selection">
        <button
          className={`role-btn ${selectedRole === "doctor" ? "active" : ""}`}
          onClick={() => setSelectedRole("doctor")}
        >
          <FaUserMd /> Doctor
        </button>
        <button
          className={`role-btn ${selectedRole === "nurse" ? "active" : ""}`}
          onClick={() => setSelectedRole("nurse")}
        >
          <FaUserNurse /> Nurse
        </button>
      </div>

      <div className="recent-doctors">
        <div className="section-header">
          <h2>
            <FaUsers /> Staff Members
          </h2>
        </div>

        {isLoading && <div className="loading-message">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {!isLoading && !error && (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Photo</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Date of Birth</th>
                    <th>Gender</th>
                    <th>Password</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((member) => (
                    <tr key={member._id}>
                      <td>{member._id}</td>
                      <td>
                        <img
                          src={
                            member.photo
                              ? `${BASE_URL}${member.photo}`
                              : FALLBACK_IMAGE
                          }
                          alt={member.fullName}
                          className="staff-photo"
                          onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                        />
                      </td>
                      <td>{member.fullName}</td>
                      <td>{member.email}</td>
                      <td>
                        {member.dateOfBirth
                          ? new Date(member.dateOfBirth).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{member.gender}</td>
                      <td>{"********"}</td>
                      <td>
                        <span className={`status ${member.status?.toLowerCase() || "active"}`}>
                          {member.status || "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="details-btn" // Changed from `edit-btn` to `details-btn`
                            onClick={() => showDetails(member)} // Pass the entire member object
                          >
                            Details
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => showDeleteConfirmation(member._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                <FaChevronLeft /> Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === Math.ceil(staffMembers.length / itemsPerPage)}
              >
                Next <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this staff member?</p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleDelete}>
                Delete
              </button>
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Popup */}
      {showDetailsPopup && selectedStaff && (
        <div className="popup-overlay">
          <div className="popup-container details-popup">
            <h3>{selectedRole === "doctor" ? "Doctor" : "Nurse"} Details</h3>
            <div className="staff-details">
              <img
                src={
                  selectedStaff.photo
                    ? `${BASE_URL}${selectedStaff.photo}`
                    : FALLBACK_IMAGE
                }
                alt={selectedStaff.fullName}
                className="staff-photo-large"
                onError={(e) => (e.target.src = FALLBACK_IMAGE)}
              />
              <p><strong>ID:</strong> {selectedStaff._id}</p>
              <p><strong>Full Name:</strong> {selectedStaff.fullName}</p>
              <p><strong>Email:</strong> {selectedStaff.email}</p>
              <p><strong>Date of Birth:</strong> {selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toLocaleDateString() : "N/A"}</p>
              <p><strong>Gender:</strong> {selectedStaff.gender}</p>
              {selectedRole === "doctor" && (
                <p><strong>Specialization:</strong> {selectedStaff.specialization || "N/A"}</p>
              )}
              {selectedRole === "nurse" && (
                <>
                  <p><strong>Level:</strong> {selectedStaff.level || "N/A"}</p>
                  <p><strong>Skills:</strong> {selectedStaff.skills?.join(", ") || "N/A"}</p>
                  <p><strong>About:</strong> {selectedStaff.about || "N/A"}</p>
                  <p><strong>Languages:</strong> {selectedStaff.languages?.join(", ") || "N/A"}</p>
                  <p><strong>Address:</strong> {selectedStaff.address || "N/A"}</p>
                </>
              )}
              <p><strong>Added By:</strong> {selectedStaff.addedBy || "N/A"}</p>
            </div>
            <div className="popup-buttons">
              <button className="close-btn" onClick={closeDetailsPopup}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;