import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
    FaBox,
    FaChevronLeft,
    FaChevronRight,
    FaEdit,
    FaTrash,
    FaInfoCircle,
} from "react-icons/fa";
import "./MaterielResources.css";

const MaterielResources = () => {
    const [resources, setResources] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedResource, setSelectedResource] = useState(null);
    const [popupMode, setPopupMode] = useState(""); // 'view' or 'edit'
    const [showPopup, setShowPopup] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    const itemsPerPage = 5;

    const statusOptions = ["Available", "Occupied", "Under Maintenance"];
    const resourceTypes = [
        "Ventilator", "Defibrillator", "ECGMachine", "InfusionPump",
        "Stretcher", "Monitor", "SuctionDevice", "CrashCart",
        "Bed", "Wheelchair", "IVStand", "MedicalCart", "ExaminationTable"
    ];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await axios.get("/resources", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setResources(response.data);
        } catch (err) {
            setError("Failed to fetch resources");
        }
    };

    const currentItems = resources.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const maxPages = Math.ceil(resources.length / itemsPerPage);

    const openPopup = (resource, mode) => {
        setSelectedResource({ ...resource }); // clone for editing
        setPopupMode(mode);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedResource(null);
    };

    const confirmDelete = (id) => {
        setResourceToDelete(id);
        setShowDeletePopup(true);
    };

    const cancelDelete = () => {
        setShowDeletePopup(false);
        setResourceToDelete(null);
    };

    const handleDelete = async () => {
        if (!resourceToDelete) return;
        try {
            await axios.delete(`/resources/${resourceToDelete}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setResources(prev => prev.filter(r => r._id !== resourceToDelete));
            setSuccessMessage("Resource deleted successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError("Failed to delete resource");
        } finally {
            cancelDelete();
        }
    };

    const handleUpdate = async () => {
        try {
            const { _id, __v, ...fieldsToUpdate } = selectedResource;
            await axios.post(`/resources/update/${_id}`, fieldsToUpdate, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            await fetchResources();
            setSuccessMessage("Resource updated successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
            closePopup();
        } catch (err) {
            setError("Failed to update resource");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedResource(prev => ({
            ...prev,
            [name]: name === "isFunctional" ? value === "true" : value,
        }));
    };

    return (
        <div className="staff-container">
            <div className="recent-doctors">
                <div className="section-header">
                    <h2><FaBox /> Material Resources</h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Good State</th>
                            <th>Location</th>
                            <th>Last Maintenance</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.map(resource => (
                            <tr key={resource._id}>
                                <td>{resource._id}</td>
                                <td>{resource.type}</td>
                                <td><span className={`status ${resource.status?.toLowerCase().replace(/\s+/g, "-")}`}>{resource.status}</span></td>
                                <td><span className={`status ${resource.isFunctional ? "active" : "inactive"}`}>{resource.isFunctional ? "Yes" : "No"}</span></td>
                                <td>{resource.location}</td>
                                <td>{resource.lastMaintenanceDate ? new Date(resource.lastMaintenanceDate).toLocaleDateString() : "N/A"}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="details-btn" onClick={() => openPopup(resource, "view")}><FaInfoCircle /></button>
                                        <button className="details-btn" onClick={() => openPopup(resource, "edit")}><FaEdit /></button>
                                        <button className="delete-btn" onClick={() => confirmDelete(resource._id)}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        <FaChevronLeft /> Previous
                    </button>
                    <span>Page {currentPage}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, maxPages))} disabled={currentPage === maxPages}>
                        Next <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* Popup for View or Edit */}
            {showPopup && selectedResource && (
                <div className="popup-overlay">
                    <div className="popup-container details-popup">
                        <h3>{popupMode === "edit" ? "Update Resource" : "Resource Details"}</h3>
                        <div className="staff-details">
                            <div>
                                <label>Type:</label>
                                {popupMode === "edit" ? (
                                    <select name="type" value={selectedResource.type} onChange={handleChange}>
                                        {resourceTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                ) : <p>{selectedResource.type}</p>}
                            </div>

                            <div>
                                <label>Status:</label>
                                {popupMode === "edit" ? (
                                    <select name="status" value={selectedResource.status} onChange={handleChange}>
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                ) : <p>{selectedResource.status}</p>}
                            </div>

                            <div>
                                <label>Is Functional:</label>
                                {popupMode === "edit" ? (
                                    <select name="isFunctional" value={selectedResource.isFunctional === true ? "true" : "false"} onChange={handleChange}>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                ) : <p>{selectedResource.isFunctional ? "Yes" : "No"}</p>}
                            </div>

                            <div>
                                <label>Location:</label>
                                {popupMode === "edit" ? (
                                    <input type="text" name="location" value={selectedResource.location} onChange={handleChange} />
                                ) : <p>{selectedResource.location}</p>}
                            </div>

                            <div>
                                <label>Last Maintenance:</label>
                                {popupMode === "edit" ? (
                                    <input type="date" name="lastMaintenanceDate" value={selectedResource.lastMaintenanceDate?.slice(0, 10)} onChange={handleChange} />
                                ) : <p>{selectedResource.lastMaintenanceDate ? new Date(selectedResource.lastMaintenanceDate).toLocaleDateString() : "N/A"}</p>}
                            </div>
                        </div>

                        <div className="popup-buttons">
                            {popupMode === "edit" && <button className="confirm-btn" onClick={handleUpdate}>Save</button>}
                            <button className="cancel-btn" onClick={closePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Popup */}
            {showDeletePopup && (
                <div className="popup-overlay">
                    <div className="popup-container">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this resource?</p>
                        <div className="popup-buttons">
                            <button className="confirm-btn" onClick={handleDelete}>Delete</button>
                            <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterielResources;
