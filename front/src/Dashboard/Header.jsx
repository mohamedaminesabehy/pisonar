import { useState, useEffect } from "react";
import { FaBars, FaBell, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./Dashboard.css";

const FALLBACK_IMAGE = "/src/assets/images/admin.jpg";

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Récupère le profil de l'utilisateur connecté
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/notifications/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Récupère les notifications au montage et met en place un polling toutes les 30 secondes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcule le nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Gère le clic sur une notification : la marque comme lue et navigue éventuellement vers l'événement associé
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        const token = localStorage.getItem("token");
        await axios.put(`/notifications/${notification._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      }
      setShowNotifications(false);
      if (notification.event && notification.event._id) {
        navigate(`/events/${notification.event._id}`, {
          state: { fromNotification: true, notificationId: notification._id },
        });
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Marque toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((notification) =>
          axios.put(`/notifications/${notification._id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="headers">
      <button className="toggle-sidebar" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <div className="header-right">
        {/* Notifications */}
        <div className="notifications">
          <button
            className="notification-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications</h4>
                {notifications.length > 0 && (
                  <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              {loading ? (
                <p>Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <p className="empty-notifications">No notifications</p>
              ) : (
                <ul className="notification-list">
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={`notification-item ${
                        !notification.read ? "unread" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <p className="notification-date">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && <div className="unread-dot"></div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="profile">
          <button
            className="profile-btn"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >
            <img
              src={
                userData?.photo
                  ? `http://localhost:3006${userData.photo}`
                  : FALLBACK_IMAGE
              }
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
            />
            <span className="namess">
              {userData ? userData.fullName : "User"}
            </span>
          </button>
          {showProfile && (
            <div className="dropdown-menu">
              <div className="dropdown-items">
                <div className="dropdown-item">
                  <FaUser className="item-icon" />
                  <Link to="/profile" className="profile-link">
                    <span>Profile</span>
                  </Link>
                </div>
                <div className="dropdown-item">
                  <FaCog className="item-icon" />
                  <span>Settings</span>
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt className="item-icon" />
                  <span>Log Out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
