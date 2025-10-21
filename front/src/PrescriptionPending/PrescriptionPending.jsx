// PrescriptionPending.jsx
import { useState, useEffect } from "react";
import axios from "../api/axios";
import {
  FaChevronRight,
  FaChevronLeft,
  FaCheck,
  FaFilePdf,
  FaEye,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import "./PrescriptionPending.css";

const PrescriptionPending = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPendingPrescriptions();
  }, []);

  // Fetch & mark failed, then sort by createdAt desc
  const fetchPendingPrescriptions = async () => {
    try {
      const resp = await axios.get("/prescriptions/");
      const all = resp.data;

      // mark out-of-stock prescriptions as failed
      await Promise.all(
        all.map(async (pres) => {
          const checks = pres.medications.map(async (med) => {
            try {
              const stock = await axios.get(
                `/pharmacy/check-stock/${med.medication._id}`
              );
              return stock.data.inStock;
            } catch {
              return true;
            }
          });
          const results = await Promise.all(checks);
          if (results.some((ok) => !ok)) {
            await axios.put(`/prescriptions/${pres._id}`, { status: "Failed" });
          }
        })
      );

      // re-fetch & sort
      const fresh = await axios.get("/prescriptions/");
      setPrescriptions(
        fresh.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    }
  };

  // renamed from "process" → "validate"
  const handleValidateAndDischargePrescription = async (id) => {
    try {
      const { data: pres } = await axios.get(`/prescriptions/${id}`);
      if (!pres.medications?.length) {
        return Swal.fire("Error", "Prescription is empty.", "error");
      }

      // update stock
      const { data: pharmacy } = await axios.get("/pharmacy/");
      for (let med of pres.medications) {
        const item = pharmacy.find((i) => i._id === med.medication._id);
        if (!item) {
          return Swal.fire(
            "Error",
            `Medication ${med.medication._id} missing.`,
            "error"
          );
        }
        if (item.quantite < med.quantity) {
          return Swal.fire(
            "Error",
            `Not enough stock for ${item.nomMedicament}.`,
            "error"
          );
        }
        await axios.put(`/pharmacy/${item._id}`, {
          ...item,
          quantite: item.quantite - med.quantity,
        });
      }

      // mark Delivered
      const upd = await axios.put(`/prescriptions/${id}`, {
        status: "Delivered",
      });
      if (upd.status === 200) {
        const { isConfirmed } = await Swal.fire({
          title: "Prescription validated!",
          text: "Discharge patient now?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, discharge",
        });

        if (isConfirmed) {
          const patientId =
            pres.patient?._id || pres.patient || "";
          if (!/^[0-9a-fA-F]{24}$/.test(patientId)) {
            return Swal.fire("Error", "Invalid patient ID.", "error");
          }
          const d1 = await axios.patch(`/discharge/${patientId}`, {});
          const d2 = await axios.put(
            `/prescriptions/${id}`,
            { status: "Delivered" },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          if (d1.status === 200 && d2.status === 200) {
            Swal.fire("Success", "Patient discharged.", "success");
          } else {
            Swal.fire("Error", "Discharge update failed.", "error");
          }
        }
        fetchPendingPrescriptions();
      }
    } catch (error) {
      console.error("Error validating prescription:", error);
      Swal.fire("Error", "Could not validate prescription.", "error");
    }
  };

  // Invoice generator now reads discount from pres.discount
  const generateInvoice = (prescription, preview = false) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Medical Prescription Invoice", 70, 20);

      // Patient & doctor info
      doc.setFontSize(12).text("Patient Information:", 20, 35);
      doc.text(`Name: ${prescription.patient.firstName}`, 25, 42);
      doc.text(`Doctor: ${prescription.doctor.fullName}`, 25, 50);
      doc.text(`Prescription ID: ${prescription._id}`, 25, 58);
      doc.line(20, 65, 190, 65);

      // Table
      let total = 0;
      const body = prescription.medications.map((m) => {
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
        startY: 70,
        head: [["Medication", "Qty", "Unit Price", "Total"]],
        body,
        theme: "grid",
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.line(20, finalY, 190, finalY);

      const disc = prescription.discount ?? 0;
      const discAmt = (total * disc) / 100;
      const net = total - discAmt;

      doc.text(`Total: $${total.toFixed(2)}`, 20, finalY + 10);
      doc.text(`Discount (${disc}%): -$${discAmt.toFixed(2)}`, 20, finalY + 20);
      doc.text(`Final to Pay: $${net.toFixed(2)}`, 20, finalY + 30);

      const pdfUri = doc.output("dataurlstring");
      const win = window.open("", "_blank");
      win.document.write(`
        <iframe width="100%" height="600" src="${pdfUri}"></iframe>
        <button onclick="window.print()">Print</button>
      `);
    } catch (err) {
      console.error("Error generating invoice:", err);
      Swal.fire("Error", err.message, "error");
    }
  };

  // Pagination & filtering
  const sorted = prescriptions.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const visible = sorted
    .filter((p) =>
      p.patient?.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .slice(first, last);

  return (
    <div className="prescription-container">
      <div className="prescription-list">
        <h2>Pending Prescriptions</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search by patient..."
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p._id}>
                  <td>{p.patient?.firstName}</td>
                  <td>{p.doctor?.fullName}</td>
                  <td>
                    {p.status === "Pending" && "🟡 Pending"}
                    {p.status === "Failed" && "🔴 Failed"}
                    {p.status === "Delivered" && "🟢 Delivered"}
                  </td>
                  <td className="action-buttons">
                    <button onClick={() => generateInvoice(p, true)}>
                      <FaEye /> Preview
                    </button>
                    {p.status === "Pending" && (
                      <button
                        className="approve-btn"
                        onClick={() =>
                          handleValidateAndDischargePrescription(p._id)
                        }
                      >
                        <FaCheck /> Validate
                      </button>
                    )}
                    {p.status === "Delivered" && (
                      <button
                        className="pdf-btn"
                        onClick={() => generateInvoice(p, false)}
                      >
                        <FaFilePdf /> Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() =>
                setCurrentPage((n) => Math.max(n - 1, 1))
              }
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Prev
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
    </div>
  );
};

export default PrescriptionPending;
