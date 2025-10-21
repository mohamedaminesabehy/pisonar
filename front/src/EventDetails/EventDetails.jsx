
import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import axios from "../api/axios"
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaUserNurse,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaArrowLeft,
  FaInfoCircle,
  FaClock as FaPending,
  FaCamera
} from "react-icons/fa"
import "./EventDetails.css"

const EventDetails = () => {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmationStatus, setConfirmationStatus] = useState("pending")
  const [statusMessage, setStatusMessage] = useState(null)

  const fromNotification = location.state?.fromNotification || false
  const BASE_URL = "http://localhost:3006"
  const coverImage = "/src/assets/images/time.jpg"
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/events/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setEvent(response.data)
        setConfirmationStatus(response.data.confirmationStatus || "pending")
      } catch (err) {
        console.error("Error fetching event details:", err)
        setError("Failed to load event details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId])

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  if (loading) {
    return <div className="loading-message">Loading event details...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!event) {
    return <div className="error-message">Event not found.</div>
  }

  return (
    <div className="event-details-page">
      <div className="event-banner">
        <img
          src={coverImage || "/placeholder.svg"}
          alt="Event Cover"
          className="banner-image"
          onError={(e) => (e.target.src = "/placeholder.svg")}
        />
        <div className="banner-overlay"></div>
        <button className="change-cover-btn">
          <FaCamera />
          <span>Change Cover</span>
        </button>
      </div>

      <div className="event-main">
        <div className="event-header">
          <div className="event-title-section">
            <h2>{event.title}</h2>
            <p className="shift">{event.shift} Shift</p>
          </div>
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
        </div>

        {fromNotification && (
          <div className="notification-banner">
            <FaInfoCircle className="info-icon" />
            <p>You are viewing this event from a notification</p>
          </div>
        )}

        <div className="event-content">
          <div className="event-info-section">
            <h3>Event Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label"><FaCalendarAlt /> Date:</span>
                <span className="info-value">{formatDate(event.start)}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><FaClock /> Time:</span>
                <span className="info-value">{formatTime(event.start)} - {formatTime(event.end)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Shift:</span>
                <span className="info-value">{event.shift}</span>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="event-description">
              <h3>Description</h3>
              <p>{event.description}</p>
            </div>
          )}

          <div className="staff-section">
            <h3>Assigned Staff</h3>
            {event.assignedDoctors?.length > 0 && (
              <div className="staff-category">
                <h4><FaUserMd /> Doctors</h4>
                <div className="staff-list">
                  {event.assignedDoctors.map((doctor) => (
                    <div key={doctor._id} className="staff-item">
                      {doctor.photo ? (
                        <img
                          src={`${BASE_URL}${doctor.photo}`}
                          alt={doctor.fullName}
                          className="staff-photo"
                          onError={(e) => (e.target.src = "/src/assets/images/admin.jpg")}
                        />
                      ) : (
                        <div className="staff-photo-placeholder">
                          <FaUserMd />
                        </div>
                      )}
                      <span>{doctor.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.assignedNurses?.length > 0 && (
              <div className="staff-category">
                <h4><FaUserNurse /> Nurses</h4>
                <div className="staff-list">
                  {event.assignedNurses.map((nurse) => (
                    <div key={nurse._id} className="staff-item">
                      {nurse.photo ? (
                        <img
                          src={`${BASE_URL}${nurse.photo}`}
                          alt={nurse.fullName}
                          className="staff-photo"
                          onError={(e) => (e.target.src = "/src/assets/images/admin.jpg")}
                        />
                      ) : (
                        <div className="staff-photo-placeholder">
                          <FaUserNurse />
                        </div>
                      )}
                      <span>{nurse.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="confirmation-section">
            <h3>Your Status</h3>
            <div className="confirmation-status">
              {confirmationStatus === "confirmed" && (
                <>
                  <FaCheckCircle className="status-icon" />
                  <span>Confirmed Attendance</span>
                </>
              )}
              {confirmationStatus === "declined" && (
                <>
                  <FaTimesCircle className="status-icon" />
                  <span>Declined Assignment</span>
                </>
              )}
              {confirmationStatus === "change_requested" && (
                <>
                  <FaExchangeAlt className="status-icon" />
                  <span>Change Requested</span>
                </>
              )}
              {confirmationStatus === "pending" && (
                <>
                  <FaPending className="status-icon" />
                  <span>Pending Response</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails