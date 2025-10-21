import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import ReportsForm from "./Reports";

function ReportsMain() {
  const [isSidebarOpen] = useState(true);
  const userName = "Dr. Martin";

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <ReportsForm />
        <Footer />
      </div>
    </div>
  );
}

export default ReportsMain;
