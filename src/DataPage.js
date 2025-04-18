import React, { useState, useEffect } from 'react';
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
import { Bar } from 'react-chartjs-2';
import { FaMoon, FaBrain, FaChartBar, FaBed, FaMobileAlt } from 'react-icons/fa';
import PhonePickupTracker from './utils/PhonePickupTracker';

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

// Header component
const Header = ({ title }) => (
  <div className="page-header">
    <h1>{title}</h1>
  </div>
);

const DataPage = () => {
  // State for sleep data
  const [sleepData, setSleepData] = useState({
    duration: 0, // hours
    disruptions: 0,
    quality: "good" // can be "good", "fair", or "poor"
  });

  // State for weekly data
  const [weeklyData, setWeeklyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0], // placeholder
        backgroundColor: [
          '#FF6384', // Monday
          '#36A2EB', // Tuesday
          '#FFCE56', // Wednesday
          '#4BC0C0', // Thursday
          '#9966FF', // Friday
          '#FF9F40', // Saturday
          '#36A2EB'  // Sunday
        ],
        borderWidth: 0,
        borderRadius: 6,
      }
    ]
  });

  // State for permission
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  // Check permission and load data on component mount
  useEffect(() => {
    const checkPermissionAndLoadData = async () => {
      setIsLoading(true);
      
      // Check if device is supported (Android only)
      const supported = PhonePickupTracker.isDeviceSupported();
      setIsSupported(supported);
      
      if (!supported) {
        setIsLoading(false);
        return;
      }
      
      // Check if we have permission
      const hasPermissionResult = await PhonePickupTracker.hasPermission();
      setHasPermission(hasPermissionResult);
      
      if (hasPermissionResult) {
        // Load data
        try {
          const nightData = await PhonePickupTracker.getNightPickups();
          setSleepData({
            duration: nightData.sleepDuration,
            disruptions: nightData.nightDisruptions,
            quality: getSleepQuality(nightData.sleepDuration, nightData.nightDisruptions)
          });
          
          const pickupData = await PhonePickupTracker.getPhonePickups(7);
          const labels = pickupData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          });
          
          const pickupCounts = pickupData.map(item => item.pickups);
          
          setWeeklyData({
            labels,
            datasets: [
              {
                data: pickupCounts,
                color: (opacity = 1) => `rgba(71, 126, 232, ${opacity})`,
                strokeWidth: 2
              }
            ]
          });
        } catch (error) {
          console.error('Error loading data:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    checkPermissionAndLoadData();
  }, []);
  
  const handleRequestPermission = async () => {
    setIsLoading(true);
    const result = await PhonePickupTracker.requestPermission();
    setHasPermission(result);
    setIsLoading(false);
    
    if (result) {
      // Reload data after permission granted
      const checkPermissionAndLoadData = async () => {
        // ... existing code in useEffect ...
      };
      checkPermissionAndLoadData();
    }
  };

  // Calculate quality emoji based on sleep duration and disruptions
  const getSleepQuality = (duration, disruptions) => {
    if (duration >= 8 && disruptions <= 1) {
      return "good";
    } else if (duration >= 7 && disruptions <= 3) {
      return "fair";
    } else {
      return "poor";
    }
  };

  // Get sleep quality emoji and label
  const getSleepQualityEmoji = (quality) => {
    switch (quality) {
      case "good":
        return { emoji: "😴", label: "Great" };
      case "fair":
        return { emoji: "😕", label: "Fair" };
      case "poor":
        return { emoji: "😡", label: "Poor" };
      default:
        return { emoji: "😕", label: "Fair" };
    }
  };

  const sleepQuality = getSleepQualityEmoji(sleepData.quality);

  // Generate brain fact based on sleep quality
  const getBrainFact = (quality) => {
    const facts = {
      good: [
        "Your brain builds memory superhighways while you sleep!",
        "When you sleep well, your brain cleans out its trash!",
        "Good sleep helps your brain solve tomorrow's puzzles!",
        "Your brain waves dance like ocean waves during deep sleep!",
        "Sleep helps your brain sort the important stuff from the junk!"
      ],
      fair: [
        "More sleep helps your brain grow stronger connections!",
        "Your brain needs sleep to remember what you learned today!",
        "Brain cells talk to each other better after a good night's sleep!",
        "Your brain has a special cleaning team that works during sleep!",
        "Sleep is like a brain battery charger!"
      ],
      poor: [
        "Even short naps can help your brain work better!",
        "Your brain needs sleep like your body needs food!",
        "Better sleep tonight means a smarter brain tomorrow!",
        "Your brain can't grow as strong without enough sleep!",
        "Sleep is when your brain files today's memories into the right folders!"
      ]
    };

    // Select a random fact from the appropriate category
    const categoryFacts = facts[quality];
    return categoryFacts[Math.floor(Math.random() * categoryFacts.length)];
  };

  // Bar chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw.toFixed(1)} hours`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 12,
        ticks: {
          stepSize: 2
        },
        title: {
          display: true,
          text: 'Hours',
          font: {
            size: 14
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false
  };

  // Get brain fact
  const brainFact = getBrainFact(sleepData.quality);

  return (
    <div className="data-page">
      <Header title="Sleep & Phone Data" />
      <div className="data-content">
        {!isSupported ? (
          <div className="permission-request-card">
            <h2>Device Not Supported</h2>
            <p>Phone pickup tracking is only available on Android devices.</p>
          </div>
        ) : isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your data...</p>
          </div>
        ) : !hasPermission ? (
          <div className="permission-request-card">
            <h2>Permission Required</h2>
            <p>To track your phone usage and provide sleep insights, we need access to usage statistics.</p>
            <button className="permission-button" onClick={handleRequestPermission}>
              Grant Permission
            </button>
          </div>
        ) : (
          <>
            {/* Last Night's Sleep Section */}
            <div className="sleep-summary-card">
              <div className="card-header">
                <FaMoon className="header-icon" />
                <h2>Last Night's Sleep</h2>
              </div>
              
              <div className="sleep-metrics">
                <div className="metric">
                  <div className="metric-icon"><FaBed /></div>
                  <div className="metric-value">{sleepData.duration.toFixed(1)} hrs</div>
                  <div className="metric-label">Sleep Duration</div>
                  <div className="metric-sublabel">time between phone drop & pickup</div>
                </div>
                
                <div className="metric">
                  <div className="metric-icon"><FaMobileAlt /></div>
                  <div className="metric-value">{sleepData.disruptions}</div>
                  <div className="metric-label">Disruptions</div>
                  <div className="metric-sublabel">phone pickups during night</div>
                </div>
                
                <div className="metric quality-metric">
                  <div className="metric-emoji">{sleepQuality.emoji}</div>
                  <div className="metric-label">Sleep Quality</div>
                  <div className="metric-sublabel">{sleepQuality.label}</div>
                </div>
              </div>
            </div>

            {/* Weekly Trend Section */}
            <div className="weekly-trend-card">
              <div className="card-header">
                <FaChartBar className="header-icon" />
                <h2>Weekly Sleep Trend</h2>
              </div>
              
              <div className="chart-container">
                <Bar data={weeklyData} options={chartOptions} />
              </div>
              
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-indicator good"></span>
                  <span>Good (8+ hrs)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-indicator fair"></span>
                  <span>Fair (7-8 hrs)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-indicator poor"></span>
                  <span>Poor (&lt;7 hrs)</span>
                </div>
              </div>
            </div>

            {/* Brain Fact Section */}
            <div className="brain-fact-card">
              <div className="card-header">
                <FaBrain className="header-icon" />
                <h2>Brain Fact of the Day</h2>
              </div>
              
              <div className="brain-fact-content">
                <p className="brain-fact">{brainFact}</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="improve-link">
              <Link to="/goals">Set sleep goals →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataPage;
