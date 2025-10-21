const Event = require("../models/Event");
const Notification = require("../models/Notification");
const PDFDocument = require("pdfkit");

exports.createEvent = async (req, res) => {
  try {
    const { title, start, end, assignedDoctors, assignedNurses, shift, description } = req.body;

    if (!title || !start || !end || !shift || (!assignedDoctors.length && !assignedNurses.length)) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided and at least one staff member assigned" });
    }

    const event = new Event({
      title,
      start,
      end,
      assignedDoctors: assignedDoctors || [],
      assignedNurses: assignedNurses || [],
      shift,
      description,
      createdBy: req.user._id,
    });

    const savedEvent = await event.save();

    const doctorNotifications = assignedDoctors.map((doctorId) => ({
      recipient: doctorId,
      recipientModel: "Doctor",
      message: `You have been assigned to "${title}" on ${new Date(start).toLocaleString()} (${shift} shift).`,
      event: savedEvent._id,
      read: false,
    }));

    const nurseNotifications = assignedNurses.map((nurseId) => ({
      recipient: nurseId,
      recipientModel: "Nurse",
      message: `You have been assigned to "${title}" on ${new Date(start).toLocaleString()} (${shift} shift).`,
      event: savedEvent._id,
      read: false,
    }));

    if (doctorNotifications.length > 0 || nurseNotifications.length > 0) {
      await Notification.insertMany([...doctorNotifications, ...nurseNotifications]);
      console.log(`Created ${doctorNotifications.length + nurseNotifications.length} notifications`);
    }

    res.status(201).json({ message: "Event created successfully", event: savedEvent });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("assignedDoctors", "fullName photo")
      .populate("assignedNurses", "fullName photo");
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("assignedDoctors", "fullName photo")
      .populate("assignedNurses", "fullName photo");
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const { title, start, end, assignedDoctors, assignedNurses, shift, description } = req.body;

    if (title) event.title = title;
    if (start) event.start = start;
    if (end) event.end = end;
    if (assignedDoctors) event.assignedDoctors = assignedDoctors;
    if (assignedNurses) event.assignedNurses = assignedNurses;
    if (shift) event.shift = shift;
    if (description !== undefined) event.description = description;

    const updatedEvent = await event.save();

    await Notification.deleteMany({ event: updatedEvent._id });

    const doctorNotifications = (assignedDoctors || []).map((doctorId) => ({
      recipient: doctorId,
      recipientModel: "Doctor",
      message: `You have been assigned to "${updatedEvent.title}" on ${new Date(updatedEvent.start).toLocaleString()} (${updatedEvent.shift} shift).`,
      event: updatedEvent._id,
      read: false,
    }));

    const nurseNotifications = (assignedNurses || []).map((nurseId) => ({
      recipient: nurseId,
      recipientModel: "Nurse",
      message: `You have been assigned to "${updatedEvent.title}" on ${new Date(updatedEvent.start).toLocaleString()} (${updatedEvent.shift} shift).`,
      event: updatedEvent._id,
      read: false,
    }));

    if (doctorNotifications.length > 0 || nurseNotifications.length > 0) {
      await Notification.insertMany([...doctorNotifications, ...nurseNotifications]);
      console.log(`Created ${doctorNotifications.length + nurseNotifications.length} notifications after update`);
    }

    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(400).json({ error: "Invalid data provided" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await Notification.deleteMany({ event: req.params.id });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.exportScheduleToPDF = async (req, res) => {
  try {
    const { events, view, startDate, endDate } = req.body;

    if (!events || !view || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required data" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    let filename = `Schedule_${view}_${new Date(startDate).toLocaleDateString("fr-FR")}.pdf`;
    filename = encodeURIComponent(filename);

    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    doc.on("error", (err) => {
      console.error("PDF Stream Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error generating PDF" });
      }
    });

    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill("#1a365d");
    doc.fontSize(22).fillColor("white").text(`Planning ${view === "week" ? "Hebdomadaire" : "Quotidien"}`, 50, 20);
    doc.fontSize(12).text(`Du ${new Date(startDate).toLocaleDateString("fr-FR")} au ${new Date(endDate).toLocaleDateString("fr-FR")}`, 50, 50);
    doc.moveDown(3);

    // Table Setup
    const tableTop = doc.y;
    const tableWidth = 520;
    const colWidth = view === "week" ? tableWidth / 8 : tableWidth / 3;
    const rowHeight = 40;

    const shiftColors = {
      Morning: "#cce5ff",
      Evening: "#fff3cd",
      Night: "#d4edda",
    };

    // Draw Table Headers
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a365d");
    if (view === "week") {
      const days = [];
      const start = new Date(startDate);
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }));
      }
      doc.rect(40, tableTop, colWidth, rowHeight).fill("#f0f4f8");
      doc.fillColor("#1a365d").text("Personnel", 40, tableTop + 10, { width: colWidth, align: "center" });
      days.forEach((day, index) => {
        doc.rect(40 + colWidth * (index + 1), tableTop, colWidth, rowHeight).fill("#f0f4f8");
        doc.fillColor("#1a365d").text(day, 40 + colWidth * (index + 1), tableTop + 10, { width: colWidth, align: "center" });
      });
    } else if (view === "day") {
      doc.rect(40, tableTop, colWidth, rowHeight).fill("#f0f4f8");
      doc.fillColor("#1a365d").text("Personnel", 40, tableTop + 10, { width: colWidth, align: "center" });
      doc.rect(40 + colWidth, tableTop, colWidth, rowHeight).fill("#f0f4f8");
      doc.fillColor("#1a365d").text("Événement", 40 + colWidth, tableTop + 10, { width: colWidth, align: "center" });
      doc.rect(40 + colWidth * 2, tableTop, colWidth, rowHeight).fill("#f0f4f8");
      doc.fillColor("#1a365d").text("Horaire", 40 + colWidth * 2, tableTop + 10, { width: colWidth, align: "center" });
    }

    // Process Events into Rows
    const rows = [];
    events.forEach((event) => {
      const doctors = (event.assignedDoctors || []).map((doc) => ({
        name: `${doc.fullName} (Médecin)`,
        event: event.title,
        shift: event.shift,
        start: event.start,
        end: event.end,
        date: new Date(event.start).toLocaleDateString("fr-FR"),
      }));
      const nurses = (event.assignedNurses || []).map((nurse) => ({
        name: `${nurse.fullName} (Infirmier)`,
        event: event.title,
        shift: event.shift,
        start: event.start,
        end: event.end,
        date: new Date(event.start).toLocaleDateString("fr-FR"),
      }));
      rows.push(...doctors, ...nurses);
    });

    // Draw Table Rows
    let currentY = tableTop + rowHeight;
    doc.font("Helvetica").fontSize(9).fillColor("#333333");
    rows.forEach((row) => {
      if (currentY + rowHeight > doc.page.height - 60) {
        doc.addPage({ margin: 40 });
        currentY = 40;
      }

      if (view === "week") {
        doc.text(row.name, 45, currentY + 10, { width: colWidth - 10, align: "left" });
        const days = [];
        const start = new Date(startDate);
        for (let i = 0; i < 7; i++) {
          const day = new Date(start);
          day.setDate(start.getDate() + i);
          days.push(day.toLocaleDateString("fr-FR"));
        }

        days.forEach((day, colIndex) => {
          if (day === row.date) {
            const text = `${row.event} (${row.shift})`;
            doc.rect(40 + colWidth * (colIndex + 1), currentY, colWidth, rowHeight)
               .fillOpacity(0.7)
               .fill(shiftColors[row.shift] || "#ffffff");
            doc.fillColor("#333333").text(text, 40 + colWidth * (colIndex + 1), currentY + 10, {
              width: colWidth,
              align: "center",
            });
          } else {
            doc.text("-", 40 + colWidth * (colIndex + 1), currentY + 10, { width: colWidth, align: "center" });
          }
        });
      } else if (view === "day") {
        doc.text(row.name, 45, currentY + 10, { width: colWidth - 10, align: "left" });
        doc.text(row.event, 40 + colWidth, currentY + 10, { width: colWidth, align: "center" });
        const shiftText = `${row.shift}: ${row.start.substring(11, 16)}-${row.end.substring(11, 16)}`;
        doc.rect(40 + colWidth * 2, currentY, colWidth, rowHeight)
           .fillOpacity(0.7)
           .fill(shiftColors[row.shift] || "#ffffff");
        doc.fillColor("#333333").text(shiftText, 40 + colWidth * 2, currentY + 10, {
          width: colWidth,
          align: "center",
        });
      }

      // Draw Grid Lines
      doc.lineWidth(0.5).strokeColor("#ccc");
      doc.moveTo(40, currentY).lineTo(40 + tableWidth, currentY).stroke();
      doc.moveTo(40, currentY + rowHeight).lineTo(40 + tableWidth, currentY + rowHeight).stroke();
      for (let i = 0; i <= (view === "week" ? 8 : 3); i++) {
        doc.moveTo(40 + colWidth * i, currentY).lineTo(40 + colWidth * i, currentY + rowHeight).stroke();
      }

      currentY += rowHeight;
    });

    // Footer
    doc.fontSize(10).fillColor("#666").text(`Page ${doc.page.number}`, 0, doc.page.height - 30, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
};

module.exports = {
  createEvent: exports.createEvent,
  getAllEvents: exports.getAllEvents,
  getEventById: exports.getEventById,
  updateEvent: exports.updateEvent,
  deleteEvent: exports.deleteEvent,
  exportScheduleToPDF: exports.exportScheduleToPDF,
};