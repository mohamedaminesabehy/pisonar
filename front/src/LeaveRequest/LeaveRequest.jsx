import { useState, useEffect } from "react";
import axios from '../api/axios';
import { FaCalendarAlt, FaClipboardList, FaTrash, FaInfoCircle, FaUpload } from "react-icons/fa";
import "./LeaveRequest.css";

const LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  
  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState("Vacation");
  const [urgencyLevel, setUrgencyLevel] = useState("Low");
  const [contactNumber, setContactNumber] = useState("");
  const [attachmentPhoto, setAttachmentPhoto] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [totalDays, setTotalDays] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/leave-requests/my-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setError("Failed to load your leave requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Calculate total days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [startDate, endDate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (new Date(startDate) > new Date(endDate)) 
      errors.dateRange = "End date must be after start date";
    if (!reason) errors.reason = "Reason is required";
    if (!leaveType) errors.leaveType = "Leave type is required";
    if (contactNumber && !/^\d{10}$/.test(contactNumber.replace(/\D/g, ''))) 
      errors.contactNumber = "Please enter a valid 10-digit phone number";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      console.log("Submitting leave request with data:", {
        startDate,
        endDate,
        reason,
        leaveType,
        urgencyLevel,
        contactNumber,
        attachmentPhoto
      });
      
      const response = await axios.post("/leave-requests", {
        startDate,
        endDate,
        reason,
        leaveType,
        urgencyLevel,
        contactNumber,
        attachmentPhoto // Changed from attachmentUrl
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log("Leave request response:", response);
      
      setSuccessMessage("Leave request submitted successfully!");
      setShowForm(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      setLeaveType("Vacation");
      setUrgencyLevel("Low");
      setContactNumber("");
      setAttachmentPhoto("");
      setSelectedFile(null);
      fetchLeaveRequests();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      console.error("Error response data:", error.response?.data);
      
      // Display a more specific error message if available
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Failed to submit leave request. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`/leave-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      setSuccessMessage("Leave request cancelled successfully!");
      fetchLeaveRequests();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error cancelling leave request:", error);
      const errorMessage = error.response?.data?.error || 
                           "Failed to cancel leave request. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setConfirmCancel(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getUrgencyClass = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      default: return 'urgency-low';
    }
  };

  // Fonction pour afficher la photo en grand
  const handlePhotoClick = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  return (
    <div className="leave-request-container">
      <div className="section-header">
        <h2>
          <FaCalendarAlt /> My Leave Requests
        </h2>
        <button 
          className="new-request-btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "New Request"}
        </button>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="leave-form-container">
          <h3>Submit New Leave Request</h3>
          <form onSubmit={handleSubmit} className="leave-form">
            <div className="form-group">
              <label htmlFor="startDate">Start Date*</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={formErrors.startDate ? "error" : ""}
              />
              {formErrors.startDate && <div className="error-text">{formErrors.startDate}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date*</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={formErrors.endDate ? "error" : ""}
              />
              {formErrors.endDate && <div className="error-text">{formErrors.endDate}</div>}
            </div>
            
            {formErrors.dateRange && <div className="error-text date-range-error">{formErrors.dateRange}</div>}
            
            {totalDays > 0 && (
              <div className="total-days-info">
                Total days: <strong>{totalDays}</strong>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="leaveType">Leave Type*</label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className={formErrors.leaveType ? "error" : ""}
              >
                <option value="Vacation">Vacation</option>
                <option value="Medical">Medical</option>
                <option value="Personal">Personal</option>
                <option value="Family">Family</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.leaveType && <div className="error-text">{formErrors.leaveType}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="urgencyLevel">Urgency Level</label>
              <select
                id="urgencyLevel"
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number During Leave</label>
              <input
                type="tel"
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Optional"
                className={formErrors.contactNumber ? "error" : ""}
              />
              {formErrors.contactNumber && <div className="error-text">{formErrors.contactNumber}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="attachmentPhoto">Supporting Document Photo</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="attachmentPhoto"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="attachmentPhoto" className="file-upload-label">
                  {selectedFile ? selectedFile.name : "Choose a photo..."}
                </label>
                <button 
                  type="button" 
                  className="browse-btn"
                  onClick={() => document.getElementById('attachmentPhoto').click()}
                >
                  Browse
                </button>
              </div>
              {attachmentPhoto && (
                <div className="image-preview">
                  <img src={attachmentPhoto} alt="Document preview" />
                </div>
              )}
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="reason">Reason for Leave*</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                className={formErrors.reason ? "error" : ""}
              ></textarea>
              {formErrors.reason && <div className="error-text">{formErrors.reason}</div>}
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      <div className="leave-history">
        <h3>
          <FaClipboardList /> Leave Request History
        </h3>
        
        {isLoading && !showForm && <div className="loading-message">Loading your requests...</div>}
        
        {!isLoading && leaveRequests.length === 0 ? (
          <div className="no-requests">You haven't submitted any leave requests yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.leaveType || "Vacation"}</td>
                    <td>{new Date(request.startDate).toLocaleDateString()}</td>
                    <td>{new Date(request.endDate).toLocaleDateString()}</td>
                    <td>{request.totalDays || "-"}</td>
                    <td>
                      <span className={`urgency ${getUrgencyClass(request.urgencyLevel || 'Low')}`}>
                        {request.urgencyLevel || "Low"}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="info-btn"
                          onClick={() => setShowDetails(request._id)}
                          title="View Details"
                        >
                          <FaInfoCircle />
                        </button>
                        {request.status === 'Pending' && (
                          <button 
                            className="delete-btn"
                            onClick={() => setConfirmCancel(request._id)}
                            title="Cancel Request"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Leave Request Details</h3>
            {leaveRequests.filter(req => req._id === showDetails).map(request => (
              <div key={request._id} className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{request.leaveType || "Vacation"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">
                    {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()} 
                    ({request.totalDays || Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} days)
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Urgency:</span>
                  <span className={`detail-value ${getUrgencyClass(request.urgencyLevel || 'Low')}`}>
                    {request.urgencyLevel || "Low"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submitted:</span>
                  <span className="detail-value">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                </div>
                {request.contactNumber && (
                  <div className="detail-row">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{request.contactNumber}</span>
                  </div>
                )}
                {request.attachmentPhoto && (
                  <div className="detail-row full-width">
                    <span className="detail-label">Document Photo:</span>
                    <div className="detail-value">
                      <img 
                        src={request.attachmentPhoto} 
                        alt="Document" 
                        className="attachment-photo-preview"
                        onClick={() => handlePhotoClick(request.attachmentPhoto)}
                      />
                    </div>
                  </div>
                )}
                <div className="detail-row full-width">
                  <span className="detail-label">Reason:</span>
                  <span className="detail-value reason-text">{request.reason}</span>
                </div>
                {request.status !== 'Pending' && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Reviewed:</span>
                      <span className="detail-value">
                        {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {request.adminComment && (
                      <div className="detail-row full-width">
                        <span className="detail-label">Admin Comment:</span>
                        <span className="detail-value admin-comment">{request.adminComment}</span>
                      </div>
                    )}
                  </>
                )}
                <button className="close-btn" onClick={() => setShowDetails(null)}>Close</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="photo-modal" onClick={() => setShowPhotoModal(false)}>
          <button className="photo-modal-close" onClick={() => setShowPhotoModal(false)}>×</button>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Document" />
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h3>Cancel Leave Request</h3>
            <p>Are you sure you want to cancel this leave request? This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => setConfirmCancel(null)}
                disabled={isLoading}
              >
                No, Keep It
              </button>
              <button 
                className="confirm-btn" 
                onClick={() => handleCancelRequest(confirmCancel)}
                disabled={isLoading}
              >
                {isLoading ? "Cancelling..." : "Yes, Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;