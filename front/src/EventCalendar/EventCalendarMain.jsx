import { useState } from "react"
import Sidebar from "../Dashboard/Sidebar"
import Header from "../Dashboard/Header"
import Footer from "../Dashboard/Footer"
import "../Dashboard/Dashboard.css"
import EventCalendar from "./EventCalendar"

function EventCalendarMain() {
  const [isSidebarOpen] = useState(true)
  const userName = "Admin"

  return (
    <div className="dasheadq">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <div className="content-container">
          <EventCalendar userName={userName} />
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default EventCalendarMain

