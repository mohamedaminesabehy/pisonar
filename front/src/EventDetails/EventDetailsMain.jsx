import { useState } from "react"
import Sidebar from "../Dashboard/Sidebar"
import Header from "../Dashboard/Header"
import Footer from "../Dashboard/Footer"
import "../Dashboard/Dashboard.css"
import EventDetails from "./EventDetails"

function EventDetailsMain() {
  const [isSidebarOpen] = useState(true)
  const userName = "Dr. Martin"

  return (
    <div className="dasheadqas">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
       
          <EventDetails userName={userName} />
        
        <Footer />
      </div>
    </div>
  )
}

export default EventDetailsMain

