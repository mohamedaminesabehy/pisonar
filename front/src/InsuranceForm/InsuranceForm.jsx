import { useState, useEffect } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";
import "./InsuranceForm.css";

const InsuranceForm = () => {
  const [formData, setFormData] = useState({
    code: "",
    percentage: "",
    expirationDate: "",
  });
  const [insurances, setInsurances] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInsurances();
  }, []);

  const fetchInsurances = async () => {
    try {
      const res = await axios.get("/insurance");
      setInsurances(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire({ title: "Error", text: "Failed to fetch Insurances", icon: "error" });
      setInsurances([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/insurance/${editId}`, formData);
        Swal.fire({ title: "Updated", text: "Insurance updated successfully", icon: "success" });
      } else {
        await axios.post("/insurance", formData);
        Swal.fire({ title: "Created", text: "Insurance created successfully", icon: "success" });
      }
      fetchInsurances();
      setFormData({ code: "", percentage: "", expirationDate: "" });
      setEditId(null);
      setShowForm(false);
    } catch {
      Swal.fire({ title: "Error", text: "An error occurred", icon: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/insurance/${id}`);
      Swal.fire({ title: "Deleted", text: "Insurance deleted successfully", icon: "success" });
      fetchInsurances();
    } catch {
      Swal.fire({ title: "Error", text: "Failed to delete Insurance", icon: "error" });
    }
  };

  const handleEdit = (ins) => {
    setFormData({
      code: ins.code,
      percentage: ins.percentage,
      expirationDate: ins.expirationDate
        ? new Date(ins.expirationDate).toISOString().split("T")[0]
        : "",
    });
    setEditId(ins._id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setFormData({ code: "", percentage: "", expirationDate: "" });
    setEditId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ code: "", percentage: "", expirationDate: "" });
    setEditId(null);
  };

  return (
    <div className="insurance-form-container">
      <h2>Manage Insurance</h2>
      <button className="add-insurance-btn" onClick={handleAdd}>
        Add Insurance
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="insurance-form-modal">
          <input
            type="text"
            name="code"
            placeholder="Code"
            value={formData.code}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="percentage"
            placeholder="Percentage"
            value={formData.percentage}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
          <input
            type="date"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
          />
          <div className="form-actions">
            <button type="submit">
              {editId ? "Update Insurance" : "Create Insurance"}
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="insurance-table-wrapper">
        <table className="insurance-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Percentage</th>
              <th>Expiration Date</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {insurances.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No Insurances found.
                </td>
              </tr>
            ) : (
              insurances.map((ins) => (
                <tr key={ins._id}>
                  <td>{ins.code}</td>
                  <td>{ins.percentage}%</td>
                  <td>
                    {ins.expirationDate
                      ? new Date(ins.expirationDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{ins.isActive ? "Yes" : "No"}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(ins)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(ins._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsuranceForm;
