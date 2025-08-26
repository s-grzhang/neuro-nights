import React, { useState, useEffect } from 'react';
import './BrainBuilder.css';
import { FaArrowLeft } from 'react-icons/fa';

const BrainBuilder = ({ onBackToEducation }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Handle back to education page
  const handleBackToEducation = () => {
    if (typeof onBackToEducation === 'function') {
      onBackToEducation();
    }
  };
  
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
  useEffect(() => {
    initializeGame();
  }, []);

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedIndexes.length === 2) {
      const [firstIndex, secondIndex] = flippedIndexes;
      
      if (cards[firstIndex].pair === cards[secondIndex].pair) {
        // Match found
        setMatchedPairs([...matchedPairs, cards[firstIndex].pair]);
      }
      
      // Reset flipped cards after a delay
      const timer = setTimeout(() => {
        setFlippedIndexes([]);
        setMoves(moves + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [flippedIndexes, cards, matchedPairs, moves]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs.length === cardData.length / 2 && matchedPairs.length > 0) {
      const timer = setTimeout(() => {
        setGameOver(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [matchedPairs, cardData.length]);

  const initializeGame = () => {
    // Reset game state
    setFlippedIndexes([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameOver(false);
    
    // Shuffle cards
    const shuffledCards = [...cardData].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const handleCardClick = (index) => {
    // Prevent clicking if two cards are already flipped or the card is already matched
    if (
      flippedIndexes.length === 2 || 
      flippedIndexes.includes(index) || 
      matchedPairs.includes(cards[index].pair)
    ) {
      return;
    }
    
    setFlippedIndexes([...flippedIndexes, index]);
  };

  const isCardFlipped = (index) => {
    return flippedIndexes.includes(index) || matchedPairs.includes(cards[index].pair);
  };

  const getCardClass = (card, index) => {
    let className = 'memory-card';
    
    if (card.type === 'part') {
      className += ' brain-part';
    } else {
      className += ' brain-function';
    }
    
    if (isCardFlipped(index)) {
      className += ' flipped';
    }
    
    if (matchedPairs.includes(card.pair)) {
      className += ' matched';
    }
    
    return className;
  };

  return (
    <div className="brain-builder-game">
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
                className={getCardClass(card, index)}
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
  onBackToEducation: () => console.log("onBackToEducation function not provided")
};

export default BrainBuilder; 