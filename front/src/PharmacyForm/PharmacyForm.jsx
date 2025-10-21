import { useState } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";
import "./PharmacyForm.css";

const PharmacyForm = () => {
  const [formData, setFormData] = useState({
    nomMedicament: "",
    quantite: "",
    prix: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.nomMedicament) newErrors.nomMedicament = "Medication name is required";
    if (!formData.quantite || formData.quantite <= 0) newErrors.quantite = "Quantity must be greater than 0";
    if (!formData.prix || formData.prix <= 0) newErrors.prix = "Price must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post("/pharmacy/", formData);
      Swal.fire("Success", "Medication added successfully!", "success");
      setFormData({ nomMedicament: "", quantite: "", prix: "" });
    } catch (error) {
      Swal.fire("Error", "Failed to add medication.", "error");
    }
  };

  return (
    <div className="pharmacy-container">
      <h1 className="main-title">Pharmacy Management</h1>

      <div className="form-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Medication Name</label>
            <input type="text" name="nomMedicament" value={formData.nomMedicament} onChange={handleChange} />
            {errors.nomMedicament && <span className="error-message">{errors.nomMedicament}</span>}
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input type="number" name="quantite" value={formData.quantite} onChange={handleChange} />
            {errors.quantite && <span className="error-message">{errors.quantite}</span>}
          </div>

          <div className="form-group">
            <label>Price</label>
            <input type="number" name="prix" value={formData.prix} onChange={handleChange} />
            {errors.prix && <span className="error-message">{errors.prix}</span>}
          </div>

          <button type="submit" className="submit-btn">Add Medication</button>
        </form>
      </div>
    </div>
  );
};

export default PharmacyForm;
