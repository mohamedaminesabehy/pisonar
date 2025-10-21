import React, { useState } from 'react';
import Sidebar from '../Dashboard/Sidebar';
import Header from '../Dashboard/Header';
import Footer from '../Dashboard/Footer';
import StaffSchedule from './StaffSchedule';
import '../Dashboard/Dashboard.css';

function StaffScheduleMain() {
    const [isSidebarOpen] = useState(true);
    const userName = localStorage.getItem('userName') || 'Staff Member';

    return (
        <div className="dasheadq">
            <Sidebar isOpen={isSidebarOpen} userName={userName} />
            <div className={`main-content ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
                <Header userName={userName} />
                <div className="content-container">
                    <StaffSchedule />
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default StaffScheduleMain;