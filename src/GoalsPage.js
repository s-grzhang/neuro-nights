// GoalsPage.js (or wherever your menu is located)
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './GoalsPage.css';
import recommendedGoalsImage from "./Recommended Goals.png"; 
import { FaTrashAlt } from 'react-icons/fa';

const GoalsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [goalValues, setGoalValues] = useState({
    hours: '',
    start: '',
    end: '',
    variance: '',
    variancePeriod: '',
    screenTime: ''
  });

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle input change for mad-lib form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoalValues({
      ...goalValues,
      [name]: value
    });
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
            <li><Link to="/home">HOME</Link></li>
            <li><Link to="/goals">GOALS</Link></li>
            <li><Link to="/rewards">REWARDS</Link></li> {/* Add this link */}
            <li><Link to="/data">DATA</Link></li>
            <li><Link to="/education">EDUCATION</Link></li>
            <li><a href="/subscription">SUBSCRIPTION</a></li>
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

      {/* Current Goals Section */}
      <div className="current-goals">
        <h2>Current Goals</h2>

        {/* Goal 1 */}
        <div className="goal-item">
          <p>Goal: Sleep for 8 hours consistently</p>
          <FaTrashAlt className="trash-icon" />
          <div className="progress-bar">
            <div className="progress" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Goal 2 */}
        <div className="goal-item">
          <p>Goal: Go to bed by 10 PM</p>
          <FaTrashAlt className="trash-icon" />
          <div className="progress-bar">
            <div className="progress" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Goal 3 */}
        <div className="goal-item">
          <p>Goal: Wake up by 6:30 AM</p>
          <FaTrashAlt className="trash-icon" />
          <div className="progress-bar">
            <div className="progress" style={{ width: '30%' }}></div>
          </div>
        </div>
      </div>

      {/* Set New Goals Section */}
      <div className="set-new-goals">
        <h2>Set New Goals</h2>
        <div className="goal-madlib-box">
          <p>I will sleep for 
            <input 
              type="number" 
              name="hours" 
              value={goalValues.hours}
              onChange={handleInputChange} 
              placeholder="hours" 
            /> 
            from 
            <input 
              type="time" 
              name="start" 
              value={goalValues.start}
              onChange={handleInputChange}
            /> 
            to 
            <input 
              type="time" 
              name="end" 
              value={goalValues.end}
              onChange={handleInputChange}
            />. 
            I will avoid a bedtime variance of more than 
            <input 
              type="number" 
              name="variance"
              value={goalValues.variance}
              onChange={handleInputChange}
              placeholder="variance" 
            /> every 
            <input 
              type="text" 
              name="variancePeriod"
              value={goalValues.variancePeriod}
              onChange={handleInputChange}
              placeholder="period" 
            />. 
            I will avoid screens 
            <input 
              type="number" 
              name="screenTime"
              value={goalValues.screenTime}
              onChange={handleInputChange}
              placeholder="minutes" 
            /> before sleeping.
          </p>
          <button className="set-button">SET</button>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
