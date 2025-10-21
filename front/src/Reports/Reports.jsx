// src/Reports/Reports.jsx
import { useState, useEffect } from "react";
import axios from "../api/axios";
import "./Reports.css";

const Reports = () => {
  const [userId, setUserId] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsId, setShowDetailsId] = useState(null);

  // 1) Fetch the logged-in user profile to get userId
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get("/api/profile/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (data._id) setUserId(data._id);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // 2) Once we have userId, fetch consultations & prescriptions
  useEffect(() => {
    if (!userId) return;

    const fetchConsultations = async () => {
      try {
        const { data } = await axios.get(`/consultations/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setConsultations(
          (data.data || []).sort(
            (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
          )
        );
      } catch (err) {
        console.error("Error fetching consultations:", err);
      }
    };

    const fetchPrescriptions = async () => {
      try {
        const { data } = await axios.get(`/prescriptions/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPrescriptions(
          (data.data || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
      }
    };

    fetchConsultations();
    fetchPrescriptions();
  }, [userId]);

  // 3) Merge & sort records by date descending
  const records = [
    ...consultations.map(c => ({ ...c, type: "Consultation" })),
    ...prescriptions.map(p => ({ ...p, type: "Prescription" })),
  ].sort((a, b) => {
    const da = a.type === "Consultation" ? a.appointmentDate : a.createdAt;
    const db = b.type === "Consultation" ? b.appointmentDate : b.createdAt;
    return new Date(db) - new Date(da);
  });

  // 4) Filter by doctor name
  const filtered = records.filter(r => {
    const name = r.type === "Consultation"
      ? r.doctorId?.fullName
      : r.doctor?.fullName;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 5) Generic table renderer
  const renderTable = (data, columns) => (
    <div className="table-container">
      <table>
        <thead>
          <tr>{columns.map(col => <th key={col.key}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row._id}>
              {columns.map(col => {
                const content = col.render
                  ? col.render(row)
                  : row[col.key] ?? "—";
                return <td key={col.key}>{content}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="reports-container">
      <h3>My Medical Records</h3>
      <input
        type="text"
        className="search-bar"
        placeholder="Search by doctor..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {renderTable(filtered, [
     
        {
          key: "doctor",
          header: "Doctor",
          render: row =>
            row.type === "Consultation"
              ? row.doctorId?.fullName
              : row.doctor?.fullName,
        },
        {
          key: "reason",
          header: "Reason",
          render: row => row.type === "Consultation" ? row.reason : "—",
        },
        {
          key: "diagnosis",
          header: "Diagnosis",
          render: row => row.type === "Consultation" ? row.diagnosis : "—",
        },
        {
          key: "date",
          header: "Date",
          render: row => {
            const d = row.type === "Consultation"
              ? row.appointmentDate
              : row.createdAt;
            return new Date(d).toLocaleString();
          },
        },
        {
          key: "status",
          header: "Status",
          render: row => {
            if (row.type === "Consultation") return "—";
            const st = (row.status || "").toString();
            return (
              <span className={`badge status-${st.toLowerCase()}`}>
                {st}
              </span>
            );
          },
        },
        {
          key: "actions",
          header: "Actions",
          render: row => {
            if (row.type !== "Prescription") return "—";
            return (
              <button
                className="detail-btn"
                onClick={() =>
                  setShowDetailsId(prev => (prev === row._id ? null : row._id))
                }
              >
                {showDetailsId === row._id ? "Close" : "Details"}
              </button>
            );
          },
        },
      ])}

      {showDetailsId && (
        <div className="prescription-details-card">
          {(() => {
            const presc = prescriptions.find(p => p._id === showDetailsId);
            if (!presc) return null;
            return (
              <>
                <h4>
                  Prescription Details: {presc.codePrescription || presc._id}
                </h4>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Qty</th>
                      <th>Duration</th>
                      <th>Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presc.medications.map((med, idx) => (
                      <tr key={idx}>
                        <td>{med.medication.nomMedicament}</td>
                        <td>{med.quantity}</td>
                        <td>
                          {med.duration} day{med.duration > 1 ? "s" : ""}
                        </td>
                        <td>{med.timesPerDay}×/day</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Reports;
