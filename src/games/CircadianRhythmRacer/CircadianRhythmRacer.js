import React, { useState, useEffect, useRef } from 'react';
import './CircadianRhythmRacer.css';
import { FaMoon, FaMobile, FaLaptop, FaBed, FaArrowUp, FaArrowDown, FaArrowLeft } from 'react-icons/fa';
import { updateUserPoints } from '../../firebase';

const CircadianRhythmRacer = ({ userId, userData, updateUserData, onBackToEducation }) => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(50); // vertical position as percentage (0-100)
  const [timeOfDay, setTimeOfDay] = useState(12); // 24-hour time
  const [obstacles, setObstacles] = useState([]);
  const [collectibles, setCollectibles] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  
  // Game settings
  const frameWidth = useRef(0);
  const frameHeight = useRef(0);
  const playerSize = 50;
  const moveStep = 3; // movement step size in percentage
  const lastObstaclePosition = useRef(null); // track last obstacle position
  
  // Determine if user is authenticated
  const isAuthenticated = Boolean(userId && userData);
  
  // Get frame dimensions on mount
  useEffect(() => {
    const gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
      frameWidth.current = gameFrame.clientWidth;
      frameHeight.current = gameFrame.clientHeight;
    }
  }, []);
  
  // Difficulty settings
  const difficultySettings = {
    easy: {
      obstacleSpeed: 3,
      obstacleFrequency: 0.015,
      collectibleFrequency: 0.012,
      timeSpeed: 0.008,
      moveStep: 2,
      minObstacleSpacing: 50, // minimum vertical gap between obstacles
      maxObstaclesOnScreen: 3
    },
    medium: {
      obstacleSpeed: 5,
      obstacleFrequency: 0.02,
      collectibleFrequency: 0.01,
      timeSpeed: 0.01,
      moveStep: 3,
      minObstacleSpacing: 40,
      maxObstaclesOnScreen: 4
    },
    hard: {
      obstacleSpeed: 7,
      obstacleFrequency: 0.03,
      collectibleFrequency: 0.008,
      timeSpeed: 0.015,
      moveStep: 4,
      minObstacleSpacing: 30,
      maxObstaclesOnScreen: 5
    }
  };
  
  // Get current difficulty settings
  const getDifficultySettings = () => {
    return difficultySettings[difficulty];
  };
  
  // Time display helper
  const getTimeDisplay = () => {
    const hours = Math.floor(timeOfDay);
    const minutes = Math.floor((timeOfDay - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Check if it's night time
  const isNightTime = () => {
    return timeOfDay >= 20 || timeOfDay < 6;
  };
  
  // Create new obstacle with improved spacing
  const createObstacle = () => {
    const settings = getDifficultySettings();
    let position;
    
    // Ensure new obstacles have enough spacing
    if (lastObstaclePosition.current !== null) {
      // Create a gap away from the last obstacle
      const minPosition = Math.max(5, lastObstaclePosition.current - settings.minObstacleSpacing);
      const maxPosition = Math.min(95, lastObstaclePosition.current + settings.minObstacleSpacing);
      
      // Determine where to place new obstacle - above or below the last one
      if (Math.random() > 0.5) {
        // Place above the last obstacle if possible
        position = Math.random() * (minPosition - 5) + 5;
      } else {
        // Place below the last obstacle if possible
        position = Math.random() * (95 - maxPosition) + maxPosition;
      }
      
      // If the calculated position is invalid, use a safe default with spacing
      if (isNaN(position) || position < 5 || position > 95) {
        position = Math.random() > 0.5 ? 25 : 75; // Place either in upper or lower part
      }
    } else {
      // First obstacle, random position
      position = Math.random() * 90 + 5; // random vertical position (5-95%)
    }
    
    lastObstaclePosition.current = position;
    
    return {
      id: Date.now() + Math.random(),
      position: position,
      x: frameWidth.current || 800,
      type: Math.random() > 0.5 ? 'phone' : 'laptop'
    };
  };
  
  // Create new collectible
  const createCollectible = () => {
    return {
      id: Date.now() + Math.random(),
      position: Math.random() * 90 + 5, // random vertical position (5-95%)
      x: frameWidth.current || 800,
      type: isNightTime() ? 'melatonin' : 'sleep'
    };
  };
  
  // Check collision between two objects
  const checkCollision = (obj1Position, obj2Position, tolerance = 15) => {
    return Math.abs(obj1Position - obj2Position) < tolerance;
  };
  
  // Handle game over and reward player
  const handleGameOver = () => {
    if (isAuthenticated && userId && updateUserData) {
      // Award a fixed amount of points based on score and difficulty
      let pointsToAward = 0;
      
      if (score < 100) {
        pointsToAward = 10; // Base reward for playing
      } else if (score < 300) {
        pointsToAward = 25; // Medium score reward
      } else {
        pointsToAward = 50; // High score reward
      }
      
      // Extra points for playing on harder difficulties
      if (difficulty === 'medium') {
        pointsToAward += 10;
      } else if (difficulty === 'hard') {
        pointsToAward += 25;
      }
      
      console.log(`Game over! Score: ${score}, Awarding ${pointsToAward} points`);
      
      // Update local user data
      const newPoints = (userData?.points || 0) + pointsToAward;
      updateUserData({ points: newPoints });
      
      // Try to update Firestore if function exists
      if (typeof updateUserPoints === 'function') {
        try {
          updateUserPoints(userId, pointsToAward).catch(err => {
            console.error("Error updating user points:", err);
          });
        } catch (error) {
          console.error("Error updating user points:", error);
        }
      }
    }
    
    setGameOver(true);
    setGameStarted(false);
  };
  
  // Handle back to education page
  const handleBackToEducation = () => {
    if (typeof onBackToEducation === 'function') {
      onBackToEducation();
    }
  };
  
  // Start the game
  const startGame = () => {
    // Reset game state
    setGameStarted(true);
    setShowInstructions(false);
    setGameOver(false);
    setScore(0);
    setPlayerPosition(50); // center of screen
    setTimeOfDay(12); // Start at noon
    lastObstaclePosition.current = null; // Reset obstacle positioning
    
    // Initialize with one obstacle and collectible
    setObstacles([createObstacle()]);
    setCollectibles([createCollectible()]);
  };
  
  // Move player up
  const movePlayerUp = () => {
    if (gameStarted && !gameOver) {
      setPlayerPosition(prev => Math.max(5, prev - getDifficultySettings().moveStep));
    }
  };
  
  // Move player down
  const movePlayerDown = () => {
    if (gameStarted && !gameOver) {
      setPlayerPosition(prev => Math.min(95, prev + getDifficultySettings().moveStep));
    }
  };
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || gameOver) return;
      
      if (e.key === 'ArrowUp' || e.key === 'w') {
        movePlayerUp();
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        movePlayerDown();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);
  
  // Game loop - update time
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const settings = getDifficultySettings();
    const interval = setInterval(() => {
      setTimeOfDay(prevTime => {
        const newTime = prevTime + settings.timeSpeed;
        return newTime >= 24 ? newTime - 24 : newTime;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, difficulty]);
  
  // Game loop - update obstacles
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const settings = getDifficultySettings();
    const interval = setInterval(() => {
      // Move obstacles and check collisions
      setObstacles(prevObstacles => {
        // Move existing obstacles
        const updatedObstacles = prevObstacles
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - settings.obstacleSpeed
          }))
          .filter(obstacle => obstacle.x > -50);
        
        // Check for collisions
        const collision = updatedObstacles.some(
          obstacle => 
            checkCollision(obstacle.position, playerPosition) && 
            obstacle.x < 130 && 
            obstacle.x > 30
        );
        
        if (collision) {
          setTimeout(() => handleGameOver(), 10);
          return updatedObstacles;
        }
        
        // Add new obstacle based on frequency and max allowed on screen
        if (Math.random() < settings.obstacleFrequency * 5 && 
            updatedObstacles.length < settings.maxObstaclesOnScreen) {
          updatedObstacles.push(createObstacle());
        }
        
        return updatedObstacles;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, playerPosition, difficulty]);
  
  // Game loop - update collectibles
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const settings = getDifficultySettings();
    const interval = setInterval(() => {
      // Move collectibles and check collections
      setCollectibles(prevCollectibles => {
        // Move existing collectibles
        const updatedCollectibles = prevCollectibles
          .map(collectible => ({
            ...collectible,
            x: collectible.x - settings.obstacleSpeed
          }))
          .filter(collectible => {
            // Check if player collected this item
            const collected = 
              checkCollision(collectible.position, playerPosition) && 
              collectible.x < 130 && 
              collectible.x > 30;
            
            if (collected) {
              // Award points
              if (collectible.type === 'melatonin') {
                setScore(prev => prev + 50);
              } else {
                setScore(prev => prev + 25);
              }
              return false; // Remove collected item
            }
            
            // Keep if not collected and still on screen
            return collectible.x > -50;
          });
        
        // Add new collectible based on frequency
        if (Math.random() < settings.collectibleFrequency * 5) {
          updatedCollectibles.push(createCollectible());
        }
        
        return updatedCollectibles;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, playerPosition, difficulty, timeOfDay]);
  
  // Game background style based on time of day
  const getBackgroundStyle = () => {
    if (timeOfDay >= 5 && timeOfDay < 8) {
      // Sunrise
      return { background: 'linear-gradient(to bottom, #ff7e5f, #feb47b)' };
    } else if (timeOfDay >= 8 && timeOfDay < 18) {
      // Daytime
      return { background: 'linear-gradient(to bottom, #2196f3, #bbdefb)' };
    } else if (timeOfDay >= 18 && timeOfDay < 21) {
      // Sunset
      return { background: 'linear-gradient(to bottom, #ff9800, #ffeb3b)' };
    } else {
      // Night
      return { background: 'linear-gradient(to bottom, #1a237e, #303f9f)' };
    }
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };
  
  return (
    <div className="circadian-game">
      <h1>Circadian Rhythm Racer</h1>
      
      {showInstructions ? (
        <div className="game-instructions">
          <button className="back-button" onClick={handleBackToEducation}>
            <FaArrowLeft /> Back to Education
          </button>
          
          <h2>How to Play</h2>
          <p>
            Help your "Sleepy Cell" maintain a healthy sleep cycle by avoiding
            blue light and catching melatonin!
          </p>
          <ul>
            <li>Use <strong>arrow keys</strong> or tap the <strong>up/down buttons</strong> to move freely</li>
            <li>Avoid <strong>phones and laptops</strong> (they emit sleep-disrupting blue light)</li>
            <li>Collect <strong>melatonin drops</strong> (they appear at night and help you sleep)</li>
            <li>Catch <strong>sleep Zzz's</strong> for bonus points</li>
            <li>Notice how the sky changes throughout the day and night cycle!</li>
          </ul>
          
          <div className="difficulty-selection">
            <h3>Select Difficulty:</h3>
            <div className="difficulty-buttons">
              <button 
                className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`} 
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`} 
                onClick={() => handleDifficultyChange('medium')}
              >
                Medium
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`} 
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </button>
            </div>
          </div>
          
          <button 
            className="game-btn"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="game-over">
          <button className="back-button" onClick={handleBackToEducation}>
            <FaArrowLeft /> Back to Education
          </button>
          
          <h2>Game Over!</h2>
          <p>Your sleepy cell was disrupted by blue light!</p>
          <div className="score-display">Final Score: {score}</div>
          <div className="brain-fact">
            <p>
              <strong>Did you know?</strong> Blue light from screens can suppress melatonin 
              production and make it harder to fall asleep at night.
            </p>
          </div>
          
          <div className="difficulty-selection">
            <h3>Change Difficulty:</h3>
            <div className="difficulty-buttons">
              <button 
                className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`} 
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`} 
                onClick={() => handleDifficultyChange('medium')}
              >
                Medium
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`} 
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </button>
            </div>
          </div>
          
          <div className="game-buttons">
            <button 
              className="game-btn"
              onClick={startGame}
            >
              Play Again
            </button>
          </div>
        </div>
      ) : (
        <div className="game-running">
          <button className="back-button" onClick={handleBackToEducation}>
            <FaArrowLeft /> Back to Education
          </button>
          
          <div className="game-info">
            <div className="time-display">
              <span className="time-label">Time:</span>
              <span className="time-value">{getTimeDisplay()}</span>
            </div>
            <div className="score-value">Score: {score}</div>
            <div className="difficulty-display">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
          </div>
          
          <div className="game-controls">
            <button 
              className="control-btn up-btn" 
              onClick={movePlayerUp}
              aria-label="Move Up"
            >
              <FaArrowUp />
            </button>
            <button 
              className="control-btn down-btn" 
              onClick={movePlayerDown}
              aria-label="Move Down"
            >
              <FaArrowDown />
            </button>
          </div>
          
          <div className="game-frame" style={getBackgroundStyle()}>
            <div className="game-lane">
              <div 
                className="player"
                style={{ top: `${playerPosition}%` }}
              >
                😴
              </div>
              
              {obstacles.map(obstacle => (
                <div
                  key={obstacle.id}
                  className={`obstacle ${obstacle.type}`}
                  style={{ 
                    top: `${obstacle.position}%`, 
                    left: `${obstacle.x}px`
                  }}
                >
                  {obstacle.type === 'phone' ? <FaMobile /> : <FaLaptop />}
                </div>
              ))}
              
              {collectibles.map(collectible => (
                <div
                  key={collectible.id}
                  className={`collectible ${collectible.type}`}
                  style={{ 
                    top: `${collectible.position}%`, 
                    left: `${collectible.x}px`
                  }}
                >
                  {collectible.type === 'melatonin' ? <FaMoon /> : 'Z'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Default props in case the component is used without these props
CircadianRhythmRacer.defaultProps = {
  userId: null,
  userData: null,
  updateUserData: () => console.log("updateUserData function not provided"),
  onBackToEducation: () => console.log("onBackToEducation function not provided")
};

export default CircadianRhythmRacer; 