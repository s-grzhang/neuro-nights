import React, { useState, useRef, useEffect } from 'react';
import './RewardsPage.css';
import { FaStar, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const RewardsPage = ({ points, setPoints }) => { // Accept setPoints to update points
  const sciFiRef = useRef(null);
  const biographyRef = useRef(null);
  const romanceRef = useRef(null);

  const [purchasedChapters, setPurchasedChapters] = useState([]); // Store purchased chapters

  // Debug useEffect to verify points update
  useEffect(() => {
    console.log(`Points updated to: ${points}`);
  }, [points]);

  const sciFiBooks = [
    { id: 1, title: 'Chapter 1', points: 200, pdfPath: '/Pride_and_Prejudice_Chapter_1.pdf' },
    { id: 2, title: 'Chapter 2', points: 150, pdfPath: '/Pride_and_Prejudice_Chapter_2.pdf' },
    { id: 3, title: 'Chapter 3', points: 250, pdfPath: '/Pride_and_Prejudice_Chapter_3.pdf' },
  ];

  const scrollBooks = (direction, genre) => {
    let scrollAmount = 200;
    if (genre === 'sciFi') {
      sciFiRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    } else if (genre === 'biography') {
      biographyRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    } else if (genre === 'romance') {
      romanceRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const handlePurchase = (book) => {
    if (points >= book.points && !purchasedChapters.includes(book.id)) {
      setPoints(points - book.points); // Deduct points
      setPurchasedChapters([...purchasedChapters, book.id]); // Add to purchased chapters
      window.open(book.pdfPath, '_blank'); // Redirect to the chapter PDF
    } else if (points < book.points) {
      alert('Not enough points to purchase this chapter.');
    }
  };

  const isPurchased = (bookId) => purchasedChapters.includes(bookId);

  return (
    <div className="rewards-page">
      <h1>Rewards</h1>

      {/* Points display */}
      <div className="points-display">
        <p>You have <strong>{points}</strong> points <FaStar className="star-icon" /></p>
      </div>

      {/* Books section */}
      <div className="books-section">
        {/* Sci-Fi genre */}
        <div className="genre-section">
          <h2>Sci-Fi</h2>
          <FaArrowLeft
            className="arrow left-arrow"
            onClick={() => scrollBooks('left', 'sciFi')}
          />
          <div className="book-row" ref={sciFiRef}>
            {sciFiBooks.map((book) => (
              <div key={book.id} className="book-item">
                <div className="book-image"></div>
                <div className="book-info">
                  <p>{book.title}</p>
                  <div className="points-needed">
                    <p>{book.points} points</p>
                    <button
                      className="unlock-button"
                      disabled={isPurchased(book.id)} // Disable if already purchased
                      onClick={() => handlePurchase(book)}
                    >
                      {isPurchased(book.id) ? 'UNLOCKED' : 'UNLOCK NOW'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <FaArrowRight
            className="arrow right-arrow"
            onClick={() => scrollBooks('right', 'sciFi')}
          />
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
