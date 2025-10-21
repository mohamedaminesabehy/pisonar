import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import EditProfile from "./EditProfile";

function EditProfileMain() {
  const [isSidebarOpen] = useState(true);
  const userName = "Dr. Martin";

  return (
    <div className="dasheadq">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        
          <EditProfile />
        
        <Footer />
      </div>
    </div>
  );
}

export default EditProfileMain;