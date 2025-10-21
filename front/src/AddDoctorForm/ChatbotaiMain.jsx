import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import Chatbotai from "./Chatbotai";

function ChatbotaiMain() {
  const [isSidebarOpen] = useState(true);
  const userName = "Dr. Martin";

  return (
    <div className="dash">
      <Sidebar isOpen={isSidebarOpen} userName={userName} />
      <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Header userName={userName} />
        <div className="page-contentss">
          <Chatbotai/>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default ChatbotaiMain;