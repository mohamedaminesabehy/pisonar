// PrescriptionPendingDoctor.jsx
import { useState, useEffect } from "react";
import axios from "../api/axios";
import {
  FaChevronRight,
  FaChevronLeft,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./PrescriptionPendingDoctor.css";

const PrescriptionPendingDoctor = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allMedications, setAllMedications] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDoctorPrescriptions();
    fetchAllMedications();
  }, []);

  // Fetch current doctor prescriptions
  const fetchDoctorPrescriptions = async () => {
    try {
      const profileRes = await axios.get("/api/profile/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const id = profileRes.data._id;
      setDoctorId(id);

      const resp = await axios.get(`/prescriptions/doctor/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPrescriptions(
        resp.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      console.error("Error fetching doctor's prescriptions:", err);
    }
  };

  const fetchAllMedications = async () => {
    try {
      const resp = await axios.get("/pharmacy");
      setAllMedications(resp.data);
    } catch (err) {
      console.error("Error fetching medications:", err);
    }
  };

  // Preview PDF invoice
  const previewInvoice = (pres) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18).text("Medical Prescription Invoice", 60, 20);
      doc.setFontSize(12).text("Patient Information:", 20, 35);
      doc.text(`Name: ${pres.patient?.firstName || "Unknown"}`, 25, 42);
      doc.text(`Doctor: ${pres.doctor?.fullName || "Unknown"}`, 25, 50);
      doc.text(`Prescription ID: ${pres._id || "N/A"}`, 25, 58);
      doc.text(`Description: ${pres.description || "No description"}`, 25, 66);
      doc.line(20, 75, 190, 75);

      let total = 0;
      const body = pres.medications.map((m) => {
        const sub = m.medication.prix * m.quantity;
        total += sub;
        return [
          m.medication.nomMedicament,
          m.quantity,
          `$${m.medication.prix.toFixed(2)}`,
          `$${sub.toFixed(2)}`,
        ];
      });

      autoTable(doc, {
        startY: 80,
        head: [["Medication", "Qty", "Unit Price", "Total"]],
        body,
        theme: "grid",
      });

      const y = doc.lastAutoTable.finalY + 10;
      doc.line(20, y, 190, y);

      const disc = pres.discount ?? 0;
      const discAmt = (total * disc) / 100;
      const net = total - discAmt;

      doc.text(`Total: $${total.toFixed(2)}`, 20, y + 10);
      doc.text(`Discount (${disc}%): -$${discAmt.toFixed(2)}`, 20, y + 20);
      doc.text(`Final to Pay: $${net.toFixed(2)}`, 20, y + 30);

      const uri = doc.output("dataurlstring");
      const w = window.open("");
      w.document.write(`<iframe width="100%" height="600" src="${uri}"></iframe>`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  // --- New: Update handler ---
  const handleUpdate = async (pres) => {
    // 1️⃣ Build the <datalist> options
    const optionsListHtml = allMedications
      .map((m) => `<option data-id="${m._id}" value="${m.nomMedicament}"></option>`)
      .join("");
  
    // 2️⃣ Build initial rows with inline labels
    const rowsHtml = pres.medications
      .map(
        (m, idx) => `
      <div class="swal-med-row" data-idx="${idx}">
        <input list="med-options" class="swal2-input med-search" value="${m.medication.nomMedicament}" placeholder="Search medication..." />
  
        <span class="label-inline">Qty:</span>
        <input type="number" class="swal2-input short-input med-qty" value="${m.quantity}" min="1" />
  
        <span class="label-inline">Days:</span>
        <input type="number" class="swal2-input short-input med-duration" value="${m.duration || 1}" min="1" />
  
        <span class="label-inline">Per Day:</span>
        <input type="number" class="swal2-input short-input med-times" value="${m.timesPerDay || 1}" min="1" />
  
        <button type="button" class="remove-med-btn">Remove</button>
      </div>`
      )
      .join("");
  
    // 3️⃣ Compose the SweetAlert HTML
    const html = `
      <datalist id="med-options">${optionsListHtml}</datalist>
  
      <label class="swal-update-label">Description</label>
      <textarea id="swal-desc" class="swal2-textarea">${pres.description || ""}</textarea>
  
      <label class="swal-update-label" style="margin-top:10px;">Medications</label>
      <div id="med-list">${rowsHtml}</div>
      <button type="button" id="add-med-btn" class="swal2-confirm swal2-styled" style="margin-top:8px;">
        + Add Medication
      </button>
    `;
  
    // 4️⃣ Fire the modal
    const result = await Swal.fire({
      title: "Edit Prescription",
      html,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      didOpen: () => {
        const container = Swal.getHtmlContainer();
  
        // a) Remove handlers
        container.querySelectorAll(".remove-med-btn").forEach((btn) =>
          btn.addEventListener("click", (e) => {
            e.currentTarget.closest(".swal-med-row").remove();
          })
        );
  
        // b) Add new-med handler
        container.querySelector("#add-med-btn").addEventListener("click", () => {
          const row = document.createElement("div");
          row.className = "swal-med-row";
          row.innerHTML = `
            <input list="med-options" class="swal2-input med-search" placeholder="Search medication..." />
  
            <span class="label-inline">Qty:</span>
            <input type="number" class="swal2-input short-input med-qty" value="1" min="1" />
  
            <span class="label-inline">Days:</span>
            <input type="number" class="swal2-input short-input med-duration" value="1" min="1" />
  
            <span class="label-inline">Per Day:</span>
            <input type="number" class="swal2-input short-input med-times" value="1" min="1" />
  
            <button type="button" class="remove-med-btn">Remove</button>
          `;
          // wire its Remove
          row.querySelector(".remove-med-btn").addEventListener("click", () => {
            row.remove();
          });
          container.querySelector("#med-list").append(row);
        });
      },
      preConfirm: () => {
        const description = document.getElementById("swal-desc").value.trim();
  
        const meds = Array.from(
          document.querySelectorAll("#med-list .swal-med-row")
        ).map((row) => {
          const name = row.querySelector(".med-search").value.trim();
          const medObj = allMedications.find((x) => x.nomMedicament === name);
          if (!medObj) {
            Swal.showValidationMessage(`Medication "${name}" not found`);
          }
  
          const qty = Number(row.querySelector(".med-qty").value);
          const duration = Number(row.querySelector(".med-duration").value);
          const times = Number(row.querySelector(".med-times").value);
  
          if (qty < 1 || duration < 1 || times < 1) {
            Swal.showValidationMessage(
              "Qty, Days, and Per Day must all be at least 1"
            );
          }
  
          return {
            medication: medObj._id,
            quantity: qty,
            duration,
            timesPerDay: times,
          };
        });
  
        if (meds.length === 0) {
          Swal.showValidationMessage("At least one medication is required");
        }
  
        return { description, medications: meds };
      },
    });
  
    // 5️⃣ Save if confirmed
    if (result.isConfirmed) {
      try {
        await axios.put(
          `/prescriptions/${pres._id}`,
          {
            description: result.value.description,
            medications: result.value.medications,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        Swal.fire("Saved!", "Prescription updated.", "success");
        fetchDoctorPrescriptions();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not update prescription.", "error");
      }
    }
  };
  
  
  

  // --- New: Delete handler ---
  const handleDelete = async (pres) => {
    const result = await Swal.fire({
      title: "Delete prescription?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/prescriptions/${pres._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        Swal.fire("Deleted!", "Prescription has been removed.", "success");
        fetchDoctorPrescriptions();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not delete prescription.", "error");
      }
    }
  };

  // Pagination + filtering
  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const visible = prescriptions
    .filter((p) =>
      (p.patient?.firstName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .slice(first, last);

  return (
    <div className="prescription-container">
      <div className="prescription-list">
        <h2>Doctor Prescriptions</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p._id}>
                  <td>{p.patient?.firstName || "Unknown"}</td>
                  <td>{p.doctor?.fullName || "Unknown"}</td>
                  <td>
                    {p.status === "Pending" && (
                      <span className="status-pending">Pending</span>
                    )}
                    {p.status === "failed" && (
                      <span className="status-failed">Failed</span>
                    )}
                    {p.status === "delivered" && (
                      <span className="status-delivered">Delivered</span>
                    )}
                  </td>
                  <td>{p.description || "-"}</td>
                  <td className="action-buttons">
                    <button
                      className="preview-btn same-size-btn"
                      onClick={() => previewInvoice(p)}
                    >
                      <FaEye /> Preview
                    </button>
                    <button
                      className="update-btn same-size-btn"
                      onClick={() => handleUpdate(p)}
                    >
                      <FaEdit /> Update
                    </button>
                    <button
                      className="delete-btn same-size-btn"
                      onClick={() => handleDelete(p)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((n) => Math.max(n - 1, 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft /> Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((n) => n + 1)}
            disabled={last >= prescriptions.length}
          >
            Next <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPendingDoctor;
