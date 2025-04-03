import React, { useState, useRef, useEffect } from 'react';
import './RewardsPage.css';
import { FaStar, FaArrowRight, FaArrowLeft, FaLock, FaUnlock, FaBook } from 'react-icons/fa';
import { db } from './firebase'; // Import db (Firestore)
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Book cover colors for generated placeholders
const COVER_COLORS = {
  sciFi: ['#1a237e', '#0d47a1', '#01579b', '#006064'],
  fantasy: ['#4a148c', '#880e4f', '#b71c1c', '#3e2723'],
  mystery: ['#212121', '#263238', '#37474f', '#000000'],
  romance: ['#e91e63', '#ad1457', '#c2185b', '#d81b60']
};

const RewardsPage = ({ points, setPoints, userId }) => {
  // Refs for each genre slider
  const genreRefs = {
    sciFi: useRef(null),
    fantasy: useRef(null),
    mystery: useRef(null),
    romance: useRef(null)
  };
  
  const [purchasedChapters, setPurchasedChapters] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  
  // Generate a placeholder image URL for book covers
  const getPlaceholderCover = (genre, title, author) => {
    const index = title.length % COVER_COLORS[genre].length;
    const color = COVER_COLORS[genre][index];
    const encodedTitle = encodeURIComponent(title);
    const encodedAuthor = encodeURIComponent(author);
    return `https://via.placeholder.com/150x225/${color.replace('#', '')}/${title.length % 2 === 0 ? 'ffffff' : 'f5f5f5'}?text=${encodedTitle}`;
  };
  
  // Book catalog with multiple genres
  const books = {
    sciFi: [
      {
        id: 'sci-1',
        title: 'Iron Widow',
        coverImg: getPlaceholderCover('sciFi', 'Iron Widow', 'Xiran Jay Zhao'),
        author: 'Xiran Jay Zhao',
        description: 'Pacific Rim meets The Handmaid\'s Tale in this blend of Chinese history and mecha science fiction.',
        chapters: [
          { id: 'sci-1-1', title: 'Chapter 1: The Selection', points: 200, pdfPath: '/books/Iron_Widow_Chapter_1.pdf' },
          { id: 'sci-1-2', title: 'Chapter 2: The Chrysalis', points: 300, pdfPath: '/books/Iron_Widow_Chapter_2.pdf' },
          { id: 'sci-1-3', title: 'Chapter 3: The Transformation', points: 450, pdfPath: '/books/Iron_Widow_Chapter_3.pdf' },
        ],
      },
      {
        id: 'sci-2',
        title: 'Exodus',
        coverImg: getPlaceholderCover('sciFi', 'Exodus', 'Jen Mitchell'),
        author: 'Jen Mitchell',
        description: 'A thrilling tale of humanity\'s first interstellar colony and the secrets they discover.',
        chapters: [
          { id: 'sci-2-1', title: 'Chapter 1: Departure', points: 220, pdfPath: '/books/Exodus_Chapter_1.pdf' },
          { id: 'sci-2-2', title: 'Chapter 2: The Void', points: 320, pdfPath: '/books/Exodus_Chapter_2.pdf' },
          { id: 'sci-2-3', title: 'Chapter 3: New Earth', points: 470, pdfPath: '/books/Exodus_Chapter_3.pdf' },
        ],
      },
      {
        id: 'sci-3',
        title: 'Wind and Truth',
        coverImg: getPlaceholderCover('sciFi', 'Wind and Truth', 'Trevor Blake'),
        author: 'Trevor Blake',
        description: 'When AI achieves consciousness, one scientist must determine if it can be trusted.',
        chapters: [
          { id: 'sci-3-1', title: 'Chapter 1: Awakening', points: 250, pdfPath: '/books/Wind_and_Truth_Chapter_1.pdf' },
          { id: 'sci-3-2', title: 'Chapter 2: Consciousness', points: 350, pdfPath: '/books/Wind_and_Truth_Chapter_2.pdf' },
          { id: 'sci-3-3', title: 'Chapter 3: Symbiosis', points: 500, pdfPath: '/books/Wind_and_Truth_Chapter_3.pdf' },
        ],
      },
    ],
    fantasy: [
      {
        id: 'fan-1',
        title: 'The Shadow Crown',
        coverImg: getPlaceholderCover('fantasy', 'The Shadow Crown', 'Elise Morgan'),
        author: 'Elise Morgan',
        description: 'A young heir discovers her magical bloodline and must reclaim her throne from a usurper.',
        chapters: [
          { id: 'fan-1-1', title: 'Chapter 1: Hidden Heritage', points: 180, pdfPath: '/books/Shadow_Crown_Chapter_1.pdf' },
          { id: 'fan-1-2', title: 'Chapter 2: The Awakening', points: 280, pdfPath: '/books/Shadow_Crown_Chapter_2.pdf' },
          { id: 'fan-1-3', title: 'Chapter 3: First Battle', points: 420, pdfPath: '/books/Shadow_Crown_Chapter_3.pdf' },
        ],
      },
      {
        id: 'fan-2',
        title: 'Dragon Rider',
        coverImg: getPlaceholderCover('fantasy', 'Dragon Rider', 'Marcus Wilder'),
        author: 'Marcus Wilder',
        description: 'In a world where dragons and humans live in conflict, one rider forges an unexpected bond.',
        chapters: [
          { id: 'fan-2-1', title: 'Chapter 1: The Egg', points: 210, pdfPath: '/books/Dragon_Rider_Chapter_1.pdf' },
          { id: 'fan-2-2', title: 'Chapter 2: Hatching', points: 310, pdfPath: '/books/Dragon_Rider_Chapter_2.pdf' },
          { id: 'fan-2-3', title: 'Chapter 3: First Flight', points: 440, pdfPath: '/books/Dragon_Rider_Chapter_3.pdf' },
        ],
      },
    ],
    mystery: [
      {
        id: 'mys-1',
        title: 'The Silent Witness',
        coverImg: getPlaceholderCover('mystery', 'The Silent Witness', 'Claire Nightingale'),
        author: 'Claire Nightingale',
        description: 'A detective and a deaf witness must work together to catch a calculating killer.',
        chapters: [
          { id: 'mys-1-1', title: 'Chapter 1: The Crime Scene', points: 190, pdfPath: '/books/Silent_Witness_Chapter_1.pdf' },
          { id: 'mys-1-2', title: 'Chapter 2: The Connection', points: 290, pdfPath: '/books/Silent_Witness_Chapter_2.pdf' },
          { id: 'mys-1-3', title: 'Chapter 3: The Chase', points: 430, pdfPath: '/books/Silent_Witness_Chapter_3.pdf' },
        ],
      },
      {
        id: 'mys-2',
        title: 'Cold Case',
        coverImg: getPlaceholderCover('mystery', 'Cold Case', 'Daniel West'),
        author: 'Daniel West',
        description: 'A rookie investigator reopens a decades-old murder that shakes the foundation of a small town.',
        chapters: [
          { id: 'mys-2-1', title: 'Chapter 1: The File', points: 220, pdfPath: '/books/Cold_Case_Chapter_1.pdf' },
          { id: 'mys-2-2', title: 'Chapter 2: Old Wounds', points: 330, pdfPath: '/books/Cold_Case_Chapter_2.pdf' },
          { id: 'mys-2-3', title: 'Chapter 3: Revelations', points: 450, pdfPath: '/books/Cold_Case_Chapter_3.pdf' },
        ],
      },
    ],
    romance: [
      {
        id: 'rom-1',
        title: 'Love and Lattes',
        coverImg: getPlaceholderCover('romance', 'Love and Lattes', 'Sophia Chen'),
        author: 'Sophia Chen',
        description: 'A coffee shop romance that proves love can be found in the most unexpected encounters.',
        chapters: [
          { id: 'rom-1-1', title: 'Chapter 1: The First Cup', points: 170, pdfPath: '/books/Love_Lattes_Chapter_1.pdf' },
          { id: 'rom-1-2', title: 'Chapter 2: Bitter Sweet', points: 260, pdfPath: '/books/Love_Lattes_Chapter_2.pdf' },
          { id: 'rom-1-3', title: 'Chapter 3: Perfect Blend', points: 400, pdfPath: '/books/Love_Lattes_Chapter_3.pdf' },
        ],
      },
      {
        id: 'rom-2',
        title: 'Across the Stars',
        coverImg: getPlaceholderCover('romance', 'Across the Stars', 'Liam Johnson'),
        author: 'Liam Johnson',
        description: 'A sci-fi romance between an astronaut and mission control during a dangerous space mission.',
        chapters: [
          { id: 'rom-2-1', title: 'Chapter 1: The Launch', points: 200, pdfPath: '/books/Across_Stars_Chapter_1.pdf' },
          { id: 'rom-2-2', title: 'Chapter 2: Distant Voices', points: 300, pdfPath: '/books/Across_Stars_Chapter_2.pdf' },
          { id: 'rom-2-3', title: 'Chapter 3: Coming Home', points: 460, pdfPath: '/books/Across_Stars_Chapter_3.pdf' },
        ],
      },
    ]
  };

  // Fetch user's purchased chapters on component mount
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!userId) {
        setError("Please log in to access your rewards.");
        return;
      }
      
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setPurchasedChapters(userSnap.data().purchasedChapters || {});
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, { purchasedChapters: {}, points: points || 0 });
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
        setError("Failed to load your reading progress. Please try again later.");
      }
    };
    
    if (userId) {
      fetchUserProgress();
    }
  }, [userId, points]);

  // Handle scrolling for genre sliders
  const scrollGenre = (genre, direction) => {
    if (genreRefs[genre] && genreRefs[genre].current) {
      genreRefs[genre].current.scrollLeft += direction === 'left' ? -250 : 250;
    }
  };

  // Handle opening book details
  const openBookDetails = (book) => {
    setSelectedBook(book);
  };

  // Handle closing book details
  const closeBookDetails = () => {
    setSelectedBook(null);
  };

  // Handle chapter purchase
  const handlePurchaseChapter = async (chapter) => {
    if (!userId) {
      setError("Please log in to access your rewards.");
      return;
    }
    
    const [bookId, chapterNum] = chapter.id.split('-').slice(0, 3);
    const bookGenreId = `${bookId}-${chapterNum}`;
    const previousChapterId = `${bookId}-${chapterNum}-${parseInt(chapterNum.slice(-1)) - 1}`;
    
    // Check if previous chapter is purchased (if not first chapter)
    if (parseInt(chapterNum.slice(-1)) > 1 && !purchasedChapters[previousChapterId]) {
      setError("You must unlock the previous chapter first!");
      return;
    }
    
    // Check if enough points and chapter not already purchased
    if (points >= chapter.points && !purchasedChapters[chapter.id]) {
      try {
        // Update local state
        const updatedChapters = { ...purchasedChapters, [chapter.id]: true };
        setPurchasedChapters(updatedChapters);
        setPoints(points - chapter.points);
        
        // Update Firestore
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { 
          purchasedChapters: updatedChapters,
          points: points - chapter.points 
        }, { merge: true });
        
        // Open the chapter (in production this would navigate to a reader or open PDF)
        alert(`Successfully unlocked: ${chapter.title}`);
        // In a real app, you might navigate to a reader component:
        // window.open(chapter.pdfPath, '_blank');
      } catch (error) {
        console.error("Error purchasing chapter:", error);
        setError("Failed to purchase chapter. Please try again.");
      }
    } else if (purchasedChapters[chapter.id]) {
      // Open the already purchased chapter
      alert(`Reading: ${chapter.title}`);
      // window.open(chapter.pdfPath, '_blank');
    } else {
      setError(`Not enough points! You need ${chapter.points} points to unlock this chapter.`);
    }
  };

  // Render book detail view when a book is selected
  const renderBookDetails = () => {
    if (!selectedBook) return null;
    
    return (
      <div className="book-detail-overlay">
        <div className="book-detail-content">
          <button className="close-button" onClick={closeBookDetails}>×</button>
          
          <div className="book-detail-header">
            <div className="book-cover">
              <img 
                src={selectedBook.coverImg} 
                alt={selectedBook.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150x225?text=Cover";
                }}
              />
            </div>
            <div className="book-info">
              <h2>{selectedBook.title}</h2>
              <p className="book-author">by {selectedBook.author}</p>
              <p className="book-description">{selectedBook.description}</p>
            </div>
          </div>
          
          <div className="chapters-list">
            <h3>Chapters</h3>
            {selectedBook.chapters.map((chapter, index) => (
              <div 
                key={chapter.id} 
                className={`chapter-item ${purchasedChapters[chapter.id] ? 'purchased' : ''}`}
              >
                <div className="chapter-info">
                  <span className="chapter-title">{chapter.title}</span>
                  <span className="chapter-points">{chapter.points} <FaStar className="star-icon" /></span>
                </div>
                <button 
                  className={`chapter-button ${purchasedChapters[chapter.id] ? 'read' : 'unlock'}`}
                  onClick={() => handlePurchaseChapter(chapter)}
                  disabled={index > 0 && !purchasedChapters[selectedBook.chapters[index-1].id] && !purchasedChapters[chapter.id]}
                >
                  {purchasedChapters[chapter.id] ? (
                    <>
                      <FaBook /> Read
                    </>
                  ) : (
                    <>
                      {index > 0 && !purchasedChapters[selectedBook.chapters[index-1].id] ? (
                        <FaLock />
                      ) : (
                        <FaUnlock />
                      )} 
                      Unlock
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rewards-page">
      <h1>Book Rewards</h1>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="points-display">
        <p>You have <strong>{points}</strong> points <FaStar className="star-icon" /></p>
        <p className="point-explanation">Earn points by completing goals and educational games!</p>
      </div>

      {/* Render each genre section */}
      {Object.keys(books).map((genre) => (
        <div className="genre-section" key={genre}>
          <h2>{genre === 'sciFi' ? 'Science Fiction' : 
               genre === 'mystery' ? 'Mystery & Thriller' : 
               genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
          
          <div className="slider-container">
            <FaArrowLeft 
              className="arrow left-arrow" 
              onClick={() => scrollGenre(genre, 'left')} 
            />
            
            <div className="books-slider" ref={genreRefs[genre]}>
              {books[genre].map((book) => (
                <div 
                  key={book.id} 
                  className="book-cover-container"
                  onClick={() => openBookDetails(book)}
                >
                  <div className="book-cover">
                    <img 
                      src={book.coverImg} 
                      alt={book.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150x225?text=Cover";
                      }}
                    />
                  </div>
                  <div className="book-title">{book.title}</div>
                  <div className="book-author">{book.author}</div>
                </div>
              ))}
            </div>
            
            <FaArrowRight 
              className="arrow right-arrow" 
              onClick={() => scrollGenre(genre, 'right')} 
            />
          </div>
        </div>
      ))}
      
      {/* Book details overlay */}
      {renderBookDetails()}
    </div>
  );
};

export default RewardsPage;
