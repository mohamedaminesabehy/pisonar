import { useState, useEffect } from "react";
import axios from "../api/axios";
import { FaChevronRight, FaChevronLeft, FaSort } from "react-icons/fa";
import Swal from "sweetalert2";
import "./PharmacyShowD.css";

const PharmacyShow = () => {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("nomMedicament"); // Default sorting by name
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending order
  const itemsPerPage = 10;

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

  // 🔹 Fonction de tri
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle order
    } else {
      setSortBy(column);
      setSortOrder("asc"); // Default to ascending when changing column
    }
  };

  // 🔹 Filtrer et trier les médicaments
  const filteredAndSortedMedications = medications
    .filter((med) => med.nomMedicament.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (sortOrder === "asc") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedMedications.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="pharmacy-container">
      {/* Alerte pour les stocks faibles */}
      {medications.some((med) => med.quantite < 10) && (
        <div className="alert-warning">
          <FaSort /> Some medications are running low on stock!
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
                <th onClick={() => handleSort("nomMedicament")}>
                  Medication {sortBy === "nomMedicament" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("quantite")}>
                  Quantity {sortBy === "quantite" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("prix")}>
                  Price {sortBy === "prix" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((med) => (
                <tr key={med._id}>
                  <td>{med.nomMedicament}</td>
                  <td>{med.quantite} units</td>
                  <td>${med.prix}</td>
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
          <button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={indexOfLastItem >= filteredAndSortedMedications.length}>
            Next <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyShow;
