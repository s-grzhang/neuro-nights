import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GoalsPage.css';
import recommendedGoalsImage from "./Recommended Goals.png"; 
import { FaTrashAlt } from 'react-icons/fa';

const GoalsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={`goals-page ${menuOpen ? "menu-open" : ""}`}>

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
          <p>Goal: I will sleep from 11 PM to 8 AM.</p>
          <FaTrashAlt className="trash-icon" />
          <div className="progress-bar-goal">
            <div className="progress-goal" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Goal 2 */}
        <div className="goal-item">
          <p>Goal: I will sleep for 9 hours.</p>
          <FaTrashAlt className="trash-icon" />
          <div className="progress-bar-goal">
            <div className="progress-goal" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Goal 3 */}
        <div className="goal-item">
          <p>Goal: I will avoid a variance of more than 15 minutes every night.</p>
          <FaTrashAlt className="trash-icon" />
          <div className="progress-bar-goal">
            <div className="progress-goal" style={{ width: '30%' }}></div>
          </div>
        </div>
      </div>

      {/* Set New Goals Section */}
      <div className="set-new-goals">
        <h2>Set New Goals</h2>

        {/* Consistency Box */}
        <div className="goal-box-new">
          <h3>Consistency</h3>
          <p>I will avoid a variance of more than 
            <input 
              type="number" 
              placeholder="hours"
            /> every 
            <input 
              type="text" 
              placeholder="days"
            />.
          </p>
          <button className="set-button">SET</button>
        </div>

        {/* Duration Box */}
        <div className="goal-box-new">
          <h3>Duration</h3>
          <p>I will sleep for 
            <input 
              type="number" 
              placeholder="hours"
            /> hours.
          </p>
          <button className="set-button">SET</button>
        </div>

        {/* Bedtime Box */}
        <div className="goal-box-new">
          <h3>Bedtime</h3>
          <p>I will sleep from 
            <input 
              type="time" 
            /> to 
            <input 
              type="time" 
            />.
          </p>
          <button className="set-button">SET</button>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;