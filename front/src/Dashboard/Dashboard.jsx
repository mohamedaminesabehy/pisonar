
import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import Contenue from "./Contenue"
import Footer from "./Footer"
import "./Dashboard.css"

function Dashboard() {
  const [isSidebarOpen ] = useState(true)
  const userName = "Dr. Martin"

  return (
    <div className="dash">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        {/* Ne pas passer la fonction toggleSidebar */}
        <Header userName={userName} />
        <Contenue userName={userName} />
        <Footer />
      </div>
    </div>
  )
}

export default Dashboard