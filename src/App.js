import React, { useState } from "react";
import "./App.css";
import logo from "./moon-removebg-preview.png"; // Ensure the path is correct for your logo
import homePageStars from "./home page stars.png"; // Path to your image
import { FaStar, FaArrowRight } from "react-icons/fa"; // Importing star icon

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Function to simulate progress increase
  const increaseProgress = () => {
    if (progress < 100) {
      setProgress(progress + 10); // Increase by 10 each time
    }
  };

  return (
    <div>
      <header className="fixed-header">
        <h1>
          NeuroNights
          <img src={logo} alt="NeuroNights Logo" className="logo" />
        </h1>
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </header>

      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
        </div>

        <nav>
          <ul>
            <li><a href="#home">HOME</a></li>
            <li><a href="#goals">GOALS</a></li>
            <li><a href="#rewards">REWARDS</a></li>
            <li><a href="#data">DATA</a></li>
            <li><a href="#education">EDUCATION</a></li>
          </ul>
        </nav>
      </div>

      <main>
        {/* Box with gradient background, rounded borders, and content */}
        <div className="status-box">
          <img src={homePageStars} alt="Stars" className="status-box-image" />
          <div className="status-box-text">
            <h2>You slept 8 hours today</h2>
            <p>Keep it up!</p>
          </div>
        </div>

        {/* Reward Points Section */}
      <div className="reward-points">
        <h2>Reward Points</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: '50%' }}>
            <FaStar className="progress-star" />
          </div>
        </div>
      </div>
          {/* Today's Goals Section */}
    <div className="todays-goals">
    <h2>Today's Goals</h2>
    <div className="goal-cards">
      <div className="goal-card">
        <div className="goal-text">
          <h3>Duration</h3>
          <p>You will sleep for at least 8 hours.</p>
        </div>
        <a href="/goals" className="goal-link">
          <FaArrowRight />
        </a>
      </div>
      <div className="goal-card">
        <div className="goal-text">
          <h3>Consistency</h3>
          <p>You will meet your goals every day of the week.</p>
        </div>
        <a href="/goals" className="goal-link">
          <FaArrowRight />
        </a>
      </div>
      <div className="goal-card">
        <div className="goal-text">
          <h3>Bedtime</h3>
          <p>Sleep by 11 PM & wake up by 9 AM.</p>
        </div>
        <a href="/goals" className="goal-link">
          <FaArrowRight />
        </a>
      </div>
    </div>
  </div>
      </main>

      <footer className="footer">
        <p>© NeuroNights</p>
      </footer>
    </div>
  );
};

export default App;
