// src/ListPatientsResource/ListPatientsResourcesMain.jsx
import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import ListPatientsResources from "./ListPatientsResourcesTable";
import "./ListPatientsResources.css";

const ListPatientsResourcesMain = () => {
    const [isSidebarOpen] = useState(true);
    const userName = "Nurse";

    return (
        <div className="dash">
            <Sidebar isOpen={isSidebarOpen} userName={userName} />
            <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
                <Header userName={userName} />
                <div className="page-contentss">
                    <ListPatientsResources />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default ListPatientsResourcesMain;
