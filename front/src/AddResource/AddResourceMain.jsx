import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import Footer from "../Dashboard/Footer";
import "../Dashboard/Dashboard.css";
import AddResourceForm from "./AddResourceForm";

const AddResourceMain = () => {
    const [isSidebarOpen] = useState(true);
    const userName = "Admin User";

    return (
        <div className="dash">
            <Sidebar isOpen={isSidebarOpen} userName={userName} />
            <div className={`main-content ${isSidebarOpen ? "" : "sidebar-closed"}`}>
                <Header userName={userName} />
                <div className="page-contentss">
                    <AddResourceForm />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default AddResourceMain;
