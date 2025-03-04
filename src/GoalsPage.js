import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GoalsPage.css';
import { useEffect } from 'react';
import { getDocs } from "firebase/firestore";
import recommendedGoalsImage from "./Recommended Goals.png";
import GoalCard from './GoalCard'; // Import the GoalCard component
import { db } from './firebase'; // Import db (Firestore)
import { collection, addDoc } from "firebase/firestore"; // Import Firestore methods

const GoalsPage = ({ onEarnPoints }) => { // Accept onEarnPoints as a prop
  const [menuOpen, setMenuOpen] = useState(false);
  const [goals, setGoals] = useState([
    { id: 1, text: 'I will sleep from 11 PM to 8 AM.', progress: 50 },
    { id: 2, text: 'I will sleep for 9 hours.', progress: 70 },
    { id: 3, text: 'I will avoid a variance of more than 15 minutes every night.', progress: 30 },
    { id: 4, text: 'I will sleep for 8 hours every night.', progress: 100, points: 400 } // Add points property
  ]);

  const [newGoal, setNewGoal] = useState({
    template: '', // Store full goal template
    hours: 0, // Store dynamic values like hours
    days: 0, // Store dynamic values like days
    timeStart: '', // Store start time for bedtime goals
    timeEnd: '', // Store end time for bedtime goals
  });

  const [editingGoal, setEditingGoal] = useState(null); // To track the goal being edited

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  
const handleSetGoal = async () => {
  let goalText = '';
  // Build goal text based on the inputs
  if (newGoal.template === 'duration') {
    goalText = `I will sleep for ${newGoal.hours} hours.`;
  } else if (newGoal.template === 'consistency') {
    goalText = `I will avoid a variance of more than ${newGoal.hours} hours every ${newGoal.days} days.`;
  } else if (newGoal.template === 'bedtime') {
    goalText = `I will sleep from ${newGoal.timeStart} to ${newGoal.timeEnd}.`;
  }

  // Only add or update the goal if there's a valid goal text
  if (goalText) {
    if (editingGoal) {
      // Update the goal
      const updatedGoals = goals.map(goal =>
        goal.id === editingGoal.id ? { ...goal, text: goalText, progress: 0 } : goal
      );
      setGoals(updatedGoals);
      setEditingGoal(null); // Reset after editing
    } else {
      // Add new goal to Firestore
      try {
        const docRef = await addDoc(collection(db, "goals"), {
          text: goalText,
          progress: 0,
          points: 0,  // You can customize the fields as needed
        });
        console.log("Goal added with ID: ", docRef.id);
        setGoals([...goals, { id: docRef.id, text: goalText, progress: 0 }]);
      } catch (e) {
        console.error("Error adding goal: ", e);
      }
    }
    setNewGoal({
      template: '',
      hours: 0,
      days: 0,
      timeStart: '',
      timeEnd: '',
    }); // Reset after adding/updating the goal
  }
};

// Fetch goals when component is mounted
useEffect(() => {
  const fetchGoals = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "goals"));
      const goalsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalsList);
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };

  fetchGoals();
}, []);


  // Function to delete a goal
  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Function to start editing a goal
  const handleEditGoal = (goal) => {
    setNewGoal({
      template: goal.text.includes('hours') ? 'duration' : goal.text.includes('variance') ? 'consistency' : 'bedtime',
      hours: goal.text.match(/\d+/) ? parseInt(goal.text.match(/\d+/)[0]) : 0,
      days: goal.text.includes('days') ? parseInt(goal.text.match(/\d+/)[1]) : 0,
      timeStart: goal.text.includes('from') ? goal.text.split('from ')[1].split(' to ')[0] : '',
      timeEnd: goal.text.includes('to') ? goal.text.split('to ')[1] : '',
    });
    setEditingGoal(goal);
  };

  return (
    <div className={`goals-page ${menuOpen ? "menu-open" : ""}`}>
      {/* Recommended Goals */}
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

      {/* Current Goals */}
      <div className="current-goals">
        <h2>Current Goals</h2>
        {goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onDelete={handleDeleteGoal} 
            onEarnPoints={onEarnPoints} // Pass down the onEarnPoints function
            onEdit={handleEditGoal} // Pass the edit handler to GoalCard
          />
        ))}
      </div>

      {/* Set New Goals */}
      <div className="set-new-goals">
        <h2>{editingGoal ? 'Edit Goal' : 'Set New Goals'}</h2>

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
