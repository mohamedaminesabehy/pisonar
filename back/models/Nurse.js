const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./User");

const nurseSchema = new mongoose.Schema(
    {
        level: { type: String, required: true }, // Nurse level (Junior, Senior, etc.)
        skills: { type: [String] }, // List of skills
        about: { type: String }, // Description about the nurse
        languages: { type: [String] }, // List of spoken languages
        address: { type: String }, // Nurse's address
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Reference to the admin

    },
    { timestamps: true }
);

const Nurse = User.discriminator("Nurse", nurseSchema);
module.exports = Nurse;