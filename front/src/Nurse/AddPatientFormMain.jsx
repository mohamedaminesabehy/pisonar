import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import AddPatientForm from "./AddPatientForm";

function AddPatientMain() {
  const [isSidebarOpen] = useState(true);
  const userName = "Dr. Martin";

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <AddPatientForm />
        <Footer />
      </div>
    </div>
  );
}

export default AddPatientMain;
