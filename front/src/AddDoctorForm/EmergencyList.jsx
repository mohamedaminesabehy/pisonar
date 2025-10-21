import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./EmergencyList.css";

const EmergencyList = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentEmergency, setCurrentEmergency] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchEmergencies();
  }, []);

  // Fetch the list of emergencies
  const fetchEmergencies = async () => {
    try {
      const response = await axios.get("/emergencies");
      setEmergencies(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      Swal.fire("Error", "Failed to fetch emergencies", "error");
    }
  };

  // Delete an emergency
  const handleDeleteEmergency = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will not be able to recover this emergency!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`/emergencies/${id}`);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Emergency has been deleted",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchEmergencies();
      }
    } catch (error) {
      console.error("Error deleting emergency:", error);
      Swal.fire("Error", "Failed to delete emergency", "error");
    }
  };

  // Open view modal (read-only details)
  const handleView = (emergency) => {
    setCurrentEmergency(emergency);
    setIsViewModalOpen(true);
  };

  // Open edit modal (pre-filled with current data)
  const handleEdit = (emergency) => {
    setCurrentEmergency({ ...emergency, image: null }); // Reset image for new upload
    setIsEditModalOpen(true);
  };

  // Handle update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", currentEmergency.title);
      formData.append("description", currentEmergency.description);
      formData.append("longitude", currentEmergency.position.longitude);
      formData.append("latitude", currentEmergency.position.latitude);
      if (currentEmergency.image) {
        formData.append("image", currentEmergency.image);
      }

      await axios.put(`/emergencies/${currentEmergency._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Emergency updated successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
      setIsEditModalOpen(false);
      fetchEmergencies();
    } catch (error) {
      console.error("Error updating emergency:", error);
      Swal.fire("Error", "Failed to update emergency", "error");
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setCurrentEmergency((prev) => ({ ...prev, image: files[0] || null }));
    } else if (name === "longitude" || name === "latitude") {
      setCurrentEmergency((prev) => ({
        ...prev,
        position: { ...prev.position, [name]: parseFloat(value) || 0 },
      }));
    } else {
      setCurrentEmergency((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Filter emergencies based on search query
  const filteredEmergencies = emergencies.filter((emergency) =>
    emergency.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emergency.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Truncate description for card display
  const truncateDescription = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="container">
      <h2 className="title">Emergency List</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search emergencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      {filteredEmergencies.length === 0 ? (
        <p className="no-results">No emergencies found</p>
      ) : (
        <div className="emergency-grid">
          {filteredEmergencies.map((emergency) => (
            <div key={emergency._id} className="emergency-card">
              <h3 className="card-title">{emergency.title}</h3>
              <p className="card-description">{truncateDescription(emergency.description)}</p>
              <div className="card-map">
                <MapContainer
                  center={[emergency.position.latitude, emergency.position.longitude]}
                  zoom={13}
                  style={{ height: "150px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[emergency.position.latitude, emergency.position.longitude]}>
                    <Popup>{emergency.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="card-image">
                {emergency.image ? (
                  <a href={`http://localhost:3006/${emergency.image}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`http://localhost:3006/${emergency.image}`}
                      alt={emergency.title}
                      className="emergency-thumbnail"
                    />
                  </a>
                ) : (
                  <span>No Image</span>
                )}
              </div>
              <div className="card-actions">
                <button onClick={() => handleView(emergency)} className="btn-view" title="View">
                  <FaEye />
                </button>
            
                <button onClick={() => handleDeleteEmergency(emergency._id)} className="btn-delete" title="Delete">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && currentEmergency && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Emergency Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="close-btn" title="Close">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="emergency-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{currentEmergency.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{currentEmergency.description}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Longitude:</span>
                  <span className="detail-value">{currentEmergency.position.longitude}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Latitude:</span>
                  <span className="detail-value">{currentEmergency.position.latitude}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Image:</span>
                  <span className="detail-value">
                    {currentEmergency.image ? (
                      <a href={`http://localhost:3006/${currentEmergency.image}`} target="_blank" rel="noopener noreferrer">
                        View Image
                      </a>
                    ) : (
                      "No Image"
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsViewModalOpen(false)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentEmergency && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Emergency</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn" title="Close">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={currentEmergency.title || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={currentEmergency.description || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={currentEmergency.position.longitude || ""}
                    onChange={handleInputChange}
                    step="any"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={currentEmergency.position.latitude || ""}
                    onChange={handleInputChange}
                    step="any"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Upload Image (Optional)</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  {currentEmergency.image && (
                    <p className="file-name">
                      Current: <a href={`http://localhost:3006/${currentEmergency.image}`} target="_blank" rel="noopener noreferrer">
                        View Image
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <button type="submit" className="submit-btn">
                Save Emergency
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyList;