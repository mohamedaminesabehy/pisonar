import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Swal from 'sweetalert2';
import { FaEye, FaEdit, FaTrash, FaTimes, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './PatientList.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [userData, setUserData] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Priorité pour les états des patients
  const statePriority = {
    Critical: 0,
    Moderate: 1,
    Low: 2,
  };

  // Récupérer le profil de l'utilisateur pour obtenir l'id du docteur
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/profile/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserData(response.data);
      if (response.data?.role === 'Doctor') {
        setDoctorId(response.data._id);
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Récupérer les patients assignés au docteur courant
  const fetchPatients = async (docId) => {
    try {
      const response = await axios.get(`/patients/doctor/${docId}`);
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Swal.fire('Error', 'Failed to fetch patients', 'error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userProfile = await fetchUserProfile();
      if (userProfile?.role === 'Doctor') {
        await fetchPatients(userProfile._id);
      }
    };
    fetchData();
  }, []);

  // Supprimer un patient
  const handleDeletePatient = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this patient!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await axios.delete(`/patients/${id}`);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Patient has been deleted',
          showConfirmButton: false,
          timer: 1500,
        });
        if (doctorId) fetchPatients(doctorId);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      Swal.fire('Error', 'Failed to delete patient', 'error');
    }
  };

  // Ouvrir la modal de vue
  const handleView = (patient) => {
    setCurrentPatient(patient);
    setIsViewModalOpen(true);
  };

  // Rediriger vers le formulaire d'ajout de consultation (la page AddConsultationForm pré-sélectionnera le patient et le docteur)
  const handleAddConsultation = (patient) => {
    navigate(`/add-consultation/${patient._id}`);
  };

  // Ouvrir la modal d'édition
  const handleEdit = (patient) => {
    setCurrentPatient({ ...patient });
    setIsEditModalOpen(true);
  };

  // Mettre à jour les informations du patient
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/patients/${currentPatient._id}`, currentPatient);
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Patient updated successfully!',
        showConfirmButton: false,
        timer: 1500,
      });
      setIsEditModalOpen(false);
      if (doctorId) fetchPatients(doctorId);
    } catch (error) {
      console.error('Error updating patient:', error);
      Swal.fire('Error', 'Failed to update patient', 'error');
    }
  };

  // Gérer les changements des entrées dans la modal d'édition
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPatient(prev => ({ ...prev, [name]: value }));
  };

  // Filtrer les patients selon la recherche
  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trier les patients : si le patient est "discharged", il est mis en bas de la liste.
  // Sinon, on trie selon la priorité définie dans statePriority.
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aStatus = a.status.toLowerCase();
    const bStatus = b.status.toLowerCase();
    if (aStatus === 'discharged' && bStatus !== 'discharged') {
      return 1; // a va après b
    } else if (aStatus !== 'discharged' && bStatus === 'discharged') {
      return -1; // a va avant b
    } else {
      return (statePriority[a.state] ?? 999) - (statePriority[b.state] ?? 999);
    }
  });

  return (
    <div className="container">
      <h2 className="title">Patient List</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {sortedPatients.length === 0 ? (
        <p className="no-results">No patients found</p>
      ) : (
        <div className="table-responsive">
          <table className="patient-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Age</th>
                <th>Chief Complaint</th>
                <th>State</th>
                <th>Status</th>
                <th>Doctor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.firstName}</td>
                  <td>{patient.lastName}</td>
                  <td>{patient.age}</td>
                  <td>{patient.chiefComplaint}</td>
                  <td>
                    <span className={`badge state-${patient.state.toLowerCase().replace(' ', '-')}`}>
                      {patient.state}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${patient.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>{patient.doctor?.fullName || 'Not assigned'}</td>
                  <td className="actions">
                    <button onClick={() => handleView(patient)} className="btn-view" title="View">
                      <FaEye />
                    </button>
                    {/* Le bouton "Add Consultation" n'est affiché que si le patient n'est pas discharged */}
                    {patient.status &&
                      patient.status.toLowerCase() !== 'discharged' && (
                        <button 
                          onClick={() => handleAddConsultation(patient)} 
                          className="btn-consult"
                          title="Add Consultation"
                        >
                          <FaPlus />
                        </button>
                      )}
                    <button onClick={() => handleEdit(patient)} className="btn-edit" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeletePatient(patient._id)} className="btn-delete" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && currentPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Patient Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="close-btn" title="Close">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="patient-details-grid">
                <div className="detail-item">
                  <span className="detail-label">First Name:</span>
                  <span className="detail-value">{currentPatient.firstName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name:</span>
                  <span className="detail-value">{currentPatient.lastName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{currentPatient.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{currentPatient.age}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Chief Complaint:</span>
                  <span className="detail-value">{currentPatient.chiefComplaint}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">State:</span>
                  <span className={`detail-value badge state-${currentPatient.state.toLowerCase().replace(' ', '-')}`}>
                    {currentPatient.state}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value badge status-${currentPatient.status.toLowerCase().replace(' ', '-')}`}>
                    {currentPatient.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Assigned Doctor:</span>
                  <span className="detail-value">
                    {currentPatient.doctor?.fullName || 'Not assigned'} 
                    {currentPatient.doctor?.specialization && ` (${currentPatient.doctor.specialization})`}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsViewModalOpen(false)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && currentPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Patient</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn" title="Close">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={currentPatient.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={currentPatient.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={currentPatient.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={currentPatient.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Chief Complaint</label>
                  <input
                    type="text"
                    name="chiefComplaint"
                    value={currentPatient.chiefComplaint}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {/* Ajoutez d'autres champs d'édition si nécessaire */}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
