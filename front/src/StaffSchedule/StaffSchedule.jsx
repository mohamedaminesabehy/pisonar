import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Badge, Card, Row, Col, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import './StaffSchedule.css';

const BASE_URL = "http://localhost:3006";

const StaffSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [viewMode, setViewMode] = useState('calendar');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState({
        totalHours: 0,
        pendingShifts: 0,
        completedShifts: 0
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Decode token to get basic user info
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserInfo({
                    fullName: localStorage.getItem('userName') || '',
                    role: tokenData.role
                });
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
        fetchUserSchedules();
    }, []);

    const fetchUserSchedules = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/events`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userRole = JSON.parse(atob(token.split('.')[1])).role;
            const userId = JSON.parse(atob(token.split('.')[1])).userId;

            const userEvents = response.data.filter(event => {
                if (userRole === 'Doctor') {
                    return event.assignedDoctors.some(doc => doc._id === userId);
                } else if (userRole === 'Nurse') {
                    return event.assignedNurses.some(nurse => nurse._id === userId);
                }
                return false;
            });

            setSchedules(userEvents);
            calculateEnhancedStats(userEvents);
        } catch (error) {
            setError('Failed to load schedules. Please try again later.');
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateShiftHours = (shift) => {
        switch (shift?.toLowerCase()) {
            case 'morning':
                return 8; // 6:00 - 14:00 = 8 hours
            case 'evening':
                return 8; // 14:00 - 22:00 = 8 hours
            case 'night':
                return 8; // 22:00 - 6:00 = 8 hours
            default:
                return 0;
        }
    };

    const calculateEnhancedStats = (events) => {
        const now = new Date();
        
        const stats = events.reduce((acc, event) => {
            const startDate = new Date(event.start);
            const shiftHours = calculateShiftHours(event.shift);

            // Calculate total hours for all shifts
            acc.totalHours += shiftHours;

            // Count shifts
            if (startDate < now) {
                acc.completedShifts++;
            } else {
                acc.pendingShifts++;
            }

            return acc;
        }, {
            totalHours: 0,
            pendingShifts: 0,
            completedShifts: 0
        });

        setStats({
            ...stats,
            totalHours: stats.totalHours
        });
    };

    const getShiftStatus = (start, end) => {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (endDate < now) {
            return { text: 'Completed', color: 'success' };
        } else if (startDate <= now && endDate >= now) {
            return { text: 'In Progress', color: 'warning' };
        } else {
            return { text: 'Pending', color: 'primary' };
        }
    };

    // Add this function back
    const getShiftColor = (shift) => {
        switch (shift?.toLowerCase()) {
            case 'morning':
                return 'success';
            case 'evening':
                return 'warning';
            case 'night':
                return 'info';
            default:
                return 'primary';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spinner animation="border" variant="primary" />
                <p>Loading your schedule...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="m-3">
                {error}
            </Alert>
        );
    }

    return (
        <div className="staff-schedule-container">
            <Row className="mb-4">
                <Col md={12} lg={4}>
                    <Card className="welcome-card">
                        <Card.Body>
                            <h4>Welcome, {userInfo?.fullName}</h4>
                            <p>Role: {userInfo?.role}</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={12} lg={8}>
                    <Row>
                        <Col md={6}>
                            <Card className="stats-card hours-card">
                                <Card.Body>
                                    <h6>Working Hours</h6>
                                    <h3>{stats.totalHours}h</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="stats-card completed">
                                <Card.Body>
                                    <h6>Completed Shifts</h6>
                                    <h3>{stats.completedShifts}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Rest of the component remains the same until the Table part */}
            <Card>
                <Card.Body>
                    <Tabs
                        activeKey={viewMode}
                        onSelect={(k) => setViewMode(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="calendar" title="Calendar View">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={schedules.map(schedule => ({
                                    id: schedule._id,
                                    title: `${schedule.title} (${schedule.shift})`,
                                    start: schedule.start,
                                    end: schedule.end,
                                    className: `shift-${schedule.shift?.toLowerCase()}`
                                }))}
                                height="700px"
                            />
                        </Tab>
                        <Tab eventKey="list" title="List View">
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Shift</th>
                                        <th>Time</th>
                                        <th>Title</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map(schedule => {
                                        const status = getShiftStatus(schedule.start, schedule.end);
                                        return (
                                            <tr key={schedule._id}>
                                                <td>{new Date(schedule.start).toLocaleDateString()}</td>
                                                <td>
                                                    <Badge bg={getShiftColor(schedule.shift)}>
                                                        {schedule.shift}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {new Date(schedule.start).toLocaleTimeString()} - 
                                                    {new Date(schedule.end).toLocaleTimeString()}
                                                </td>
                                                <td>{schedule.title}</td>
                                                <td>
                                                    <Badge bg={status.color}>
                                                        {status.text}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </div>
    );
};

export default StaffSchedule;