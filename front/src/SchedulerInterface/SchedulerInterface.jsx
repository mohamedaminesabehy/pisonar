import { useState, useEffect } from "react";
import "./SchedulerInterface.css";
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaEllipsisV } from "react-icons/fa";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { saveAs } from "file-saver";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API_BASE_URL = "http://localhost:3006";

const SchedulerInterface = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [staffMembers, setStaffMembers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [approvedLeaves, setApprovedLeaves] = useState([]);

  const getWeekDays = (date) => {
    const days = [];
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  useEffect(() => {
    fetchStaffAndShifts();
    fetchApprovedLeaves();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [currentDate, searchQuery, filterRole]);

  const fetchApprovedLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté.");
      const response = await axios.get(`${API_BASE_URL}/leave-requests/all?status=Approved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApprovedLeaves(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des congés approuvés:", error);
    }
  };

  const fetchStaffAndShifts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté.");
      const [doctorsResponse, nursesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/nurses`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const doctors = doctorsResponse.data.map((doc) => ({ ...doc, role: "Doctor" }));
      const nurses = nursesResponse.data.map((nurse) => ({ ...nurse, role: "Nurse" }));
      setStaffMembers([...doctors, ...nurses]);
      await fetchShifts();
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError(error.message || "Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté.");
      const params = new URLSearchParams();
      const startOfPeriod = currentView === "week" ? weekDays[0] : currentDate;
      const endOfPeriod = currentView === "week" ? weekDays[6] : currentDate;
      params.append("startDate", startOfPeriod.toISOString());
      params.append("endDate", endOfPeriod.toISOString());
      if (searchQuery) params.append("search", searchQuery);
      if (filterRole !== "all") params.append("role", filterRole);
      const response = await axios.get(`${API_BASE_URL}/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(response.data);
      setError(null);
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
      setError(
        error.response?.status === 404
          ? "Aucun événement trouvé pour cette période."
          : "Impossible de charger les événements. Veuillez réessayer."
      );
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isOnLeave = (staffId, date) => {
    return approvedLeaves.some((leave) => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const checkDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);
      return (
        leave.staffId === staffId &&
        leave.status === "Approved" &&
        checkDate >= startDate &&
        checkDate <= endDate
      );
    });
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch = staff.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || staff.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredShifts = shifts.filter((shift) => {
    if (filterRole === "all") return true;
    if (filterRole === "Doctor") return shift.assignedDoctors && shift.assignedDoctors.length > 0;
    if (filterRole === "Nurse") return shift.assignedNurses && shift.assignedNurses.length > 0;
    return false;
  });

  const exportToPDF = (exportType) => {
    setShowExportModal(false);
    handleExport(exportType);
  };

  const handleExport = async (exportType) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté.");
      let startOfPeriod, endOfPeriod, filteredExportShifts;
      if (exportType === "week") {
        startOfPeriod = weekDays[0];
        endOfPeriod = weekDays[6];
        filteredExportShifts = filteredShifts.filter((shift) => {
          const shiftDate = new Date(shift.start);
          return shiftDate >= startOfPeriod && shiftDate <= endOfPeriod;
        });
      } else {
        startOfPeriod = new Date(currentDate);
        endOfPeriod = new Date(currentDate);
        filteredExportShifts = filteredShifts.filter((shift) => isSameDay(new Date(shift.start), currentDate));
      }
      const payload = {
        events: filteredExportShifts,
        view: exportType,
        startDate: startOfPeriod.toISOString(),
        endDate: endOfPeriod.toISOString(),
      };
      const response = await axios.post(`${API_BASE_URL}/events/export-pdf`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const filename = `Schedule_${exportType === "week" ? "semaine" : "jour"}_${new Date(startOfPeriod).toLocaleDateString("fr-FR")}.pdf`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("Erreur lors de l'exportation en PDF:", error);
      setError("Impossible d'exporter le planning en PDF. Veuillez réessayer.");
    }
  };

  const getStaffCountForDate = (date) => {
    const shiftsForDate = filteredShifts.filter((shift) => isSameDay(new Date(shift.start), date));
    const doctorsWithShifts = new Set();
    const nursesWithShifts = new Set();
    shiftsForDate.forEach((shift) => {
      if (shift.assignedDoctors) {
        shift.assignedDoctors.forEach((doc) => {
          if (filterRole === "all" || filterRole === "Doctor") {
            doctorsWithShifts.add(doc._id);
          }
        });
      }
      if (shift.assignedNurses) {
        shift.assignedNurses.forEach((nurse) => {
          if (filterRole === "all" || filterRole === "Nurse") {
            nursesWithShifts.add(nurse._id);
          }
        });
      }
    });
    return {
      totalDoctors: doctorsWithShifts.size,
      totalNurses: nursesWithShifts.size,
    };
  };

  const { totalDoctors, totalNurses } = getStaffCountForDate(currentDate);

  const getShiftDistribution = () => {
    const shiftsForDate = filteredShifts.filter((shift) => isSameDay(new Date(shift.start), currentDate));
    const morningDoctors = shiftsForDate
      .filter((shift) => shift.shift === "Morning" && shift.assignedDoctors?.length > 0)
      .reduce((count, shift) => count + (shift.assignedDoctors?.length || 0), 0);
    const morningNurses = shiftsForDate
      .filter((shift) => shift.shift === "Morning" && shift.assignedNurses?.length > 0)
      .reduce((count, shift) => count + (shift.assignedNurses?.length || 0), 0);
    const eveningDoctors = shiftsForDate
      .filter((shift) => shift.shift === "Evening" && shift.assignedDoctors?.length > 0)
      .reduce((count, shift) => count + (shift.assignedDoctors?.length || 0), 0);
    const eveningNurses = shiftsForDate
      .filter((shift) => shift.shift === "Evening" && shift.assignedNurses?.length > 0)
      .reduce((count, shift) => count + (shift.assignedNurses?.length || 0), 0);
    const nightDoctors = shiftsForDate
      .filter((shift) => shift.shift === "Night" && shift.assignedDoctors?.length > 0)
      .reduce((count, shift) => count + (shift.assignedDoctors?.length || 0), 0);
    const nightNurses = shiftsForDate
      .filter((shift) => shift.shift === "Night" && shift.assignedNurses?.length > 0)
      .reduce((count, shift) => count + (shift.assignedNurses?.length || 0), 0);
    return {
      morningDoctors,
      morningNurses,
      eveningDoctors,
      eveningNurses,
      nightDoctors,
      nightNurses,
    };
  };

  const shiftDistribution = getShiftDistribution();

  const barData = {
    labels: ["Matin", "Après-midi", "Nuit"],
    datasets: [
      {
        label: "Médecins",
        data: [shiftDistribution.morningDoctors, shiftDistribution.eveningDoctors, shiftDistribution.nightDoctors],
        backgroundColor: "#0066cc",
        borderColor: "#0052a3",
        borderWidth: 1,
      },
      {
        label: "Infirmiers",
        data: [shiftDistribution.morningNurses, shiftDistribution.eveningNurses, shiftDistribution.nightNurses],
        backgroundColor: "#20c997",
        borderColor: "#1aa87a",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 18,
        ticks: {
          stepSize: 2,
          color: "#515356",
        },
        title: { display: false },
      },
      x: {
        ticks: { color: "#515356" },
        title: { display: false },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#1a365d", font: { size: 14 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} personnes`,
        },
      },
    },
  };

  return (
    <div className="scheduler-container">
      <div className="dashboard-container">
        <div className="stats-container">
          <div className="stat-card">
            <h3>Personnel en service</h3>
            <p>{totalDoctors + totalNurses}</p>
          </div>
          <div className="stat-card">
            <h3>Médecins</h3>
            <p>{totalDoctors}</p>
          </div>
          <div className="stat-card">
            <h3>Infirmiers</h3>
            <p>{totalNurses}</p>
          </div>
          <div className="stat-card">
            <h3>Congés Approuvés</h3>
            <p>{approvedLeaves.length}</p>
          </div>
        </div>
        <div className="chart-card">
          <div className="card-header">
            <h3>Répartition des horaires</h3>
            <div className="card-actions">
              <button className="btn-icon">
                <FaEllipsisV />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrapper">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="controls-container">
        <div className="view-selector">
          <button className={`view-btn ${currentView === "week" ? "active" : ""}`} onClick={() => setCurrentView("week")}>
            Vue Semaine
          </button>
          <button className={`view-btn ${currentView === "day" ? "active" : ""}`} onClick={() => setCurrentView("day")}>
            Vue Jour
          </button>
          <button className={`view-btn ${currentView === "list" ? "active" : ""}`} onClick={() => setCurrentView("list")}>
            Vue Liste
          </button>
        </div>
        <button className="export-btn" onClick={() => setShowExportModal(true)}>
          Exporter en PDF
        </button>
      </div>

      {showExportModal && (
        <div className="export-modal-overlay">
          <div className="export-modal-container">
            <div className="export-modal-header">
              <h3 className="export-modal-title">Options d'exportation</h3>
            </div>
            <div className="export-modal-body">
              <p className="export-modal-description">Sélectionnez le type d'exportation souhaité :</p>
              <div className="export-options">
                <button className="export-option-btn week-export" onClick={() => exportToPDF("week")}>
                  <span className="export-icon">📅</span>
                  <span>Exporter la semaine</span>
                  <small>
                    Du {weekDays[0].toLocaleDateString("fr-FR")} au {weekDays[6].toLocaleDateString("fr-FR")}
                  </small>
                </button>
                <button className="export-option-btn day-export" onClick={() => exportToPDF("day")}>
                  <span className="export-icon">📌</span>
                  <span>Exporter le jour</span>
                  <small>{currentDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</small>
                </button>
              </div>
            </div>
            <div className="export-modal-footer">
              <button className="cancel-export-btn" onClick={() => setShowExportModal(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="filters-container">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher du personnel..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <FaFilter className="filter-icon" />
          <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Tous les Rôles</option>
            <option value="Doctor">Médecins</option>
            <option value="Nurse">Infirmiers</option>
          </select>
        </div>
      </div>

      {currentView === "week" && (
        <div className="week-navigation">
          <button className="nav-btn" onClick={goToPreviousWeek}>
            <FaChevronLeft />
          </button>
          <span className="current-week">
            {weekDays[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} -
            {weekDays[6].toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <button className="nav-btn" onClick={goToNextWeek}>
            <FaChevronRight />
          </button>
        </div>
      )}

      {(currentView === "day" || currentView === "list") && (
        <div className="day-navigation">
          <button className="nav-btn" onClick={goToPreviousDay}>
            <FaChevronLeft />
          </button>
          <button className="today-btn" onClick={goToToday}>
            Aujourd'hui
          </button>
          <button className="nav-btn" onClick={goToNextDay}>
            <FaChevronRight />
          </button>
        </div>
      )}

      {loading && <div className="loading-indicator">Chargement des données...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <>
          {currentView === "week" && (
            <div className="schedule-grid">
              <div className="grid-header">
                <div className="staff-header">Personnel</div>
                {weekDays.map((day, index) => (
                  <div key={index} className={`day-header ${isSameDay(day, new Date()) ? "today" : ""}`}>
                    <div>{day.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                    <div>{day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div>
                  </div>
                ))}
              </div>
              <div className="grid-body">
                {filteredStaff.map((staff) => (
                  <div key={staff._id} className="staff-row">
                    <div className="staff-info">
                      <img
                        src={staff.photo ? `${API_BASE_URL}${staff.photo}` : "/src/assets/images/admin.jpg"}
                        alt={staff.fullName}
                        className="staff-photo"
                        onError={(e) => (e.target.src = "/src/assets/images/admin.jpg")}
                      />
                      <div>
                        <div className="staff-name">{staff.fullName}</div>
                      </div>
                    </div>
                    {weekDays.map((day, index) => {
                      const staffShifts = filteredShifts.filter(
                        (shift) =>
                          isSameDay(new Date(shift.start), day) &&
                          (shift.assignedDoctors?.some((doc) => doc._id === staff._id) ||
                            shift.assignedNurses?.some((nurse) => nurse._id === staff._id))
                      );
                      const onLeave = isOnLeave(staff._id, day);
                      return (
                        <div
                          key={index}
                          className={`day-cell ${isSameDay(day, new Date()) ? "today" : ""} ${onLeave ? "on-leave" : ""}`}
                        >
                          {onLeave && <div className="leave-indicator">Congé</div>}
                          {staffShifts.length > 0 ? (
                            <div className="shifts-container">
                              {staffShifts.map((shift) => (
                                <div
                                  key={shift._id}
                                  className={`shift-item ${shift.shift.toLowerCase()}`}
                                  title={shift.description || "Aucune note"}
                                >
                                  {shift.title} ({shift.shift}: {shift.start.substring(11, 16)}-
                                  {shift.end.substring(11, 16)})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-cell">-</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "day" && (
            <div className="day-view">
              <h3 className="day-title">
                {currentDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="shift-sections">
                {["Morning", "Evening", "Night"].map((shiftType) => (
                  <div key={shiftType} className="shift-section">
                    <h4 className={`shift-title ${shiftType.toLowerCase()}-title`}>
                      <div className={`shift-indicator ${shiftType.toLowerCase()}`}></div>
                      {shiftType === "Morning" ? "Matin (6h-14h)" : shiftType === "Evening" ? "Soir (14h-22h)" : "Nuit (22h-6h)"}
                    </h4>
                    <div className="staff-cards">
                      {filteredShifts
                        .filter((shift) => shift.shift === shiftType && isSameDay(new Date(shift.start), currentDate))
                        .map((shift) => {
                          const assignedStaff = filteredStaff.filter(
                            (s) =>
                              shift.assignedDoctors?.some((doc) => doc._id === s._id) ||
                              shift.assignedNurses?.some((nurse) => nurse._id === s._id)
                          );
                          return assignedStaff.map((staff) => {
                            const onLeave = isOnLeave(staff._id, currentDate);
                            return (
                              <div
                                key={`${shift._id}-${staff._id}`}
                                className={`staff-card ${onLeave ? "on-leave" : ""}`}
                                title={shift.description || "Aucune note"}
                              >
                                <img
                                  src={staff.photo ? `${API_BASE_URL}${staff.photo}` : "/src/assets/images/admin.jpg"}
                                  alt={staff.fullName}
                                  className="staff-photo"
                                  onError={(e) => (e.target.src = "/src/assets/images/admin.jpg")}
                                />
                                <div>
                                  <div className="staff-name">{staff.fullName}</div>
                                  {onLeave && <div className="leave-indicator">Congé</div>}
                                </div>
                                <div className="staff-role">{staff.role === "Doctor" ? "Médecin" : "Infirmier"}</div>
                              </div>
                            );
                          });
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "list" && (
            <div className="list-view">
              <h3 className="list-title">
                Horaires pour le{" "}
                {currentDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </h3>
              <div className="shifts-list">
                {filteredShifts
                  .filter((shift) => isSameDay(new Date(shift.start), currentDate))
                  .sort((a, b) => a.start.localeCompare(b.start))
                  .map((shift) => {
                    const assignedStaff = filteredStaff.filter(
                      (s) =>
                        shift.assignedDoctors?.some((doc) => doc._id === s._id) ||
                        shift.assignedNurses?.some((nurse) => nurse._id === s._id)
                    );
                    return assignedStaff.map((staff) => {
                      const onLeave = isOnLeave(staff._id, currentDate);
                      return (
                        <div
                          key={`${shift._id}-${staff._id}`}
                          className={`shift-list-item ${shift.shift.toLowerCase()}-border ${onLeave ? "on-leave" : ""}`}
                          title={shift.description || "Aucune note"}
                        >
                          <div className="shift-staff-info">
                            <img
                              src={staff.photo ? `${API_BASE_URL}${staff.photo}` : "/src/assets/images/admin.jpg"}
                              alt={staff.fullName}
                              className="staff-photo"
                              onError={(e) => (e.target.src = "/src/assets/images/admin.jpg")}
                            />
                            <div>
                              <div className="staff-name">{staff.fullName}</div>
                              {onLeave && <div className="leave-indicator">Congé</div>}
                            </div>
                          </div>
                          <div className="shift-time-info">
                            <div className="shift-type">
                              {shift.shift === "Morning" ? "Matin" : shift.shift === "Evening" ? "Soir" : "Nuit"}
                            </div>
                            <div className="shift-time">
                              {shift.start.substring(11, 16)} - {shift.end.substring(11, 16)}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="shift-legend">
        <h4>Légende des Horaires</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color morning"></div>
            <span>Matin (6h-14h)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color evening"></div>
            <span>Soir (14h-22h)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color night"></div>
            <span>Nuit (22h-6h)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerInterface;
