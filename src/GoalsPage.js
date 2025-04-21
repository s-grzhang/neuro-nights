import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './GoalsPage.css';
import { getDocs } from "firebase/firestore";
import recommendedGoalsImage from "./Recommended Goals.png";
import GoalCard from './GoalCard'; // Import the GoalCard component
import { db } from './firebase'; // Import db (Firestore)
import { doc, deleteDoc, collection, addDoc, getDoc, updateDoc } from "firebase/firestore"; // Import Firestore methods
import SleepGoalTracker from './utils/SleepGoalTracker'; // Import our new SleepGoalTracker
import SleepRecommendationModel from './utils/SleepRecommendationModel'; // Import our AI model
import { useAuth } from './AuthContext'; // Import useAuth to get user ID
import SleepDataManager from './utils/SleepDataManager';

const GoalsPage = ({ onEarnPoints }) => {
  const { userId } = useAuth(); // Get userId from AuthContext
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
  const [userProfile, setUserProfile] = useState(null); // User profile for AI recommendations
  const [recommendations, setRecommendations] = useState(null); // AI recommendations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [goalType, setGoalType] = useState('duration');
  const [duration, setDuration] = useState(8);
  const [variance, setVariance] = useState(30);
  const [consistencyDays, setConsistencyDays] = useState(7);
  const [bedtime, setBedtime] = useState('11:00 PM');
  const [wakeTime, setWakeTime] = useState('7:00 AM');

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Load goals, user profile, and generate recommendations on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      if (userId) {
        setLoading(true);
        try {
          const goalsSnapshot = await getDocs(collection(db, 'goals'));
          const goalsData = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setGoals(goalsData);

          // Get user profile
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserProfile(userData);
            } else {
              console.log('User document does not exist, creating default profile');
              // Default profile will be used
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }

          // Generate sleep data if none exists
          try {
            const sleepHistory = await SleepGoalTracker.getSleepHistory(userId, 30);
            if (!sleepHistory || sleepHistory.length === 0) {
              await SleepDataManager.generateSimulatedSleepData(userId, 30);
            }
          } catch (error) {
            console.error('Error checking sleep data:', error);
          }

          // Generate AI recommendations
          try {
            const userProfile = {
              age: 30, // Default age if not available
              gender: 'female', // Default gender if not available
              averageSleepDuration: 7,
              sleepVariance: 1.5,
              typicalBedtime: '23:00',
              typicalWakeTime: '07:00'
            };
            
            // Try to get sleep history
            const sleepHistory = await SleepGoalTracker.getSleepHistory(userId, 30);
            
            // Calculate sleep metrics if we have history
            if (sleepHistory && sleepHistory.length > 0) {
              const durations = sleepHistory.map(day => day.sleepDuration || 0);
              const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
              const variance = Math.sqrt(
                durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length
              );
              
              userProfile.averageSleepDuration = avgDuration;
              userProfile.sleepVariance = variance;
              
              if (sleepHistory[0].bedtime) {
                userProfile.typicalBedtime = sleepHistory[0].bedtime;
              }
              if (sleepHistory[0].wakeTime) {
                userProfile.typicalWakeTime = sleepHistory[0].wakeTime;
              }
            }
            
            const recommendations = SleepRecommendationModel.generateRecommendations(userProfile);
            setRecommendations(recommendations);
          } catch (error) {
            console.error('Error generating recommendations:', error);
            // Use default recommendations if AI fails
            setRecommendations({
              duration: { value: 8, confidence: 0.8 },
              consistency: { value: 1, confidence: 0.7 },
              bedtime: { start: '22:30', end: '06:30', confidence: 0.75 }
            });
          }
        } catch (error) {
          console.error('Error fetching goals:', error);
          setError('Error loading goals. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGoals();
  }, [userId]);

  // Fetch goals and update progress when component is mounted
  useEffect(() => {
    const fetchGoalsAndUpdateProgress = async () => {
      try {
        // First fetch goals from Firestore to initialize state
        const querySnapshot = await getDocs(collection(db, "goals"));
        const initialGoals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoals(initialGoals);
        
        // Then update progress based on sleep data
        if (userId) {
          const updatedGoals = await SleepGoalTracker.updateGoalProgress(userId);
          if (updatedGoals && updatedGoals.length > 0) {
            setGoals(updatedGoals);
          }
        }
      } catch (error) {
        console.error("Error getting documents or updating progress:", error);
      }
    };

    fetchGoalsAndUpdateProgress();
    
    // Set up interval to update progress every hour
    const intervalId = setInterval(() => {
      if (userId) {
        SleepGoalTracker.updateGoalProgress(userId)
          .then(updatedGoals => {
            if (updatedGoals && updatedGoals.length > 0) {
              setGoals(updatedGoals);
            }
          })
          .catch(error => {
            console.error("Error updating goal progress:", error);
          });
      }
    }, 3600000); // 1 hour in milliseconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [userId]);
  
  // Handle setting a new goal
  const handleSetGoal = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      // Build the goal text based on the type
      let goalText = '';
      
      switch (goalType) {
        case 'duration':
          goalText = `I will sleep for ${duration} hours each night.`;
          break;
        case 'consistency':
          goalText = `I will maintain a sleep variance of more than ${variance} minutes every ${consistencyDays} days.`;
          break;
        case 'bedtime':
          goalText = `I will sleep from ${bedtime} to ${wakeTime} each night.`;
          break;
        default:
          setError('Invalid goal type selected.');
          return;
      }

      // If we're editing, update the existing goal
      if (editingGoal) {
        const goalRef = doc(db, 'goals', editingGoal.id);
        await updateDoc(goalRef, {
          text: goalText,
          type: goalType,
          // Preserve existing progress
          progress: editingGoal.progress || 0
        });

        // Update the local state
        setGoals(goals.map(goal => 
          goal.id === editingGoal.id 
            ? { ...goal, text: goalText, type: goalType } 
            : goal
        ));
        setEditingGoal(null);
      } else {
        // Add a new goal
        const goalData = {
          userId: userId,
          text: goalText,
          type: goalType,
          createdAt: new Date().toISOString(),
          progress: 0,
          points: 0
        };

        const docRef = await addDoc(collection(db, 'goals'), goalData);
        
        // Update the local state
        setGoals([...goals, { id: docRef.id, ...goalData }]);
      }

      // Reset the form
      setGoalType('duration');
      setDuration(8);
      setVariance(30);
      setConsistencyDays(7);
      setBedtime('11:00 PM');
      setWakeTime('7:00 AM');
      setShowModal(false);
      
    } catch (error) {
      console.error('Error setting goal:', error);
      setError('Failed to set goal. Please try again.');
    }
  };

  // Handle setting a recommended goal
  const handleSetRecommendedGoal = async (type) => {
    if (!userId || !recommendations) return;
    
    try {
      let goalText = '';
      
      switch (type) {
        case 'duration':
          goalText = `I will sleep for ${Math.round(recommendations.duration.value)} hours each night.`;
          setDuration(Math.round(recommendations.duration.value));
          break;
        case 'consistency':
          const varianceMinutes = Math.round(recommendations.consistency.value * 60);
          goalText = `I will maintain a sleep variance of more than ${varianceMinutes} minutes every 7 days.`;
          setVariance(varianceMinutes);
          setConsistencyDays(7);
          break;
        case 'bedtime':
          goalText = `I will sleep from ${recommendations.bedtime.start} to ${recommendations.bedtime.end} each night.`;
          setBedtime(recommendations.bedtime.start);
          setWakeTime(recommendations.bedtime.end);
          break;
        default:
          setError('Invalid recommendation type');
          return;
      }
      
      // Add the new goal to Firestore
      const goalData = {
        userId: userId,
        text: goalText,
        type: type,
        createdAt: new Date().toISOString(),
        progress: 0,
        points: 0
      };
      
      const docRef = await addDoc(collection(db, 'goals'), goalData);
      
      // Update the local state
      setGoals([...goals, { id: docRef.id, ...goalData }]);
      
      // Show a confirmation
      setSuccess(`New ${type} goal has been set!`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error setting recommended goal:', error);
      setError('Failed to set recommended goal. Please try again.');
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'goals', goalId));
      
      // Update local state by filtering out the deleted goal
      setGoals(goals.filter(goal => goal.id !== goalId));
      setSuccess('Goal successfully deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal. Please try again.');
    }
  };

  // Edit a goal
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    
    // Set form values based on goal type
    setGoalType(goal.type || 'duration');
    
    if (goal.text.includes('hours')) {
      const hoursMatch = goal.text.match(/sleep for (\d+) hours/);
      setDuration(hoursMatch ? parseInt(hoursMatch[1]) : 8);
    } else if (goal.text.includes('variance')) {
      const varianceMatch = goal.text.match(/variance of more than (\d+) minutes/);
      const daysMatch = goal.text.match(/every (\d+) days/);
      setVariance(varianceMatch ? parseInt(varianceMatch[1]) : 30);
      setConsistencyDays(daysMatch ? parseInt(daysMatch[1]) : 7);
    } else if (goal.text.includes('sleep from')) {
      const timeMatch = goal.text.match(/sleep from ([\d:APM\s]+) to ([\d:APM\s]+)/i);
      setBedtime(timeMatch ? timeMatch[1].trim() : '11:00 PM');
      setWakeTime(timeMatch ? timeMatch[2].trim() : '7:00 AM');
    }
    
    setShowModal(true);
  };

  // Handle goal completion
  const handleGoalCompleted = async (goal) => {
    if (!userId || goal.progress < 100) return;
    
    try {
      // Award points if the goal is complete and points haven't been awarded yet
      if (goal.progress === 100 && !goal.pointsAwarded) {
        // Update goal in Firestore to mark points as awarded
        await updateDoc(doc(db, 'goals', goal.id), {
          pointsAwarded: true
        });
        
        // Award points to the user
        if (onEarnPoints) {
          onEarnPoints(goal.points || 400);
          setSuccess(`Congratulations! You earned ${goal.points || 400} points for completing your goal!`);
          setTimeout(() => setSuccess(''), 3000);
        }
        
        // Update local state
        setGoals(goals.map(g => 
          g.id === goal.id 
            ? { ...g, pointsAwarded: true } 
            : g
        ));
      }
    } catch (error) {
      console.error('Error handling goal completion:', error);
      setError('Failed to process goal completion. Please try again.');
    }
  };

  // Get the recommended goal text based on AI recommendations
  const getRecommendedGoalText = (type) => {
    if (!recommendations) return '';
    
    switch (type) {
      case 'duration':
        return `Sleep for ${Math.round(recommendations.duration.value)} hours each night`;
      case 'consistency':
        const varianceMinutes = Math.round(recommendations.consistency.value * 60);
        return `Maintain sleep variance under ${varianceMinutes} minutes weekly`;
      case 'bedtime':
        return `Sleep from ${recommendations.bedtime.start} to ${recommendations.bedtime.end}`;
      default:
        return '';
    }
  };

  return (
    <div className={`goals-page ${menuOpen ? "menu-open" : ""}`}>
      {/* Error and Success Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {/* Recommended Goals */}
      <div className="goal-box">
        <img src={recommendedGoalsImage} alt="Recommended Goals" className="goal-image" />
        <div className="goal-cards">
          <div className="goal-card">
            <h3>Duration</h3>
            <p>{getRecommendedGoalText('duration')}</p>
            <button className="set-button" onClick={() => handleSetRecommendedGoal('duration')}>SET</button>
          </div>
          <div className="goal-card">
            <h3>Consistency</h3>
            <p>{getRecommendedGoalText('consistency')}</p>
            <button className="set-button" onClick={() => handleSetRecommendedGoal('consistency')}>SET</button>
          </div>
          <div className="goal-card">
            <h3>Bedtime</h3>
            <p>{getRecommendedGoalText('bedtime')}</p>
            <button className="set-button" onClick={() => handleSetRecommendedGoal('bedtime')}>SET</button>
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
            onDelete={() => handleDeleteGoal(goal.id)}
            onEdit={() => handleEditGoal(goal)}
            onCompleted={() => handleGoalCompleted(goal)}
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
              value={variance}
              onChange={(e) => setVariance(parseInt(e.target.value))}
            /> minutes every 
            <input 
              type="number" 
              value={consistencyDays}
              onChange={(e) => setConsistencyDays(parseInt(e.target.value))}
            /> days.
          </p>
          <button className="set-button" onClick={() => setShowModal(true)}>SET</button>
        </div>

        {/* Duration Box */}
        <div className="goal-box-new">
          <h3>Duration</h3>
          <p>I will sleep for 
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
            /> hours.
          </p>
          <button className="set-button" onClick={() => setShowModal(true)}>SET</button>
        </div>

        {/* Bedtime Box */}
        <div className="goal-box-new">
          <h3>Bedtime</h3>
          <p>I will sleep from 
            <input 
              type="time" 
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
            /> to 
            <input 
              type="time" 
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />.
          </p>
          <button className="set-button" onClick={() => setShowModal(true)}>SET</button>
        </div>
      </div>

      {/* Goal Form Modal */}
      {showModal && (
        <div className="goal-modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => {
              setShowModal(false);
              setEditingGoal(null);
            }}>&times;</span>
            
            <h2>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
            
            <form onSubmit={handleSetGoal}>
              <div className="form-group">
                <label>Goal Type:</label>
                <select 
                  value={goalType} 
                  onChange={(e) => setGoalType(e.target.value)}
                  disabled={!!editingGoal}
                >
                  <option value="duration">Sleep Duration</option>
                  <option value="consistency">Sleep Consistency</option>
                  <option value="bedtime">Sleep Schedule</option>
                </select>
              </div>
              
              {goalType === 'duration' && (
                <div className="form-group">
                  <label>Hours of Sleep:</label>
                  <input 
                    type="number" 
                    min="5" 
                    max="12" 
                    value={duration} 
                    onChange={(e) => setDuration(parseInt(e.target.value))} 
                  />
                </div>
              )}
              
              {goalType === 'consistency' && (
                <>
                  <div className="form-group">
                    <label>Variance (minutes):</label>
                    <input 
                      type="number" 
                      min="15" 
                      max="120" 
                      value={variance} 
                      onChange={(e) => setVariance(parseInt(e.target.value))} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Days to track:</label>
                    <input 
                      type="number" 
                      min="3" 
                      max="14" 
                      value={consistencyDays} 
                      onChange={(e) => setConsistencyDays(parseInt(e.target.value))} 
                    />
                  </div>
                </>
              )}
              
              {goalType === 'bedtime' && (
                <>
                  <div className="form-group">
                    <label>Bedtime:</label>
                    <input 
                      type="text" 
                      value={bedtime} 
                      onChange={(e) => setBedtime(e.target.value)} 
                      placeholder="e.g. 11:00 PM" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Wake time:</label>
                    <input 
                      type="text" 
                      value={wakeTime} 
                      onChange={(e) => setWakeTime(e.target.value)} 
                      placeholder="e.g. 7:00 AM" 
                    />
                  </div>
                </>
              )}
              
              <button type="submit" className="save-goal-button">
                {editingGoal ? 'Update Goal' : 'Save Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
