import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import PharmacyForm from "./PharmacyForm";

function PharmacyMain() {
  const [isSidebarOpen] = useState(true);
  const userName = "Pharmacist";

  return (
    <div className="dash">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <div className="page-contentss">
          <PharmacyForm />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default PharmacyMain;
