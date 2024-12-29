import React from 'react';
import './DataPage.css'; // Include your styles here
import { Link } from 'react-router-dom'; // For navigation to Goals page
import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  import { Bar, Line } from 'react-chartjs-2';
  
  // Register Chart.js components
  ChartJS.register(
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
  );
  

const DataPage = () => {
  // Sample data for the bar chart
  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sleep Duration (hours)',
        data: [7, 8, 6.5, 7.5, 8, 9, 6], // Example data
        backgroundColor: 'blue',
      },
    ],
  };

  // Bar chart options
  const barOptions = {
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Sample data for the line graph
  const lineData = {
    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Age in years
    datasets: [
      {
        label: 'Optimal Brain Development',
        data: [0, 10, 20, 40, 50, 60, 70, 80, 90, 95, 97, 98, 99], // Example curve
        borderColor: 'green',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Your Development',
        data: [0, 8, 15, 35, 48, 55, 68, 75, 85, 92, 94, 95, 96], // Example user data
        borderColor: 'red',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Milestone: ${tooltipItem.raw}`,
        },
      },
    },
  };

  return (
    <div className="data-page">
      {/* Today Summary */}
      <div className="today-box">
        <h2>Today</h2>
        <p>
          You slept for 7 hours and met your REM and deep sleep goals. Keep it
          up to improve your overall brain development!
        </p>
      </div>

      {/* Bar Graph */}
      <div className="chart-container">
        <h3>Weekly Sleep Duration</h3>
        <Bar data={barData} options={barOptions} />
      </div>

      {/* Grey Bars */}
      <div className="average-stats">
        <div className="stat-bar">Average Awake: 1.5 hours</div>
        <div className="stat-bar">Average REM: 2 hours</div>
        <div className="stat-bar">Average Core: 4 hours</div>
        <div className="stat-bar">Average Deep: 1.5 hours</div>
      </div>

      {/* Line Graph */}
      <div className="line-chart-container">
        <h3>Brain Development Milestones</h3>
        <Line data={lineData} options={lineOptions} />
      </div>

      {/* How to Improve Link */}
      <div className="improve-link">
        <Link to="/goals">How to improve →</Link>
      </div>
    </div>
  );
};

export default DataPage;
