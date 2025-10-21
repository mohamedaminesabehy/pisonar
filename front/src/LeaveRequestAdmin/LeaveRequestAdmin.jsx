import { useState, useEffect } from "react";
import axios from '../api/axios';
import { FaCalendarAlt, FaCheck, FaTimes, FaFilter, FaInfoCircle, FaChartBar } from "react-icons/fa";
import "./LeaveRequestAdmin.css";

const LeaveRequestAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [typeFilter, setTypeFilter] = useState("all"); // all, vacation, medical, etc.
  const [urgencyFilter, setUrgencyFilter] = useState("all"); // all, low, medium, high
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [actionDetails, setActionDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Ajout de la fonction manquante
  const handlePhotoClick = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = "/leave-requests/all";
      const params = new URLSearchParams();
      
      if (filter !== "all") {
        params.append("status", filter.charAt(0).toUpperCase() + filter.slice(1));
      }
      
      if (typeFilter !== "all") {
        params.append("leaveType", typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1));
      }
      
      if (urgencyFilter !== "all") {
        params.append("urgencyLevel", urgencyFilter.charAt(0).toUpperCase() + urgencyFilter.slice(1));
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setError("Failed to load leave requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/leave-requests/statistics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching leave statistics:", error);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter, typeFilter, urgencyFilter]);

  const handleStatusChange = async (requestId, newStatus) => {
    setActionDetails({
      requestId,
      newStatus,
      action: newStatus === 'approved' ? 'approve' : 'reject'
    });
    setAdminComment("");
    setShowConfirmPopup(true);
  };

  const confirmStatusChange = async () => {
    if (!actionDetails) return;
    
    setIsLoading(true);
    try {
      const response = await axios.put(`/leave-requests/${actionDetails.requestId}/status`, {
        status: actionDetails.newStatus.charAt(0).toUpperCase() + actionDetails.newStatus.slice(1),
        adminComment
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.data && response.data.success) {
        setSuccessMessage(response.data.message || `Request ${actionDetails.action}d successfully!`);
        fetchLeaveRequests();
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(`Failed to ${actionDetails.action} request. Please try again.`);
      }
    } catch (error) {
      console.error("Error updating leave request status:", error);
      const errorMessage = error.response?.data?.error || `Failed to ${actionDetails.action} request. Please try again.`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setShowConfirmPopup(false);
      setActionDetails(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'lra-status-approved';
      case 'rejected': return 'lra-status-rejected';
      default: return 'lra-status-pending';
    }
  };

  const getUrgencyClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'lra-urgency-high';
      case 'medium': return 'lra-urgency-medium';
      default: return 'lra-urgency-low';
    }
  };

  const filteredRequests = leaveRequests;

  const handleViewStats = async () => {
    if (!stats) {
      await fetchStats();
    }
    setShowStats(true);
  };

  return (
    <div className="lra-leave-admin-container">
      <div className="lra-section-header">
        <h2>
          <FaCalendarAlt /> Leave Requests Management
        </h2>
        <div className="lra-admin-actions">
          <button 
            className="lra-stats-btn" 
            onClick={handleViewStats}
          >
            <FaChartBar /> View Statistics
          </button>
        </div>
      </div>

      {successMessage && <div className="lra-success-message">{successMessage}</div>}
      {error && <div className="lra-error-message">{error}</div>}

      <div className="lra-filter-containersz">
        <div className="lra-filter-roww">
          <div className="lra-filter-groupee">
            <label htmlFor="statusFilter">
              <span className="lra-filter-icon lra-status-filter-icon"></span>
              Status:
            </label>
            <div className="lra-custom-select">
              <select 
                id="statusFilter" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="lra-select-arrow"></div>
            </div>
          </div>
          
          <div className="lra-filter-groupee">
            <label htmlFor="typeFilter">
              <span className="lra-filter-icon lra-type-filter-icon"></span>
              Type:
            </label>
            <div className="lra-custom-select">
              <select 
                id="typeFilter" 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="vacation">Vacation</option>
                <option value="medical">Medical</option>
                <option value="personal">Personal</option>
                <option value="family">Family</option>
                <option value="other">Other</option>
              </select>
              <div className="lra-select-arrow"></div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="lra-loading-message">Loading leave requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="lra-no-requests">No leave requests found matching your filters.</div>
      ) : (
        <div className="lra-table-container">
          <table>
            <thead>
              <tr>
                <th>Staff</th>
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
              {filteredRequests.map((request) => (
                <tr key={request._id}>
                  <td>
                    <div className="lra-staff-info">
                      <span className="lra-staff-name">{request.staffName}</span>
                      <span className="lra-staff-role">{request.staffRole}</span>
                    </div>
                  </td>
                  <td>{request.leaveType || "Vacation"}</td>
                  <td>{new Date(request.startDate).toLocaleDateString()}</td>
                  <td>{new Date(request.endDate).toLocaleDateString()}</td>
                  <td>{request.totalDays || Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1}</td>
                  <td>
                    <span className={`lra-urgency ${getUrgencyClass(request.urgencyLevel || 'Low')}`}>
                      {request.urgencyLevel || "Low"}
                    </span>
                  </td>
                  <td>
                    <span className={`lra-status ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div className="lra-action-buttons">
                      <button 
                        className="lra-info-btn"
                        onClick={() => setShowDetails(request._id)}
                        title="View Details"
                      >
                        <FaInfoCircle />
                      </button>
                      {request.status === 'Pending' && (
                        <>
                          <button 
                            className="lra-approve-btn"
                            onClick={() => handleStatusChange(request._id, 'approved')}
                            title="Approve Request"
                          >
                            <FaCheck />
                          </button>
                          <button 
                            className="lra-reject-btn"
                            onClick={() => handleStatusChange(request._id, 'rejected')}
                            title="Reject Request"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetails && (
        <div className="lra-modal-overlay">
          <div className="lra-modal-content">
            <h3>Leave Request Details</h3>
            {leaveRequests.filter(req => req._id === showDetails).map(request => (
              <div key={request._id} className="lra-request-details">
                <div className="lra-detail-row">
                  <span className="lra-detail-label">Staff:</span>
                  <span className="lra-detail-value">
                    {request.staffName} ({request.staffRole})
                  </span>
                </div>
                <div className="lra-detail-row">
                  <span className="lra-detail-label">Type:</span>
                  <span className="lra-detail-value">{request.leaveType || "Vacation"}</span>
                </div>
                <div className="lra-detail-row">
                  <span className="lra-detail-label">Duration:</span>
                  <span className="lra-detail-value">
                    {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()} 
                    ({request.totalDays || Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} days)
                  </span>
                </div>
                <div className="lra-detail-row">
                  <span className="lra-detail-label">Urgency:</span>
                  <span className={`lra-detail-value ${getUrgencyClass(request.urgencyLevel || 'Low')}`}>
                    {request.urgencyLevel || "Low"}
                  </span>
                </div>
                <div className="lra-detail-row">
                  <span className="lra-detail-label">Status:</span>
                  <span className={`lra-detail-value ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="lra-detail-row">
                  <span className="lra-detail-label">Submitted:</span>
                  <span className="lra-detail-value">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                </div>
                {request.contactNumber && (
                  <div className="lra-detail-row">
                    <span className="lra-detail-label">Contact:</span>
                    <span className="lra-detail-value">{request.contactNumber}</span>
                  </div>
                )}
                
                {/* Remplacer cette partie */}
                {request.attachmentPhoto && (
                  <div className="lra-detail-row lra-full-width">
                    <span className="lra-detail-label">Document Photo:</span>
                    <div className="lra-detail-value">
                      <img 
                        src={request.attachmentPhoto} 
                        alt="Document" 
                        className="lra-attachment-photo-preview"
                        onClick={() => handlePhotoClick(request.attachmentPhoto)}
                      />
                    </div>
                  </div>
                )}
                
                <div className="lra-detail-row lra-full-width">
                  <span className="lra-detail-label">Reason:</span>
                  <span className="lra-detail-value lra-reason-text">{request.reason}</span>
                </div>
                {request.status !== 'Pending' && (
                  <>
                    <div className="lra-detail-row">
                      <span className="lra-detail-label">Reviewed:</span>
                      <span className="lra-detail-value">
                        {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {request.adminComment && (
                      <div className="lra-detail-row lra-full-width">
                        <span className="lra-detail-label">Admin Comment:</span>
                        <span className="lra-detail-value lra-admin-comment">{request.adminComment}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="lra-detail-actions">
                  <button className="lra-close-btn" onClick={() => setShowDetails(null)}>Close</button>
                  {request.status === 'Pending' && (
                    <>
                      <button 
                        className="lra-approve-action-btn"
                        onClick={() => {
                          setShowDetails(null);
                          handleStatusChange(request._id, 'approved');
                        }}
                      >
                        Approve
                      </button>
                      <button 
                        className="lra-reject-action-btn"
                        onClick={() => {
                          setShowDetails(null);
                          handleStatusChange(request._id, 'rejected');
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Status Change Modal */}
      {showConfirmPopup && (
        <div className="lra-modal-overlay">
          <div className="lra-modal-content">
            <h3>{actionDetails.action.charAt(0).toUpperCase() + actionDetails.action.slice(1)} Leave Request</h3>
            <p>Are you sure you want to {actionDetails.action} this leave request?</p>
            
            <div className="lra-form-group lra-full-width">
              <label htmlFor="adminComment">Comment (Optional)</label>
              <textarea
                id="adminComment"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add a comment for the staff member..."
                rows="3"
              ></textarea>
            </div>
            
            <div className="lra-confirm-buttons">
              <button 
                className="lra-cancel-btn" 
                onClick={() => {
                  setShowConfirmPopup(false);
                  setActionDetails(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className={`lra-confirm-btn ${actionDetails.action === 'approve' ? 'lra-approve-action-btn' : 'lra-reject-action-btn'}`}
                onClick={confirmStatusChange}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : `Yes, ${actionDetails.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStats && (
        <div className="lra-modal-overlay">
          <div className="lra-modal-content lra-stats-modal">
            <h3>Tableau de bord des congés</h3>
            
            {!stats ? (
              <div className="lra-loading-message">Chargement des statistiques...</div>
            ) : (
              <div className="lra-stats-container">
                <div className="lra-dashboard-summary">
                  <div className="lra-dashboard-card total-requests">
                    <div className="lra-dashboard-icon">
                      <FaCalendarAlt />
                    </div>
                    <div className="lra-dashboard-info">
                      <div className="lra-dashboard-value">
                        {stats.byStatus.reduce((total, item) => total + item.count, 0)}
                      </div>
                      <div className="lra-dashboard-label">Total des demandes</div>
                    </div>
                  </div>
                  
                  <div className="lra-dashboard-card avg-duration">
                    <div className="lra-dashboard-icon">
                      <FaFilter />
                    </div>
                    <div className="lra-dashboard-info">
                      <div className="lra-dashboard-value">{stats.averageDuration.toFixed(1)}</div>
                      <div className="lra-dashboard-label">Durée moyenne (jours)</div>
                    </div>
                  </div>
                  
                  <div className="lra-dashboard-card pending-requests">
                    <div className="lra-dashboard-icon">
                      <FaInfoCircle />
                    </div>
                    <div className="lra-dashboard-info">
                      <div className="lra-dashboard-value">
                        {stats.byStatus.find(s => s._id === "Pending")?.count || 0}
                      </div>
                      <div className="lra-dashboard-label">Demandes en attente</div>
                    </div>
                  </div>
                </div>
                
                <div className="lra-stats-grid">
                  <div className="lra-stats-section lra-status-section">
                    <h4>Distribution par statut</h4>
                    <div className="lra-stats-cards">
                      {stats.byStatus.map(item => (
                        <div 
                          key={item._id} 
                          className={`lra-stats-card ${item._id.toLowerCase()}-card`}
                        >
                          <div className="lra-stats-number">{item.count}</div>
                          <div className="lra-stats-label">{item._id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lra-stats-section lra-role-section">
                    <h4>Par rôle</h4>
                    <div className="lra-stats-cards">
                      {stats.byRole.map(item => (
                        <div 
                          key={item._id} 
                          className="lra-stats-card lra-role-card"
                        >
                          <div className="lra-stats-number">{item.count}</div>
                          <div className="lra-stats-label">{item._id}s</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {stats.monthlyDistribution.length > 0 && (
                  <div className="lra-stats-section lra-chart-section">
                    <h4>Distribution mensuelle</h4>
                    <div className="lra-monthly-chart">
                      {stats.monthlyDistribution.map(item => {
                        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
                        const monthName = monthNames[item._id.month - 1];
                        return (
                          <div key={`${item._id.year}-${item._id.month}`} className="lra-month-bar">
                            <div 
                              className="lra-bar" 
                              style={{ 
                                height: `${Math.min(item.count * 20, 100)}px` 
                              }}
                            >
                              <span className="lra-count">{item.count}</span>
                            </div>
                            <div className="lra-month-label">{`${monthName} ${item._id.year}`}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {stats.byLeaveType && stats.byLeaveType.length > 0 && (
                  <div className="lra-stats-section lra-type-section">
                    <h4>Types de congés</h4>
                    <div className="lra-stats-cards">
                      {stats.byLeaveType.map(item => (
                        <div 
                          key={item._id} 
                          className="lra-stats-card lra-type-card"
                        >
                          <div className="lra-stats-number">{item.count}</div>
                          <div className="lra-stats-label">{item._id || "Autre"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="lra-detail-actions">
              <button className="lra-close-btn" onClick={() => setShowStats(false)}>Fermer</button>
              <button className="lra-refresh-btn" onClick={fetchStats}>
                <FaFilter /> Actualiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="lra-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <button className="lra-photo-modal-close" onClick={() => setShowPhotoModal(false)}>×</button>
          <div className="lra-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Document" />
          </div>
        </div>
      )}
      {/* Modal pour afficher la photo en plein écran */}
      {showPhotoModal && selectedPhoto && (
        <div className="lra-photo-modal">
          <div className="lra-photo-modal-content">
            <span className="lra-photo-modal-close" onClick={() => setShowPhotoModal(false)}>
              &times;
            </span>
            <img src={selectedPhoto} alt="Pièce jointe" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestAdmin;