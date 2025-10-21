const express = require("express");
const router = express.Router();
const CNAMController = require("../controllers/CNAMController");

// CRUD routes for CNAM
router.post("/", CNAMController.createCNAM);
router.get("/", CNAMController.getAllCNAMs);
router.get("/:id", CNAMController.getCNAMById);
router.put("/:id", CNAMController.updateCNAM);
router.delete("/:id", CNAMController.deleteCNAM);

module.exports = router;
