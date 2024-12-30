import React, { useRef } from 'react';
import './RewardsPage.css'; // Assume you'll style it here
import { FaStar, FaArrowRight, FaArrowLeft } from 'react-icons/fa'; // Icons for the star and arrows

const RewardsPage = () => {
  const sciFiRef = useRef(null);
  const biographyRef = useRef(null);
  const romanceRef = useRef(null);

  // Sample data for books, with points required
  const sciFiBooks = [
    { title: 'Chapter 1', points: 200 },
    { title: 'Chapter 1', points: 150 },
    { title: 'Chapter 1', points: 250 },
    { title: 'Chapter 1', points: 300 },
    { title: 'Chapter 1', points: 300 },
    { title: 'Chapter 1', points: 300 }
  ];
  const biographyBooks = [
    { title: 'Chapter 1', points: 100 },
    { title: 'Chapter 1', points: 175 },
    { title: 'Chapter 1', points: 200 },
    { title: 'Chapter 1', points: 300 },
    { title: 'Chapter 1', points: 300 },
    { title: 'Chapter 1', points: 300 }
  ];
  const romanceBooks = [
    { title: 'Chapter 1', points: 150 },
    { title: 'Chapter 1', points: 250 },
    { title: 'Chapter 1', points: 100 },
    { title: 'Chapter 1', points: 200 },
    { title: 'Chapter 1', points: 300 },
    { title: 'Chapter 1', points: 300 }
  ];

  // Scroll handling for book rows
  const scrollBooks = (direction, genre) => {
    let scrollAmount = 200; // Adjust the scroll amount

    if (genre === 'sciFi') {
      sciFiRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    } else if (genre === 'biography') {
      biographyRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    } else if (genre === 'romance') {
      romanceRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  return (
    <div className="rewards-page">
      <h1>Rewards</h1>

      {/* Points display */}
      <div className="points-display">
        <p>You have <strong>100</strong> points <FaStar className="star-icon" />
        </p>
      </div>

      {/* Earn more button */}
      <button className="earn-more-button">EARN MORE</button>

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
            {sciFiBooks.map((book, index) => (
              <div key={index} className="book-item">
                <div className="book-image"></div>
                <div className="book-info">
                  <p>{book.title}</p>
                  <div className="points-needed">
                    <p>{book.points} points</p>
                    <button className="unlock-button">UNLOCK NOW</button>
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

        {/* Biography genre */}
        <div className="genre-section">
          <h2>Biography</h2>
            <FaArrowLeft
              className="arrow left-arrow"
              onClick={() => scrollBooks('left', 'biography')}
            />
            <div className="book-row" ref={biographyRef}>
            {biographyBooks.map((book, index) => (
              <div key={index} className="book-item">
                <div className="book-image"></div>
                <div className="book-info">
                  <p>{book.title}</p>
                  <div className="points-needed">
                    <p>{book.points} points</p>
                    <button className="unlock-button">UNLOCK NOW</button>
                  </div>
                </div>
              </div>
            ))}
            </div>
            <FaArrowRight
              className="arrow right-arrow"
              onClick={() => scrollBooks('right', 'biography')}
            />
        </div>

        {/* Romance genre */}
        <div className="genre-section">
          <h2>Romance</h2>
            <FaArrowLeft
              className="arrow left-arrow"
              onClick={() => scrollBooks('left', 'romance')}
            />
            <div className="book-row" ref={romanceRef}>
            {romanceBooks.map((book, index) => (
              <div key={index} className="book-item">
                <div className="book-image"></div>
                <div className="book-info">
                  <p>{book.title}</p>
                  <div className="points-needed">
                    <p>{book.points} points</p>
                    <button className="unlock-button">UNLOCK NOW</button>
                  </div>
                </div>
              </div>
            ))}</div>
            <FaArrowRight
              className="arrow right-arrow"
              onClick={() => scrollBooks('right', 'romance')}
            />
          </div>
        </div>
      </div>
  );
};

export default RewardsPage;
