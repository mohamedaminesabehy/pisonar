import { useState } from "react"
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import Staff from "./staff"

function StaffMain() {
  const [isSidebarOpen ] = useState(true)
  const userName = "Dr. Martin"

  return (
    <div className="dashsdcccc">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        {/* Ne pas passer la fonction toggleSidebar */}
        <Header userName={userName} />
        <Staff userName={userName} />
        <Footer />
      </div>
    </div>
  )
}

export default StaffMain