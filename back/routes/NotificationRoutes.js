const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authorizeRole = require("../middlewares/authorizeRole"); // Ajustez le chemin si nécessaire

// GET /
// Récupère toutes les notifications (sans filtrage par utilisateur)
// Cette route peut être réservée aux administrateurs, par exemple
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// GET /me
// Récupère les notifications pour l'utilisateur authentifié
router.get("/me", authorizeRole(["Admin", "Doctor", "Nurse"]), async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    console.log(`Fetching notifications for user: ${userId}, role: ${userRole}`);

    // Construire la requête en fonction du rôle et de l'utilisateur
    const query = {
      recipient: userId,
      recipientModel: userRole,
    };

    console.log("Query:", query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("event", "title start shift");

    console.log(`Found ${notifications.length} notifications`);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /
// Crée une nouvelle notification
router.post("/", async (req, res) => {
  try {
    const { recipient, recipientModel, message, patient, read } = req.body;

    const newNotification = new Notification({
      recipient,
      recipientModel,
      message,
      patient,
      read: read || false,
    });

    await newNotification.save();

    res.status(201).json({
      success: true,
      data: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// PUT /:id/read
// Marque une notification comme lue pour l'utilisateur authentifié
router.put("/:id/read", authorizeRole(["Admin", "Doctor", "Nurse"]), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;