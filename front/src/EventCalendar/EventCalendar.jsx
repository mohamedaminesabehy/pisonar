import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import "./EventCalendar.css";

const BASE_URL = "http://localhost:3006";

const EventCalendar = ({ userName }) => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    assignedDoctors: [],
    assignedNurses: [],
    shift: "",
    description: "",
  });
  const [view, setView] = useState("dayGridMonth");
  const [staffList, setStaffList] = useState({ doctors: [], nurses: [] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEvents();
    fetchStaff();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const [doctorsResponse, nursesResponse] = await Promise.all([
        axios.get(`${BASE_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/nurses`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStaffList({
        doctors: doctorsResponse.data.map((doc) => ({
          id: doc._id,
          fullName: doc.fullName,
          photo: doc.photo ? `${BASE_URL}${doc.photo}` : "/placeholder.svg?height=60&width=60",
        })),
        nurses: nursesResponse.data.map((nurse) => ({
          id: nurse._id,
          fullName: nurse.fullName,
          photo: nurse.photo ? `${BASE_URL}${nurse.photo}` : "/placeholder.svg?height=60&width=60",
        })),
      });
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const updateTimeBasedOnShift = (shift, eventObj) => {
    if (!eventObj.start) return {};
    const date = eventObj.start.split("T")[0];
    let startTime, endTime;
    switch (shift) {
      case "Morning":
        startTime = "06:00:00";
        endTime = "14:00:00";
        break;
      case "Evening":
        startTime = "14:00:00";
        endTime = "22:00:00";
        break;
      case "Night":
        startTime = "22:00:00";
        endTime = "06:00:00";
        break;
      default:
        return {};
    }
    return {
      start: `${date}T${startTime}`,
      end: `${date}T${endTime}`,
    };
  };

  const validateForm = (formData) => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.start) newErrors.start = "Start date is required";
    if (!formData.shift) newErrors.shift = "Shift selection is required";
    if (!formData.assignedDoctors.length && !formData.assignedNurses.length)
      newErrors.staff = "At least one doctor or nurse must be assigned";
    return newErrors;
  };

  const handleDateClick = (arg) => {
    setNewEvent({
      ...newEvent,
      start: `${arg.dateStr}T08:00:00`,
      end: `${arg.dateStr}T10:00:00`,
    });
    setSelectedEvent(null);
    setShowModal(true);
    setErrors({});
  };

  const handleAddEvent = async () => {
    const validationErrors = validateForm(newEvent);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const times = updateTimeBasedOnShift(newEvent.shift, newEvent);
      const eventData = { ...newEvent, ...times };
      const response = await axios.post(`${BASE_URL}/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents([...events, response.data.event]);
      resetForm();
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event");
    }
  };

  const handleEventClick = (info) => {
    const ev = events.find((e) => e._id === info.event.id);
    if (!ev) return;
    setSelectedEvent({
      ...ev,
      assignedDoctors: ev.assignedDoctors.map((d) => d._id || d),
      assignedNurses: ev.assignedNurses.map((n) => n._id || n),
    });
    setShowModal(true);
    setErrors({});
  };

  const handleEventDrop = async (info) => {
    try {
      const ev = events.find((e) => e._id === info.event.id);
      const times = updateTimeBasedOnShift(ev.shift, {
        start: info.event.start.toISOString(),
        end: info.event.end?.toISOString() || info.event.start.toISOString(),
      });
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/events/${ev._id}`,
        { start: times.start, end: times.end },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      info.revert();
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/events/${selectedEvent._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((e) => e._id !== selectedEvent._id));
      resetForm();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const handleUpdateEvent = async () => {
    const validationErrors = validateForm(selectedEvent);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const times = updateTimeBasedOnShift(selectedEvent.shift, selectedEvent);
      const eventData = {
        title: selectedEvent.title,
        start: times.start,
        end: times.end,
        assignedDoctors: selectedEvent.assignedDoctors,
        assignedNurses: selectedEvent.assignedNurses,
        shift: selectedEvent.shift,
        description: selectedEvent.description || "",
      };
      await axios.put(`${BASE_URL}/events/${selectedEvent._id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event");
    }
  };

  const handleStaffSelection = (staffId, type) => {
    const target = selectedEvent || newEvent;
    const key = type === "doctor" ? "assignedDoctors" : "assignedNurses";
    const updated = target[key].includes(staffId)
      ? target[key].filter((id) => id !== staffId)
      : [...target[key], staffId];
    if (selectedEvent) {
      setSelectedEvent({ ...selectedEvent, [key]: updated });
    } else {
      setNewEvent({ ...newEvent, [key]: updated });
    }
    if (updated.length) {
      setErrors({ ...errors, staff: "" });
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: "",
      start: "",
      end: "",
      assignedDoctors: [],
      assignedNurses: [],
      shift: "",
      description: "",
    });
    setSelectedEvent(null);
    setShowModal(false);
    setErrors({});
  };

  // -------------------------------
  // AUTO-SCHEDULE WEEKLY SHIFTS
  // -------------------------------
  const handleAutoSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/schedule/weekly`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const count = response.data.createdCount;
      alert(`Created ${count} events for next week`);
      fetchEvents();
    } catch (error) {
      console.error("Error auto scheduling:", error);
      alert("Failed to auto-schedule shifts.");
    }
  };

  return (
    <div className="event-calendar">
      <div className="calendar-controls">
        <h2 className="page-title">Hospital Staff Scheduling</h2>
        <p className="page-description">Manage shifts for {userName}</p>
        <Button
          variant="primary"
          onClick={() => setView(view === "dayGridMonth" ? "timeGridDay" : "dayGridMonth")}
        >
          Switch to {view === "dayGridMonth" ? "Day" : "Month"} View
        </Button>
        <Button variant="success" className="ms-2" onClick={handleAutoSchedule}>
          Auto Schedule Week
        </Button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        events={events.map((ev) => ({
          id: ev._id,
          title: `${ev.title} (${ev.shift}) - ${[
            ...(ev.assignedDoctors.map((d) => d.fullName) || []),
            ...(ev.assignedNurses.map((n) => n.fullName) || []),
          ].join(", ")}`,
          start: ev.start,
          end: ev.end,
          classNames: [ev.shift.toLowerCase()],
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable
        droppable
        eventDrop={handleEventDrop}
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridDay" }}
        height="calc(100vh - 200px)"
      />

      <Modal show={showModal} onHide={resetForm} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent ? "Edit Shift" : "Add New Shift"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className={`mb-3 ${errors.title ? "has-error" : ""}`}>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={selectedEvent ? selectedEvent.title : newEvent.title}
                onChange={(e) => {
                  const val = e.target.value;
                  selectedEvent
                    ? setSelectedEvent({ ...selectedEvent, title: val })
                    : setNewEvent({ ...newEvent, title: val });
                  setErrors({ ...errors, title: "" });
                }}
              />
              {errors.title && <div className="error-messagee">{errors.title}</div>}
            </Form.Group>

            <Form.Group className={`mb-3 ${errors.shift ? "has-error" : ""}`}>
              <Form.Label>Shift</Form.Label>
              <Form.Select
                value={selectedEvent ? selectedEvent.shift : newEvent.shift}
                onChange={(e) => {
                  const shift = e.target.value;
                  const times = updateTimeBasedOnShift(shift, selectedEvent || newEvent);
                  selectedEvent
                    ? setSelectedEvent({ ...selectedEvent, shift, ...times })
                    : setNewEvent({ ...newEvent, shift, ...times });
                  setErrors({ ...errors, shift: "" });
                }}
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning (6AM-2PM)</option>
                <option value="Evening">Evening (2PM-10PM)</option>
                <option value="Night">Night (10PM-6AM)</option>
              </Form.Select>
              {errors.shift && <div className="error-messagee">{errors.shift}</div>}
            </Form.Group>

            <div className="form-row">
              <Form.Group className={`mb-3 ${errors.start ? "has-error" : ""}`}>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={
                    selectedEvent && selectedEvent.start
                      ? selectedEvent.start.split("T")[0]
                      : newEvent.start
                      ? newEvent.start.split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value;
                    const time =
                      (selectedEvent && selectedEvent.start.split("T")[1]) ||
                      (newEvent.start && newEvent.start.split("T")[1]) ||
                      "08:00:00";
                    selectedEvent
                      ? setSelectedEvent({ ...selectedEvent, start: `${date}T${time}` })
                      : setNewEvent({ ...newEvent, start: `${date}T${time}` });
                    setErrors({ ...errors, start: "" });
                  }}
                />
                {errors.start && <div className="error-messagee">{errors.start}</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={
                    selectedEvent && selectedEvent.end
                      ? selectedEvent.end.split("T")[0]
                      : newEvent.end
                      ? newEvent.end.split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value;
                    const time =
                      (selectedEvent && selectedEvent.end.split("T")[1]) ||
                      (newEvent.end && newEvent.end.split("T")[1]) ||
                      "10:00:00";
                    selectedEvent
                      ? setSelectedEvent({ ...selectedEvent, end: `${date}T${time}` })
                      : setNewEvent({ ...newEvent, end: `${date}T${time}` });
                  }}
                />
              </Form.Group>
            </div>

            <Form.Group className={`mb-3 ${errors.staff ? "has-error" : ""}`}>
              <Form.Label>Assign Staff</Form.Label>
              <div className="staff-selection-container">
                <div className="staff-column">
                  <h3>Doctors</h3>
                  <div className="staff-grid">
                    {staffList.doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className={`staff-card ${
                          (selectedEvent
                            ? selectedEvent.assignedDoctors.includes(doc.id)
                            : newEvent.assignedDoctors.includes(doc.id))
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleStaffSelection(doc.id, "doctor")}
                      >
                        <img src={doc.photo} alt={doc.fullName} className="staff-photo" />
                        <span className="staff-name">{doc.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="staff-column">
                  <h3>Nurses</h3>
                  <div className="staff-grid">
                    {staffList.nurses.map((n) => (
                      <div
                        key={n.id}
                        className={`staff-card ${
                          (selectedEvent
                            ? selectedEvent.assignedNurses.includes(n.id)
                            : newEvent.assignedNurses.includes(n.id))
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleStaffSelection(n.id, "nurse")}
                      >
                        <img src={n.photo} alt={n.fullName} className="staff-photo" />
                        <span className="staff-name">{n.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {errors.staff && <div className="error-messagee">{errors.staff}</div>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedEvent ? selectedEvent.description || "" : newEvent.description}
                onChange={(e) =>
                  selectedEvent
                    ? setSelectedEvent({ ...selectedEvent, description: e.target.value })
                    : setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {selectedEvent && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={resetForm}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={selectedEvent ? handleUpdateEvent : handleAddEvent}
          >
            {selectedEvent ? "Update" : "Add Shift"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EventCalendar;
