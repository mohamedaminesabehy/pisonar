import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import PrescriptionPending from "./PrescriptionPending";

function PrescriptionPendingM() {
  const [isSidebarOpen] = useState(true);
  const userName = "";

  return (
    <div className="dash-container">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <PrescriptionPending userName={userName} />
        <Footer />
      </div>
    </div>
  );
}

export default PrescriptionPendingM;
