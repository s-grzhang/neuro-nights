import React, { useState } from 'react';
import './GoalsPage.css'; // Make sure you import the corresponding CSS
import recommendedGoalsImage from "./Recommended Goals.png"; // Import the image

const GoalsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={`goals-page ${menuOpen ? "menu-open" : ""}`}>
      {/* Fixed header and menu toggle */}
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
        </div>

      {/* Sliding menu */}
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

      {/* Goal Box */}
      <div className="goal-box">
        <img src={recommendedGoalsImage} alt="Recommended Goals" className="goal-image" />

        <div className="goal-cards">
          <div className="goal-card">
            <h3>Duration</h3>
            <p>Sleep for at least 8 hours</p>
            <button className="set-button">SET</button>
          </div>
          <div className="goal-card">
            <h3>Consistency</h3>
            <p>Meet your goals every day</p>
            <button className="set-button">SET</button>
          </div>
          <div className="goal-card">
            <h3>Bedtime</h3>
            <p>Sleep by 11 PM & wake up by 9 AM</p>
            <button className="set-button">SET</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
