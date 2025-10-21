import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  FaUserInjured,
  FaUserMd,
  FaMedkit,
  FaFileAlt,
  FaCog,
  FaAngleDown,
  FaAngleRight,
  FaSignOutAlt,
  FaPills,
  FaCalendarAlt,
  FaRobot
} from "react-icons/fa";
import PropTypes from "prop-types";
import log from "/src/assets/images/llogo.jpg";

const Sidebar = ({ isOpen }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const BASE_URL = "http://localhost:3006";
  const FALLBACK_IMAGE = "/src/assets/images/admin.jpg";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get("/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setUserData(null);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleSubmenu = (section, index) => {
    const key = `${section}-${index}`;
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubItemClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const menuItems = {
    Admin: [
      {
        section: "MANAGEMENT",
        items: [
          {
            title: "Staff",
            icon: <FaUserMd />,
            subItems: [
              { name: "Staff Members", path: "/staff-members" },
              { name: "Add Staff", path: "/add-staff" },
            ],
          },
        ],
      },
      {
        section: "SCHEDULE",
        items: [
          {
            title: "Schedule Management",
            icon: <FaCalendarAlt />,
            subItems: [
              { name: "Add Working Hours", path: "/add-work" },
              { name: "View Staff Schedule", path: "/view-staff-work" },
              { name: "Leave Requests", path: "/admin-leave-requests" },
            ],
          },
          {
            title: "Resources",
            icon: <FaPills />,
            subItems: [
              { name: "Material Resources", path: "/material-resources" },
              { name: "Add Resource", path: "/add-resource" },
            ],
          },
        ],
      },
      {
        section: "Emergencies",
        items: [
          {
            title: "Emergencies",
            icon: <FaCalendarAlt />,
            subItems: [
              { name: "Reported Emergencies", path: "/emergencies" },
            ],
          },
        ],
      },
      {
        section: "ADMINISTRATION",
        items: [
          {
            title: "Settings",
            icon: <FaCog />,
            subItems: [
              { name: "Profile", path: "/profile" },
            ],
          },
          {
            title: "Insurance",
            icon: <FaCog />,
            subItems: [
              { name: "Manage Insurance", path: "/insurance" },
              { name: "Manage CNAM", path: "/cnam" },
            ],
          },
        ],
      },
    ],
    Doctor: [
      {
        section: "EMERGENCIES",
        items: [
          {
            title: "Patients",
            icon: <FaUserInjured />,
            subItems: [
              { name: "Waiting List", path: "/patientlist" },
            ],
          },
          {
            title: "Prescriptions",
            icon: <FaPills />,
            subItems: [
              { name: "Prescription History", path: "/prescription-history" },
            ],
          },
          {
            title: "Assistant AI",
            icon: <FaPills />,
            subItems: [
              { name: "Assistant AI", path: "/assistant-ai" },
            ],
          },
          {
            title: "Medications",
            icon: <FaPills />,
            subItems: [
              { name: "Stock", path: "/medication-stock-doctor" },
            ],
          },
        ],
      },
      {
        section: "STATS",
        items: [
          {
            title: "Statistics",
            icon: <FaFileAlt />,
            subItems: [
              { name: "View Statistics", path: "/statistics" },
            ],
          },
        ],
      },
      {
        section: "CONSULTATION",
        items: [
          {
            title: "Consultations",
            icon: <FaFileAlt />,
            subItems: [
              { name: "List of Consultations", path: "/consultation-list" },
              { name: "Medical History", path: "/HistoryMain" },
            ],
          },
        ],
      },
      {
        section: "SCHEDULE",
        items: [
          {
            title: "Work Schedule",
            icon: <FaCalendarAlt />,
            subItems: [
              { name: "My Schedule", path: "/work" },
              { name: "Leave Request", path: "/leave-request" },
            ],
          },
        ],
      },
      {
        section: "SETTINGS",
        items: [
          {
            title: "Profile",
            icon: <FaUserMd />,
            subItems: [{ name: "Edit Profile", path: "/profile" }],
          },
        ],
      },
    ],
    Nurse: [
      {
        section: "EMERGENCIES",
        items: [
          {
            title: "Manage Patients",
            icon: <FaUserInjured />,
            subItems: [
              { name: "Add a Patient", path: "/addpatientform" },
              { name: "Waiting List", path: "/PatientListN" },
       
            ],
          },
        
        ],
      },
      {
        section: "MANAGEMENT",
        items: [
          {
            title: "Equipment",
            icon: <FaMedkit />,
            subItems: [
          
              { name: "Assign Resource", path: "/assign-resource" },
              { name: "List Patients", path: "/list-patients-resources" },  // 👈 new route
            ],
          },
          {
            title: "Medications",
            icon: <FaPills />,
            subItems: [
              { name: "Add", path: "/add-stock" },
              { name: "Stock", path: "/medication-stock" },
            ],
          },
          {
            title: "Prescriptions",
            icon: <FaPills />,
            subItems: [
              { name: "Pending Prescriptions", path: "/pending-prescriptions" },
            ],
          },

          
        ],
      },

      {
        section: "SCHEDULE",
        items: [
          {
            title: "Work Schedule",
            icon: <FaCalendarAlt />,
            subItems: [
              { name: "My Schedule", path: "/work" },
              // { name: "Work Events", path: "/work-events" },
            ],
          },
        ],
      },
    ],
   
    Patient: [
      {
        section: "PATIENT SERVICES",
        items: [
          {
            title: "Reports",
            icon: <FaFileAlt />,
            subItems: [{ name: "My Reports", path: "/my-reports" }],
          },
          {
            title: "Chatbot Help",
            icon: <FaRobot />,
            subItems: [{ name: "Talk to Chatbot", path: "/patient-chatbot" }],
          },
          {
            title: "Settings",
            icon: <FaCog />,
            subItems: [
              { name: "Edit Profile", path: "/profile" },
              { name: "Security", path: "/security-settings" },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="brand">
        <img
          src={log}
          alt="Rescuify Logo"
          className="brand-logo"
          onError={(e) => (e.target.src = FALLBACK_IMAGE)}
        />
        <span className="logo">Rescuify</span>
      </div>

      <div className="user-profile">
        <img
          src={
            userData?.photo
              ? `${BASE_URL}${userData.photo}`
              : FALLBACK_IMAGE
          }
          alt="User Profile"
          className="profile-image"
          onError={(e) => (e.target.src = FALLBACK_IMAGE)}
        />
        <div className="profile-info">
          <span className="welcome-text">Welcome,</span>
          <span className="user-name">{userData?.fullName || "User"}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems[userRole]?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="nav-section">
            <h3 className="section-title">{section.section}</h3>
            {section.items.map((item, itemIndex) => {
              const key = `${section.section}-${itemIndex}`;
              return (
                <div key={itemIndex} className="nav-item-container">
                  <div
                    className={`nav-item ${expandedItems[key] ? "active" : ""}`}
                    onClick={() => toggleSubmenu(section.section, itemIndex)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {item.subItems &&
                      (expandedItems[key] ? (
                        <FaAngleDown className="submenu-icon" />
                      ) : (
                        <FaAngleRight className="submenu-icon" />
                      ))}
                  </div>
                  {item.subItems && expandedItems[key] && (
                    <div className="submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <div
                          key={subIndex}
                          className="submenu-item"
                          onClick={() => handleSubItemClick(subItem.path)}
                        >
                          {subItem.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="logout-section">
        <div className="nav-item" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = { isOpen: PropTypes.bool.isRequired };

export default Sidebar;
