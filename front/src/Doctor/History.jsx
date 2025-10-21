import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "./History.css";

const History = () => {
  const [doctorId, setDoctorId] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [groupedConsultations, setGroupedConsultations] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Récupérer les informations du médecin connecté pour obtenir l'ID
  useEffect(() => {
    async function fetchDoctor() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data._id) {
          setDoctorId(response.data._id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des informations du médecin :", error);
      }
    }
    fetchDoctor();
  }, []);

  // Récupérer les consultations du médecin dès que doctorId est disponible
  useEffect(() => {
    async function fetchConsultations() {
      try {
        if (doctorId) {
          const token = localStorage.getItem("token");
          const response = await axios.get(`/consultations/consultation/doctor/${doctorId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setConsultations(response.data.data || response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des consultations :", error);
      }
    }
    fetchConsultations();
  }, [doctorId]);

  // Groupement des consultations par patient
  useEffect(() => {
    const groups = {};
    consultations.forEach((consultation) => {
      const patient = consultation.patientId;
      if (patient && patient._id) {
        if (!groups[patient._id]) {
          groups[patient._id] = {
            patientInfo: patient,
            consultations: [],
          };
        }
        groups[patient._id].consultations.push(consultation);
      }
    });
    // Tri des consultations pour chaque patient par date décroissante
    for (const patientId in groups) {
      groups[patientId].consultations.sort(
        (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
      );
    }
    setGroupedConsultations(groups);
  }, [consultations]);

  // Filtrer les patients en fonction du terme de recherche
  const filteredPatients = Object.values(groupedConsultations).filter((group) => {
    const patientName = `${group.patientInfo.firstName || ""} ${group.patientInfo.lastName || ""}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
  });

  // Fonction pour gérer l'affichage/masquage des consultations d'un patient
  const handlePatientClick = (patientId) => {
    setSelectedPatient((prev) => (prev === patientId ? null : patientId));
  };

  return (
    <div className="history-page-container">
      <h2>Historique des consultations</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="patient-list">
        {filteredPatients.map((group) => (
          <div key={group.patientInfo._id} className="patient-card">
            <h3
              className="patient-name"
              onClick={() => handlePatientClick(group.patientInfo._id)}
            >
              {group.patientInfo.firstName} {group.patientInfo.lastName}
            </h3>
            {selectedPatient === group.patientInfo._id && (
              <div className="consultations-list">
                {group.consultations.map((consultation, index) => (
                  <div key={consultation._id || index} className="consultation-card">
                    <p>
                      <strong>Date de rendez-vous:</strong>{" "}
                      {consultation.appointmentDate
                        ? new Date(consultation.appointmentDate).toLocaleString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Niveau d'urgence:</strong>{" "}
                      {consultation.emergencyLevel || "N/A"}
                    </p>
                    <p>
                      <strong>Raison:</strong> {consultation.reason || "N/A"}
                    </p>
                    <p>
                      <strong>Diagnostic:</strong>{" "}
                      {consultation.diagnosis || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;