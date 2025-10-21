import { useState, useEffect } from "react";
import axios from "../api/axios";
import { FaChevronRight, FaChevronLeft, FaEdit, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";
import "./PharmacyShow.css";

const PharmacyShow = () => {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get("/pharmacy");
      setMedications(response.data);
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  // Supprimer un médicament
  const showDeleteConfirmation = (id) => {
    setMedicationToDelete(id);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!medicationToDelete) return;

    try {
      await axios.delete(`/pharmacy/${medicationToDelete}`);
      Swal.fire("Deleted!", "The medication has been removed.", "success");
      fetchMedications();
    } catch (error) {
      Swal.fire("Error", "Failed to delete medication.", "error");
    } finally {
      setShowDeletePopup(false);
      setMedicationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setMedicationToDelete(null);
  };

  // Ouvrir la modale d'édition avec les infos du médicament sélectionné
  const handleEdit = (med) => {
    setSelectedMedication(med);
    setShowEditPopup(true);
  };

  // Mettre à jour le médicament
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedMedication) return;

    try {
      await axios.put(`/pharmacy/${selectedMedication._id}`, selectedMedication);
      Swal.fire("Success!", "Medication updated successfully!", "success");
      setShowEditPopup(false);
      fetchMedications();
    } catch (error) {
      Swal.fire("Error", "Failed to update medication.", "error");
    }
  };

  // Mise à jour des champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedMedication((prev) => ({ ...prev, [name]: value }));
  };

  // Filtrer les médicaments
  const filteredMedications = medications.filter((med) =>
    med.nomMedicament.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMedications.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pharmacy-container">
      {/* Alerte pour les stocks faibles */}
      {medications.some((med) => med.quantite < 10) && (
        <div className="alert-warning">
          <FaExclamationTriangle /> Some medications are running low on stock!
        </div>
      )}

      <div className="medication-list">
        <div className="section-header">
          <h2>Medication Stock</h2>
        </div>

        {/* Barre de recherche */}
        <input
          type="text"
          className="search-bar"
          placeholder="Search for a medication..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((med) => (
                <tr key={med._id}>
                  <td>{med.nomMedicament}</td>
                  <td>{med.quantite} units</td>
                  <td>${med.prix}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(med)}>
                        <FaEdit />
                      </button>
                      <button className="delete-btn" onClick={() => showDeleteConfirmation(med._id)}>
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <FaChevronLeft /> Previous
          </button>
          <span>Page {currentPage}</span>
          <button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={indexOfLastItem >= filteredMedications.length}>
            Next <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Popup de suppression */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this medication?</p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleDelete}>Delete</button>
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup d'édition */}
      {showEditPopup && selectedMedication && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h3>Edit Medication</h3>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Medication Name</label>
                <input type="text" name="nomMedicament" value={selectedMedication.nomMedicament} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantite" value={selectedMedication.quantite} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input type="number" name="prix" value={selectedMedication.prix} onChange={handleInputChange} />
              </div>

              <button type="submit" className="submit-btn">Update Medication</button>
              <button type="button" className="cancel-btn" onClick={() => setShowEditPopup(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyShow;
