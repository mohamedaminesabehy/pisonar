import { useState } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";
import "./AddResourceForm.css";

const resourceTypes = [
    "Ventilator", "Defibrillator", "ECGMachine", "InfusionPump",
    "Stretcher", "Monitor", "SuctionDevice", "CrashCart",
    "Bed", "Wheelchair", "IVStand", "MedicalCart", "ExaminationTable"
];

const statusOptions = ["Available", "Occupied", "Under Maintenance"];

const AddResourceForm = () => {
    const [formData, setFormData] = useState({
        type: "",
        status: "Available",
        location: "",
        isFunctional: "true"
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "isFunctional" ? value === "true" : value,
        }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.type) errs.type = "Type is required";
        if (!formData.status) errs.status = "Status is required";
        if (!formData.location) errs.location = "Location is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await axios.post("/resources", {
                ...formData,
                isFunctional: formData.isFunctional === true || formData.isFunctional === "true",
                lastMaintenanceDate: new Date().toISOString() // Automatically set to now
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            Swal.fire({
                icon: "success",
                title: "Resource added successfully!",
                showConfirmButton: false,
                timer: 1500,
            });

            setFormData({
                type: "",
                status: "Available",
                location: "",
                isFunctional: "true"
            });
            setErrors({});
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.error || "Failed to add resource.",
            });
        }
    };

    return (
        <div className="resource-form-container">
            <div className="resource-box">
                <h2 className="form-title">Add Material Resource</h2>
                <form onSubmit={handleSubmit} className="resource-form">
                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="">Select type</option>
                            {resourceTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.type && <p className="error">{errors.type}</p>}
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        {errors.status && <p className="error">{errors.status}</p>}
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} />
                        {errors.location && <p className="error">{errors.location}</p>}
                    </div>

                    <div className="form-group">
                        <label>Functional</label>
                        <select name="isFunctional" value={formData.isFunctional} onChange={handleChange}>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">Add Resource</button>
                </form>
            </div>
        </div>
    );
};

export default AddResourceForm;
