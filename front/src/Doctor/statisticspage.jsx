import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // Adjust this import based on where axios is configured
import { Bar } from 'react-chartjs-2'; // Import Bar chart from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // Import required Chart.js components

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatisticsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [statistics, setStatistics] = useState({
    low: 0,
    moderate: 0,
    critical: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await axios.get('/consultations/consultation');
        setConsultations(response.data);

        // Count the number of consultations for each emergency level
        let low = 0, moderate = 0, critical = 0;

        response.data.forEach(consultation => {
          if (consultation.emergencyLevel === 'low') low++;
          else if (consultation.emergencyLevel === 'moderate') moderate++;
          else if (consultation.emergencyLevel === 'critical') critical++;
        });

        setStatistics({
          low,
          moderate,
          critical,
          total: response.data.length,
        });
      } catch (err) {
        console.error("Error fetching consultations:", err);
      }
    };

    fetchConsultations();
  }, []);

  // Data for the bar chart (histogram)
  const data = {
    labels: ['Low', 'Moderate', 'Critical'], // Categories (x-axis)
    datasets: [
      {
        label: 'Number of Consultations',
        data: [statistics.low, statistics.moderate, statistics.critical], // Consultation counts
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)', // Color for Low
          'rgba(255, 159, 64, 0.2)',  // Color for Moderate
          'rgba(255, 99, 132, 0.2)',  // Color for Critical
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)', // Border color for Low
          'rgba(255, 159, 64, 1)',  // Border color for Moderate
          'rgba(255, 99, 132, 1)',  // Border color for Critical
        ],
        borderWidth: 1, // Border width
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Emergency Level Breakdown', // Title of the chart
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Ensures the y-axis starts at 0
      },
    },
  };

  return (
    <div>
      <h1>Statistics</h1>
      <div>
        <h2>Emergency Level Breakdown</h2>
        <Bar data={data} options={options} /> {/* Render the bar chart */}
      </div>
      <div>
        <h2>Consultation Summary</h2>
        <p>Total Consultations: {statistics.total}</p>
      </div>
    </div>
  );
};

export default StatisticsPage;
