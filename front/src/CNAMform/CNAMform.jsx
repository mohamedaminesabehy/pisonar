import { useState, useEffect } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";
import "./CNAMform.css";

const CNAMform = () => {
  const [formData, setFormData] = useState({ code: "", percentage: "", cansilationDate: "" });
  const [cnams, setCnams] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCNAMs();
  }, []);

  const fetchCNAMs = async () => {
    try {
      const res = await axios.get("/cnam");
      setCnams(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire({ title: "Error", text: "Failed to fetch CNAMs", icon: "error" });
      setCnams([]);
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
        await axios.put(`/cnam/${editId}`, formData);
        Swal.fire({ title: "Updated", text: "CNAM updated successfully", icon: "success" });
      } else {
        await axios.post("/cnam", formData);
        Swal.fire({ title: "Created", text: "CNAM created successfully", icon: "success" });
      }
      fetchCNAMs();
      setFormData({ code: "", percentage: "", cansilationDate: "" });
      setEditId(null);
      setShowForm(false);
    } catch {
      Swal.fire({ title: "Error", text: "An error occurred", icon: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/cnam/${id}`);
      Swal.fire({ title: "Deleted", text: "CNAM deleted successfully", icon: "success" });
      fetchCNAMs();
    } catch {
      Swal.fire({ title: "Error", text: "Failed to delete CNAM", icon: "error" });
    }
  };

  const handleEdit = (cnam) => {
    setFormData({ code: cnam.code, percentage: cnam.percentage, cansilationDate: cnam.cansilationDate ? new Date(cnam.cansilationDate).toISOString().split("T")[0] : "" });
    setEditId(cnam._id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setFormData({ code: "", percentage: "", cansilationDate: "" });
    setEditId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ code: "", percentage: "", cansilationDate: "" });
    setEditId(null);
  };

  return (
    <div className="cnam-form-container">
      <h2>Manage CNAM</h2>
      <button className="add-cnam-btn" onClick={handleAdd}>Add CNAM</button>
      {showForm && (
        <form onSubmit={handleSubmit} className="cnam-form-modal">
          <input type="text" name="code" placeholder="Code" value={formData.code} onChange={handleChange} required />
          <input type="number" name="percentage" placeholder="Percentage" value={formData.percentage} onChange={handleChange} min="0" max="100" required />
          <input type="date" name="cansilationDate" value={formData.cansilationDate} onChange={handleChange} />
          <div className="form-actions">
            <button type="submit">{editId ? "Update CNAM" : "Create CNAM"}</button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}
      <div className="cnam-table-wrapper">
        <table className="cnam-table">
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
            {cnams.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No CNAMs found.</td></tr>
            ) : (
              cnams.map((cnam) => (
                <tr key={cnam._id}>
                  <td>{cnam.code}</td>
                  <td>{cnam.percentage}%</td>
                  <td>{cnam.cansilationDate ? new Date(cnam.cansilationDate).toLocaleDateString() : "N/A"}</td>
                  <td>{cnam.isActive ? "Yes" : "No"}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(cnam)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(cnam._id)}>Delete</button>
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

export default CNAMform;
