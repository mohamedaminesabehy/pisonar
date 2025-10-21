import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import MaterielResources from "./MaterielResources"; // the new component

function MaterielResourcesMain() {
    const [isSidebarOpen] = useState(true);
    const userName = "Admin";

    return (
        <div className="dashsdcccc">
            <Sidebar isOpen={isSidebarOpen} userName={userName} />
            <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
                <Header userName={userName} />
                <MaterielResources />
                <Footer />
            </div>
        </div>
    );
}

export default MaterielResourcesMain;
