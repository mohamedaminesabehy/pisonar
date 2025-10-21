import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import Profile from "./Profile";

function MainProfile() {
  const [isSidebarOpen] = useState(true);
  const userName = "Dr. Martin";

  // Example user object
  const user = {
    name: "Dr. Martin",
    role: "Doctor",
    email: "martin@example.com",
    phone: "123-456-7890",
    id: "12345",
    specialty: "Cardiology",
    joinDate: "2021-01-01",
    education: "MD, University of Medicine"
  };

  return (
    <div className="dash">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <Profile user={user} />
        <Footer />
      </div>
    </div>
  );
}

export default MainProfile;