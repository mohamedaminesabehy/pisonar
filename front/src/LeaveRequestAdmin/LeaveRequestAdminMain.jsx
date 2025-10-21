import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import LeaveRequestAdmin from "./LeaveRequestAdmin";

function LeaveRequestAdminMain() {
  const [isSidebarOpen] = useState(true);
  const userName = "Admin";

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <LeaveRequestAdmin />
        <Footer />
      </div>
    </div>
  );
}

export default LeaveRequestAdminMain;