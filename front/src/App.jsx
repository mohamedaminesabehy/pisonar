import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';


import AddDoctorMain from './AddDoctorForm/AddDoctorMain';
import StaffMain from './ConsulterStaff/StaffMain';
import Dashboard from './Dashboard/Dashboard';
import EditProfileMain from './EditProfile/EditProfileMain';
import Home from './Home/Home';
import ForgotPassword from './LoginAndRegistration/Login/ForgotPassword';
import LoginAndRegistration from './LoginAndRegistration/LoginAndRegistration';
import MainProfile from './profile/MainProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import Contenue from './Dashboard/Contenue';
// Vérifiez ici que le fichier AddPatientFormMain.jsx existe bien au bon endroit
import AddPatientFormMain from './Nurse/AddPatientFormMain';
import PatientListMainN from './Nurse/PatientListMainN';
/////////

 

import AddConsultationFormMain from './Doctor/AddconsultationformMain';
import ConsultationListMain from './Doctor/ConsultationlistMain';
import PatientListMain from './Doctor/Patientlistmain';
import StatisticsPageMain from './Doctor/StatisticsPageMain';
import HistoryMain from './Doctor/HistoryMain';
////////
import PharmacyMain from './PharmacyForm/PharmacyMain';
import PharmacyShowM from './PharmacyForm/PharmacyShowM';
import PrescriptionMain from './PrescriptionForm/PrescriptionMain';
import PrescriptionPendingM from './PrescriptionPending/PrescriptionPendingM';
import PharmacyShowDoctorM from './PharmacyForm/PharmacyShowDoctorMain';
import PrescriptionPendingDoctorMain from './PrescriptionPendingDoctor/PrescriptionPendingDoctorMain';

/////
import EventDetailsMain from './EventDetails/EventDetailsMain';

import EventCalendarMain from './EventCalendar/EventCalendarMain';
import SchedulerInterfaceMain from './SchedulerInterface/SchedulerInterfaceMain';
import StaffScheduleMain from './StaffSchedule/StaffScheduleMain';
///////
import MaterielResourcesMain from './MaterielResources/MaterielResourcesMain';
import AddResourceMain from './AddResource/AddResourceMain';
import AssignRessourceMain from "./AssignRessource/AssignRessourceMain";
import ListPatientsResourcesMain from "./ListPatientsResource/ListPatientsResourcesMain";
/////

import LeaveRequestMain from './LeaveRequest/LeaveRequestMain';
import LeaveRequestAdminMain from './LeaveRequestAdmin/LeaveRequestAdminMain';
import ChatbotMain from './AddDoctorForm/ChatbotMain';
import ChatbotaiMain from './AddDoctorForm/ChatbotaiMain';
import EmergencyListMain from './AddDoctorForm/EmergencyListMain';
/////

/* Import InsuranceFormMain and CNAMformMain */
import InsuranceFormMain from './InsuranceForm/InsuranceFormMain';
import CNAMformMain from './CNAMform/CNAMformMain';
import ReportsMain from './Reports/ReportsMain';
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/Login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/Login",
    element: <LoginAndRegistration />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Contenue /> },
      // Ajoutez ici d'autres routes sous "/dashboard" si nécessaire
    ],
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <MainProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-staff",
    element: (
      <ProtectedRoute>
        <AddDoctorMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/consultation-list",
    element: (
      <ProtectedRoute>
        <ConsultationListMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-consultation/:patientId",
    element: (
      <ProtectedRoute>
        <AddConsultationFormMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patientlist",
    element: (
      <ProtectedRoute>
        <PatientListMain/>
      </ProtectedRoute>
    ),
  },

  {
    path: "/PatientListN",
    element: (
      <ProtectedRoute>
        <PatientListMainN />
      </ProtectedRoute>
    ),
  },
  {
    path: "/addpatientform",
    element: (
      <ProtectedRoute>
        <AddPatientFormMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/HistoryMain",
    element: (
      <ProtectedRoute>
        <HistoryMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/statistics",
    element: (
      <ProtectedRoute>
        <StatisticsPageMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-staff",
    element: (
      <ProtectedRoute>
        <EditProfileMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cal",
    element: (
      <ProtectedRoute>
        <EventCalendarMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff-members",
    element: (
      <ProtectedRoute>
        <StaffMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-stock",
    element: (
      <ProtectedRoute>
        <PharmacyMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/medication-stock",
    element: (
      <ProtectedRoute>
        <PharmacyShowM />
      </ProtectedRoute>
    ),
  },

  


  {
    path: "/c-prescription",
    element: (
      <ProtectedRoute>
        <PrescriptionMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pending-prescriptions",
    element: (
      <ProtectedRoute>
        <PrescriptionPendingM />
      </ProtectedRoute>
    ),
  },
  {
    path: "/prescription-history",
    element: (
      <ProtectedRoute>
        <PrescriptionPendingDoctorMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/medication-stock-doctor",
    element: (
      <ProtectedRoute>
        <PharmacyShowDoctorM />
      </ProtectedRoute>
    ),
  },
  {
    path: "/events/:eventId",
    element: (
      <ProtectedRoute>
        <EventDetailsMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/work",
    element: (
      <ProtectedRoute>
        <StaffScheduleMain />
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-work",
    element: (
      <ProtectedRoute>
        <EventCalendarMain />
      </ProtectedRoute>
    ),
  },


  {
    path: "/view-staff-work",
    element: (
      <ProtectedRoute>
        <SchedulerInterfaceMain />
      </ProtectedRoute>
    ),
  },



  {path:"/material-resources",
     element:(
    <ProtectedRoute>
      <MaterielResourcesMain />
    </ProtectedRoute>
      ), 
},

  {path:"/add-resource",
     element:(
    <ProtectedRoute>
      <AddResourceMain />
    </ProtectedRoute>
     ),
    },


  {path:"/assign-resource", 
    element:(
    <ProtectedRoute>
      <AssignRessourceMain />
    </ProtectedRoute>
    ),
  },


  {path:"/list-patients-resources", 
    element:(
    <ProtectedRoute>
      <ListPatientsResourcesMain />
    </ProtectedRoute>
    ),
  },
  {
    path: "/leave-request",
    element: (
      <ProtectedRoute>
        <LeaveRequestMain />
      </ProtectedRoute>
    ),
  },
  
  {
    path: "/admin-leave-requests",
    element: (
      <ProtectedRoute>
        <LeaveRequestAdminMain />
      </ProtectedRoute>
    ),
  },

  {path:"/patient-chatbot",
    element:(
   <ProtectedRoute>
     <ChatbotMain />
   </ProtectedRoute>
    ),
   },
   { path: "/emergencies", element: ( <ProtectedRoute> <EmergencyListMain /> </ProtectedRoute> ) },
   { path: "/assistant-ai", element: ( <ProtectedRoute> <ChatbotaiMain /> </ProtectedRoute> ) },
   { path: "/insurance", element: ( <ProtectedRoute> <InsuranceFormMain /> </ProtectedRoute> ) },
   { path: "/cnam", element: ( <ProtectedRoute> <CNAMformMain /> </ProtectedRoute> ) },
   { path: "/my-reports", element: ( <ProtectedRoute> <ReportsMain /> </ProtectedRoute> ) },

]);

export default function App() {
  return <RouterProvider router={router} />;
}
