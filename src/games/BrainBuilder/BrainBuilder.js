import React, { useState, useEffect } from 'react';
import './BrainBuilder.css';
import { FaArrowLeft } from 'react-icons/fa';
import { updateUserPoints } from '../../firebase';

const BrainBuilder = ({ userId, userData, updateUserData, onBackToEducation }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [canClick, setCanClick] = useState(true);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  // Determine if user is authenticated
  const isAuthenticated = Boolean(userId && userData);
  
  // Card data with brain parts and their functions
  const cardData = [
    { id: 1, type: 'part', content: 'Hippocampus', pair: 1 },
    { id: 2, type: 'function', content: 'Stores new memories during sleep', pair: 1 },
    { id: 3, type: 'part', content: 'Prefrontal Cortex', pair: 2 },
    { id: 4, type: 'function', content: 'Helps with decision making and focus', pair: 2 },
    { id: 5, type: 'part', content: 'Cerebellum', pair: 3 },
    { id: 6, type: 'function', content: 'Coordinates movements and motor learning', pair: 3 },
    { id: 7, type: 'part', content: 'Amygdala', pair: 4 },
    { id: 8, type: 'function', content: 'Processes emotional memories while you sleep', pair: 4 },
    { id: 9, type: 'part', content: 'Thalamus', pair: 5 },
    { id: 10, type: 'function', content: 'Relays sensory signals and regulates sleep', pair: 5 },
    { id: 11, type: 'part', content: 'Pineal Gland', pair: 6 },
    { id: 12, type: 'function', content: 'Produces melatonin to help you fall asleep', pair: 6 },
  ];

  // Initialize game
  const initializeGame = () => {
    // Add debug logs for authentication
    console.log('BrainBuilder - Auth Status (Complete):', { 
      isAuthenticated, 
      userId: userId ? userId : 'null or undefined',
      userDataExists: !!userData,
      userPointsValue: userData?.points,
      updateUserDataFunction: typeof updateUserData === 'function' ? 'exists' : 'missing'
    });
    
    // If user is not authenticated, show a browser alert
    if (!isAuthenticated) {
      console.warn('BrainBuilder: User is not authenticated - points will not be saved');
    }
    
    setFlippedIndexes([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameOver(false);
    setCanClick(true);
    setPointsAwarded(false);
    
    // Shuffle cards
    const shuffledCards = [...cardData].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    console.log("Game initialized");
  };

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Check for game completion and award points
  useEffect(() => {
    if (matchedPairs.length === cardData.length / 2 && matchedPairs.length > 0) {
      console.log('Game completed! Matched pairs:', matchedPairs.length, 'Total pairs:', cardData.length / 2);
      
      setTimeout(() => {
        setGameOver(true);
        
        // Award points if not already awarded and we have a user ID
        if (!pointsAwarded && isAuthenticated && userId) {
          const pointsToAward = 200;
          console.log(`Attempting to award ${pointsToAward} points to user:`, { 
            userId, 
            currentPoints: userData?.points,
            isAuthenticated,
            pointsAwarded
          });
          
          try {
            // Update local user data
            const newPoints = (userData?.points || 0) + pointsToAward;
            console.log('Updating local state with new points:', newPoints);
            updateUserData({ points: newPoints });
            
            // Update Firestore
            console.log('Calling updateUserPoints with:', { userId, pointsToAward });
            updateUserPoints(userId, pointsToAward)
              .then(() => {
                console.log(`Successfully awarded ${pointsToAward} points to Firestore`);
                setPointsAwarded(true);
              })
              .catch(error => {
                console.error("Error awarding points to Firestore:", error);
              });
          } catch (error) {
            console.error("Exception during points update:", error);
          }
        } else {
          console.log('Not awarding points because:', {
            pointsAlreadyAwarded: pointsAwarded,
            isAuthenticated,
            hasUserId: !!userId
          });
        }
      }, 1000);
    }
  }, [matchedPairs, cardData.length, pointsAwarded, userId, userData, updateUserData, isAuthenticated]);

  const handleCardClick = (index) => {
    // Simple debug logging
    console.log(`Card ${index} clicked. Can click: ${canClick}, Current flipped: ${flippedIndexes.join(', ')}`);
    
    // Don't allow clicking if:
    // 1. We're currently in the evaluation phase (canClick is false)
    // 2. Card is already flipped
    // 3. Card is already matched
    if (!canClick || 
        flippedIndexes.includes(index) || 
        matchedPairs.includes(cards[index]?.pair)) {
      return;
    }
    
    // If we already have one card flipped
    if (flippedIndexes.length === 1) {
      // Add this card to flipped cards
      const newFlippedIndexes = [...flippedIndexes, index];
      setFlippedIndexes(newFlippedIndexes);
      
      // Disable clicking until evaluation is complete
      setCanClick(false);
      
      // Get the first and second card
      const firstCardIndex = newFlippedIndexes[0];
      const secondCardIndex = newFlippedIndexes[1];
      
      // Check if they match
      const isMatch = cards[firstCardIndex]?.pair === cards[secondCardIndex]?.pair;
      console.log(`Checking match: ${isMatch ? 'Match found!' : 'No match'}`);
      
      // Set timeout to handle the result (with a delay for viewing the cards)
      setTimeout(() => {
        // If they match, add to matches
        if (isMatch) {
          setMatchedPairs([...matchedPairs, cards[firstCardIndex].pair]);
        }
        
        // Clear flipped cards
        setFlippedIndexes([]);
        
        // Increment moves counter
        setMoves(moves + 1);
        
        // Re-enable clicking
        setCanClick(true);
      }, 1000);
    } else {
      // This is the first card being flipped
      setFlippedIndexes([index]);
    }
  };

  // Handle going back to education page
  const handleBackToEducation = () => {
    if (typeof onBackToEducation === 'function') {
      onBackToEducation();
    }
  };

  // Debug function to manually test points awarding
  const testAwardPoints = () => {
    if (!isAuthenticated || !userId) {
      console.error("Cannot test points: User not authenticated");
      return;
    }
    
    const testPoints = 10;
    console.log(`DEBUG: Manually awarding ${testPoints} points to user ${userId}`);
    
    // Update local user data
    const newPoints = (userData?.points || 0) + testPoints;
    updateUserData({ points: newPoints });
    
    // Update Firestore
    updateUserPoints(userId, testPoints)
      .then(() => {
        console.log(`DEBUG: Successfully awarded ${testPoints} test points to Firestore`);
        alert(`Successfully awarded ${testPoints} test points!`);
      })
      .catch(error => {
        console.error("DEBUG: Error awarding test points:", error);
        alert(`Error awarding points: ${error.message}`);
      });
  };
  
  // Debug mode toggle - accessible by clicking the title 5 times
  const handleTitleClick = () => {
    if (!debugMode) {
      const debugClickHandler = () => {
        setDebugMode(true);
        console.log("DEBUG MODE ACTIVATED");
        document.removeEventListener('keydown', debugClickHandler);
      };
      
      // Press D+E+B+U+G keys in sequence to enable debug mode
      let keySequence = [];
      document.addEventListener('keydown', (e) => {
        keySequence.push(e.key.toLowerCase());
        if (keySequence.length > 5) keySequence.shift();
        
        if (keySequence.join('') === 'debug') {
          debugClickHandler();
        }
      });
    }
  };

  return (
    <div className="brain-builder-game">
      {debugMode && (
        <div className="debug-panel" style={{ 
          padding: '10px', 
          background: '#ffe0e0', 
          border: '1px solid red',
          margin: '10px'
        }}>
          <h4>Debug Panel</h4>
          <p>User ID: {userId || 'Not authenticated'}</p>
          <p>Current Points: {userData?.points || 0}</p>
          <button 
            onClick={testAwardPoints}
            style={{ padding: '5px 10px', background: '#ff9090', cursor: 'pointer' }}
          >
            Test Award Points (10)
          </button>
        </div>
      )}
      
      <h2 onClick={handleTitleClick}>Brain Builder</h2>
      
      {showInstructions ? (
        <div className="game-instructions">
          <button className="back-button" onClick={handleBackToEducation}>
            <FaArrowLeft /> Back to Education
          </button>
          
          <h2>Match Brain Parts with Their Sleep Functions!</h2>
          <p>
            Your brain is busy while you sleep! Flip these cards to match each brain part with what it does during sleep.
          </p>
          <ul>
            <li>Click on any card to flip it over</li>
            <li>Try to remember where each brain part and function is located</li>
            <li>Match all pairs to complete the game</li>
            <li>Fewer moves = higher score!</li>
            <li>Complete the game to earn 200 points!</li>
          </ul>
          <button 
            className="game-btn"
            onClick={() => setShowInstructions(false)}
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="game-over">
          <button className="back-button" onClick={handleBackToEducation}>
            <FaArrowLeft /> Back to Education
          </button>
          
          <h2>Great Job! 🎉</h2>
          <p>You completed the game in {moves} moves!</p>
          <div className="score-display">
            {moves <= 8 ? 'Excellent Memory! 🧠✨' : moves <= 12 ? 'Good Job! 🧠' : 'Well Done! 👍'}
          </div>
          <p>Now you know how different parts of your brain work during sleep!</p>
          <div className="brain-fact">
            <p>
              <strong>Did you know?</strong> Your brain cleans itself during sleep! 
              Special cells remove toxins that build up during the day.
            </p>
          </div>
          <div className="points-awarded">
            <p>
              <strong>You earned 200 points!</strong> 🌟
            </p>
          </div>
          <div className="game-buttons">
            <button 
              className="game-btn"
              onClick={initializeGame}
            >
              Play Again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="game-header">
            <button className="back-button" onClick={handleBackToEducation}>
              <FaArrowLeft /> Back to Education
            </button>
            <h2>Brain Builder</h2>
            <p>Moves: {moves} | Pairs Matched: {matchedPairs.length} of {cardData.length / 2}</p>
          </div>
          
          <div className="memory-board">
            {cards.map((card, index) => (
              <div 
                key={card.id}
                className={`memory-card ${card.type === 'part' ? 'brain-part' : 'brain-function'} 
                           ${flippedIndexes.includes(index) || matchedPairs.includes(card.pair) ? 'flipped' : ''} 
                           ${matchedPairs.includes(card.pair) ? 'matched' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <span>?</span>
                  </div>
                  <div className="card-back">
                    <span>{card.content}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="game-footer">
            <button 
              className="game-btn"
              onClick={initializeGame}
            >
              Restart Game
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Default props in case the component is used without these props
BrainBuilder.defaultProps = {
  userId: null,
  userData: null,
  updateUserData: () => console.log("updateUserData function not provided"),
  onBackToEducation: () => console.log("onBackToEducation function not provided")
};

export default BrainBuilder;
