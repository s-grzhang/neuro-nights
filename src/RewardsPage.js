import React, { useState, useRef, useEffect } from 'react';
import './RewardsPage.css';
import { FaStar, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { db } from './firebase'; // Import db (Firestore)
import { doc, setDoc, getDoc } from 'firebase/firestore';

const RewardsPage = ({ points, setPoints, userId }) => {
  const sciFiRef = useRef(null);
  const [purchasedChapters, setPurchasedChapters] = useState({});
  const books = {
    sciFi: [
      {
        id: 1,
        title: 'Iron Widow',
        chapters: [
          { id: '1-1', title: 'Chapter 1', points: 200, img: '/ironwidow_ch1.jpg', pdfPath: '/Iron_Widow_Chapter_1.pdf' },
          { id: '1-2', title: 'Chapter 2', points: 300, img: '/ironwidow_ch2.jpg', pdfPath: '/Iron_Widow_Chapter_2.pdf' },
          { id: '1-3', title: 'Chapter 3', points: 450, img: '/ironwidow_ch3.jpg', pdfPath: '/Iron_Widow_Chapter_3.pdf' },
        ],
      },
      {
        id: 2,
        title: 'Exodus',
        chapters: [
          { id: '2-1', title: 'Chapter 1', points: 220, img: '/exodus_ch1.jpg', pdfPath: '/Exodus_Chapter_1.pdf' },
          { id: '2-2', title: 'Chapter 2', points: 320, img: '/exodus_ch2.jpg', pdfPath: '/Exodus_Chapter_2.pdf' },
          { id: '2-3', title: 'Chapter 3', points: 470, img: '/exodus_ch3.jpg', pdfPath: '/Exodus_Chapter_3.pdf' },
        ],
      },
      {
        id: 3,
        title: 'Wind and Truth',
        chapters: [
          { id: '3-1', title: 'Chapter 1', points: 250, img: '/windtruth_ch1.jpg', pdfPath: '/Wind_and_Truth_Chapter_1.pdf' },
          { id: '3-2', title: 'Chapter 2', points: 350, img: '/windtruth_ch2.jpg', pdfPath: '/Wind_and_Truth_Chapter_2.pdf' },
          { id: '3-3', title: 'Chapter 3', points: 500, img: '/windtruth_ch3.jpg', pdfPath: '/Wind_and_Truth_Chapter_3.pdf' },
        ],
      },
    ],
  };
  

  useEffect(() => {
    const fetchUserProgress = async () => {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setPurchasedChapters(userSnap.data().purchasedChapters || {});
      }
    };
    fetchUserProgress();
  }, [userId]);

  const scrollBooks = (direction) => {
    sciFiRef.current.scrollLeft += direction === 'left' ? -200 : 200;
  };
  const handlePurchase = async (chapter) => {
    const [bookId, chapterNum] = chapter.id.split('-');
    const previousChapterId = `${bookId}-${parseInt(chapterNum) - 1}`;
  
    if (parseInt(chapterNum) > 1 && !purchasedChapters[previousChapterId]) {
      alert('You must unlock the previous chapter first!');
      return;
    }
  
    if (points >= chapter.points && !purchasedChapters[chapter.id]) {
      const updatedChapters = { ...purchasedChapters, [chapter.id]: true };
      setPurchasedChapters(updatedChapters);
      setPoints(points - chapter.points);
  
      await setDoc(doc(db, 'users', userId), { purchasedChapters: updatedChapters }, { merge: true });
      window.open(chapter.pdfPath, '_blank');
    } else {
      alert('Not enough points or chapter already unlocked.');
    }
  };
  

  return (
    <div className="rewards-page">
      <h1>Rewards</h1>
      <div className="points-display">
        <p>You have <strong>{points}</strong> points <FaStar className="star-icon" /></p>
      </div>
      <div className="books-section">
  <div className="genre-section">
    <h2>Sci-Fi</h2>
    <FaArrowLeft className="arrow left-arrow" onClick={() => scrollBooks('left')} />
    <div className="book-row" ref={sciFiRef}>
      {books.sciFi.map((book) => (
        <div key={book.id} className="book-container">
          <h3>{book.title}</h3>
          {book.chapters.map((chapter) => (
            <div key={chapter.id} className="book-item">
              <img src={chapter.img} alt={`${book.title} - ${chapter.title}`} className="book-image" />
              <div className="book-info">
                <p>{chapter.title}</p>
                <p>{chapter.points} points</p>
                <button
                  className="unlock-button"
                  disabled={purchasedChapters[chapter.id]}
                  onClick={() => handlePurchase(chapter)}
                >
                  {purchasedChapters[chapter.id] ? 'UNLOCKED' : 'UNLOCK NOW'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
    <FaArrowRight className="arrow right-arrow" onClick={() => scrollBooks('right')} />
  </div>
</div>

    </div>
  );
};

export default RewardsPage;
