// GoalsPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GoalsPage.css';
import recommendedGoalsImage from "./Recommended Goals.png"; 
import GoalCard from './GoalCard';  // Import the GoalCard component

const GoalsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [goals, setGoals] = useState([  // Initialize with some default goals
    { id: 1, text: 'I will sleep from 11 PM to 8 AM.', progress: 50 },
    { id: 2, text: 'I will sleep for 9 hours.', progress: 70 },
    { id: 3, text: 'I will avoid a variance of more than 15 minutes every night.', progress: 30 },
    { id: 4, text: 'I will sleep for 8 hours every night.', progress: 100 }  // Hardcoded fulfilled goal
  ]);
  
  const [newGoal, setNewGoal] = useState({
    template: '',  // Store full goal template
    hours: 0,      // Store dynamic values like hours
    days: 0,       // Store dynamic values like days
    timeStart: '', // Store start time for bedtime goals
    timeEnd: '',   // Store end time for bedtime goals
  });

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Function to handle setting a new goal
  const handleSetGoal = () => {
    let goalText = '';
    
    // Build goal text based on the inputs
    if (newGoal.template === 'duration') {
      goalText = `I will sleep for ${newGoal.hours} hours.`;
    } else if (newGoal.template === 'consistency') {
      goalText = `I will avoid a variance of more than ${newGoal.hours} hours every ${newGoal.days} days.`;
    } else if (newGoal.template === 'bedtime') {
      goalText = `I will sleep from ${newGoal.timeStart} to ${newGoal.timeEnd}.`;
    }

    // Only add the new goal if there's a valid goal text
    if (goalText) {
      const newGoalData = { id: goals.length + 1, text: goalText, progress: 0 };
      setGoals([...goals, newGoalData]);
      setNewGoal({
        template: '',
        hours: 0,
        days: 0,
        timeStart: '',
        timeEnd: '',
      });  // Reset after adding the goal
    }
  };

  // Function to delete a goal
  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Function to handle the "400 PTS" click
  const handleEarnPoints = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));  // Remove goal after earning points
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
        {goals.map((goal) => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onDelete={handleDeleteGoal} 
            onEarnPoints={handleEarnPoints}  // Pass the handleEarnPoints function
          />
        ))}
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
              value={newGoal.hours}
              onChange={(e) => setNewGoal({ ...newGoal, hours: e.target.value, template: 'consistency' })}
            /> hours every 
            <input 
              type="number" 
              value={newGoal.days}
              onChange={(e) => setNewGoal({ ...newGoal, days: e.target.value })}
            /> days.
          </p>
          <button className="set-button" onClick={handleSetGoal}>SET</button>
        </div>

        {/* Duration Box */}
        <div className="goal-box-new">
          <h3>Duration</h3>
          <p>I will sleep for 
            <input 
              type="number" 
              value={newGoal.hours}
              onChange={(e) => setNewGoal({ ...newGoal, hours: e.target.value, template: 'duration' })}
            /> hours.
          </p>
          <button className="set-button" onClick={handleSetGoal}>SET</button>
        </div>

        {/* Bedtime Box */}
        <div className="goal-box-new">
          <h3>Bedtime</h3>
          <p>I will sleep from 
            <input 
              type="time" 
              value={newGoal.timeStart}
              onChange={(e) => setNewGoal({ ...newGoal, timeStart: e.target.value, template: 'bedtime' })}
            /> to 
            <input 
              type="time" 
              value={newGoal.timeEnd}
              onChange={(e) => setNewGoal({ ...newGoal, timeEnd: e.target.value })}
            />.
          </p>
          <button className="set-button" onClick={handleSetGoal}>SET</button>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;