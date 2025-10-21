import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import LeaveRequest from "./LeaveRequest";

function LeaveRequestMain() {
  const [isSidebarOpen] = useState(true);
  const userName = localStorage.getItem('userName') || "Staff Member";

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <LeaveRequest />
        <Footer />
      </div>
    </div>
  );
}

export default LeaveRequestMain;