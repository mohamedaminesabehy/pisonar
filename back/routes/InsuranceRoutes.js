const express = require("express");
const router = express.Router();
const InsuranceController = require("../controllers/InsuranceController");

// CRUD routes for Assurance
router.post("/", InsuranceController.createInsurance);
router.get("/", InsuranceController.getAllInsurances);
router.get("/:id", InsuranceController.getInsuranceById);
router.put("/:id", InsuranceController.updateInsurance);
router.delete("/:id", InsuranceController.deleteInsurance);

module.exports = router;
