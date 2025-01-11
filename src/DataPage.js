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
        data: [9, 8, 8, 7, 0, 0, 0], // Example data
        backgroundColor: 'blue',
      },
    ],
  };

  // Bar chart options with axis titles and no tooltips
  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours', // Add y-axis title
        },
      },
      x: {
        title: {
          display: true,
          text: 'Days of the Week', // Add x-axis title
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false, // Disable tooltips
      },
    },
  };

  // Sample data for the line graph
  const lineData = {
    labels: [11, 12, 13, 14, 15, 16], // Age in years
    datasets: [
      {
        label: 'Optimal White Matter Volume',
        data: [500, 540, 580, 620, 660, 700], // Example curve
        borderColor: 'black',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Your Development',
        data: [487.3, 504.5, 551.2, 589.8, 622.0, 688.5], // Example user data
        borderColor: 'blue',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  // Line chart options with axis titles and no tooltips
  const lineOptions = {
    scales: {
      y: {
        title: {
          display: true,
          text: 'Volume (cm³)', // Add y-axis title
        },
      },
      x: {
        title: {
          display: true,
          text: 'Age (Years)', // Add x-axis title
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false, // Disable tooltips
      },
    },
  };

  return (
    <div className="data-page">
      {/* Today Summary */}
      <div className="today-box">
        <h2>Today</h2>
        <p>
          You slept for 9 hours and met your duration goal! Keep it
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
        <a href="/goals">How to improve →</a>
      </div>
    </div>
  );
};

export default DataPage;
