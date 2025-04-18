import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import './RewardsPage.css';
import { FaStar, FaArrowRight, FaArrowLeft, FaLock, FaUnlock, FaBook } from 'react-icons/fa';
import { fetchUserData, purchaseChapter } from './utils/firebaseUtils';
import { fetchGenreBooks } from './utils/openLibraryAPI';
import BookReader from './components/BookReader';

// Book cover colors for fallback generated placeholders
const COVER_COLORS = {
  sciFi: ['#1a237e', '#0d47a1', '#01579b', '#006064'],
  fantasy: ['#4a148c', '#880e4f', '#b71c1c', '#3e2723'],
  mystery: ['#212121', '#263238', '#37474f', '#000000'],
  non_fiction: ['#1b5e20', '#2e7d32', '#388e3c', '#43a047']
};

const RewardsPage = ({ points, setPoints, userId }) => {
  // Refs for each genre slider
  const genreRefs = useRef({});
  const genreSectionRefs = useRef({});
  
  const [purchasedChapters, setPurchasedChapters] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState({});
  const [loadedGenres, setLoadedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readingBook, setReadingBook] = useState(null);
  
  // Generate a placeholder image URL for book covers
  const getPlaceholderCover = useCallback((genre, title) => {
    const index = title.length % COVER_COLORS[genre].length;
    const color = COVER_COLORS[genre][index];
    const encodedTitle = encodeURIComponent(title);
    return `https://via.placeholder.com/150x225/${color.replace('#', '')}/${title.length % 2 === 0 ? 'ffffff' : 'f5f5f5'}?text=${encodedTitle}`;
  }, []);

  // Fetch user's purchased chapters on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setError("Please log in to access your rewards.");
        return;
      }
      
      try {
        const userData = await fetchUserData(userId);
        setPurchasedChapters(userData.purchasedChapters || {});
        if (userData.points !== undefined && setPoints) {
          setPoints(userData.points);
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
        setError("Failed to load your reading progress. Please try again later.");
      }
    };
    
    if (userId) {
      loadUserData();
    }
  }, [userId, setPoints]);

  // Load initial genre list
  useEffect(() => {
    const initializeGenres = () => {
      setIsLoading(true);
      // Define our genres
      const genres = ['sciFi', 'fantasy', 'mystery', 'non_fiction'];
      setBooks({ genreList: genres });
      setIsLoading(false);
    };
    
    initializeGenres();
  }, []);

  // Set up intersection observer for lazy loading genre sections
  useEffect(() => {
    if (!books.genreList) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const genre = entry.target.dataset.genre;
          if (genre && !loadedGenres.includes(genre)) {
            loadGenre(genre);
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe each genre section
    books.genreList.forEach(genre => {
      if (genreSectionRefs.current[genre]) {
        observer.observe(genreSectionRefs.current[genre]);
      }
    });
    
    return () => {
      observer.disconnect();
    };
  }, [books.genreList, loadedGenres]);

  // Load books for a specific genre using Open Library API
  const loadGenre = useCallback(async (genre) => {
    if (loadedGenres.includes(genre)) return;
    
    try {
      // Fetch books from Open Library API
      const genreBooks = await fetchGenreBooks(genre);
      
      // Update books state with new genre data
      setBooks(prevBooks => ({
        ...prevBooks,
        [genre]: genreBooks
      }));
      
      // Mark this genre as loaded
      setLoadedGenres(prev => [...prev, genre]);
    } catch (error) {
      console.error(`Error loading ${genre} books:`, error);
    }
  }, [loadedGenres]);

  // Handle scrolling for genre sliders
  const scrollGenre = useCallback((genre, direction) => {
    if (genreRefs.current[genre]) {
      genreRefs.current[genre].scrollLeft += direction === 'left' ? -250 : 250;
    }
  }, []);

  // Handle opening book details
  const openBookDetails = useCallback((book) => {
    setSelectedBook(book);
  }, []);

  // Handle closing book details
  const closeBookDetails = useCallback(() => {
    setSelectedBook(null);
  }, []);

  // Start reading a book
  const startReading = useCallback((book, chapter) => {
    setReadingBook({
      title: book.title,
      url: book.readUrl,
      chapter: chapter.title
    });
  }, []);

  // Close book reader
  const closeReader = useCallback(() => {
    setReadingBook(null);
  }, []);

  // Handle chapter purchase
  const handlePurchaseChapter = useCallback(async (book, chapter) => {
    if (!userId) {
      setError("Please log in to access your rewards.");
      return;
    }
    
    const [bookId, chapterNum] = chapter.id.split('-').slice(0, 3);
    const previousChapterId = `${bookId}-${chapterNum}-${parseInt(chapterNum.slice(-1)) - 1}`;
    
    // Check if previous chapter is purchased (if not first chapter)
    if (parseInt(chapterNum.slice(-1)) > 1 && !purchasedChapters[previousChapterId]) {
      setError("You must unlock the previous chapter first!");
      return;
    }
    
    // Check if chapter is already purchased
    if (purchasedChapters[chapter.id]) {
      // Open the already purchased chapter
      startReading(book, chapter);
      return;
    }
    
    // Try to purchase the chapter
    try {
      const result = await purchaseChapter(userId, chapter, purchasedChapters, points);
      setPurchasedChapters(result.purchasedChapters);
      setPoints(result.points);
      startReading(book, chapter);
    } catch (error) {
      console.error("Error purchasing chapter:", error);
      setError(error.message || "Failed to purchase chapter. Please try again.");
    }
  }, [userId, purchasedChapters, points, setPoints, startReading]);

  // Render a single book item
  const renderBookItem = useCallback((book, genre) => (
    <div 
      key={book.id} 
      className="book-cover-container"
      onClick={() => openBookDetails(book)}
    >
      <div className="book-cover">
        <img 
          src={book.coverImg || getPlaceholderCover(genre, book.title)}
          alt={book.title}
          loading="lazy" // Add lazy loading for images
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getPlaceholderCover(genre, book.title);
          }}
        />
      </div>
      <div className="book-title">{book.title}</div>
      <div className="book-author">{book.author}</div>
    </div>
  ), [openBookDetails, getPlaceholderCover]);

  // Render genre section with lazy loading
  const renderGenreSection = useCallback((genre) => {
    const genreLoaded = loadedGenres.includes(genre);
    const genreBooks = books[genre] || [];
    
    return (
      <div 
        className="genre-section" 
        key={genre}
        ref={el => genreSectionRefs.current[genre] = el}
        data-genre={genre}
      >
        <h2>{genre === 'sciFi' ? 'Science Fiction' : 
             genre === 'mystery' ? 'Mystery & Thriller' : 
             genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
        
        <div className="slider-container">
          <FaArrowLeft 
            className="arrow left-arrow" 
            onClick={() => scrollGenre(genre, 'left')} 
          />
          
          <div 
            className="books-slider" 
            ref={el => genreRefs.current[genre] = el}
          >
            {!genreLoaded ? (
              // Display loading skeletons while loading
              Array(3).fill().map((_, i) => (
                <div key={i} className="book-cover-container skeleton">
                  <div className="book-cover skeleton-cover"></div>
                  <div className="book-title skeleton-text"></div>
                  <div className="book-author skeleton-text"></div>
                </div>
              ))
            ) : genreBooks.length > 0 ? (
              genreBooks.map(book => renderBookItem(book, genre))
            ) : (
              <p className="no-books-message">No books found for this genre</p>
            )}
          </div>
          
          <FaArrowRight 
            className="arrow right-arrow" 
            onClick={() => scrollGenre(genre, 'right')} 
          />
        </div>
      </div>
    );
  }, [books, loadedGenres, renderBookItem, scrollGenre]);

  // Render book detail view when a book is selected
  const renderBookDetails = useCallback(() => {
    if (!selectedBook) return null;
    
    return (
      <div className="book-detail-overlay">
        <div className="book-detail-content">
          <button className="close-button" onClick={closeBookDetails}>×</button>
          
          <div className="book-detail-header">
            <div className="book-cover">
              <img 
                src={selectedBook.coverImg || getPlaceholderCover('sciFi', selectedBook.title)}
                alt={selectedBook.title}
                onError={(e) => {
                  e.target.onerror = null;
                  // Find which genre this book belongs to
                  const genre = Object.keys(books).find(genre => 
                    books[genre] && books[genre].some(book => book.id === selectedBook.id)
                  ) || 'sciFi';
                  e.target.src = getPlaceholderCover(genre, selectedBook.title);
                }}
              />
            </div>
            <div className="book-info">
              <h2>{selectedBook.title}</h2>
              <p className="book-author">by {selectedBook.author}</p>
              <p className="book-description">{selectedBook.description}</p>
            </div>
          </div>
          
          <div className="book-chapters">
            <h3>Chapters</h3>
            <ul className="chapter-list">
              {selectedBook.chapters.map((chapter, index) => {
                const isPurchased = purchasedChapters[chapter.id];
                const canPurchase = index === 0 || purchasedChapters[selectedBook.chapters[index - 1].id];
                
                return (
                  <li 
                    key={chapter.id}
                    className={`chapter-item ${isPurchased ? 'purchased' : ''} ${!canPurchase ? 'locked' : ''}`}
                    onClick={() => canPurchase && handlePurchaseChapter(selectedBook, chapter)}
                  >
                    <div className="chapter-info">
                      <span className="chapter-title">{chapter.title}</span>
                      <span className="chapter-points">
                        {isPurchased ? (
                          <FaBook className="book-icon" />
                        ) : (
                          <>
                            {chapter.points} <FaStar className="star-icon" />
                          </>
                        )}
                      </span>
                    </div>
                    <div className="chapter-status">
                      {isPurchased ? (
                        <button className="read-button">
                          <FaUnlock /> Read
                        </button>
                      ) : (
                        <button 
                          className={`unlock-button ${canPurchase ? '' : 'disabled'}`}
                          disabled={!canPurchase}
                        >
                          {canPurchase ? <FaLock /> : <FaLock />}
                          {canPurchase ? 'Unlock' : 'Locked'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }, [selectedBook, books, closeBookDetails, getPlaceholderCover, handlePurchaseChapter, purchasedChapters]);

  // Render the book reader when a book is being read
  const renderBookReader = useCallback(() => {
    if (!readingBook) return null;
    
    return (
      <BookReader 
        bookUrl={readingBook.url}
        title={`${readingBook.title} - ${readingBook.chapter}`}
        onClose={closeReader}
      />
    );
  }, [readingBook, closeReader]);

  if (isLoading) {
    return (
      <div className="rewards-page loading">
        <h1>Book Rewards</h1>
        <div className="loading-spinner">Loading books...</div>
      </div>
    );
  }

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
      {books.genreList && books.genreList.map(genre => renderGenreSection(genre))}
      
      {/* Book details overlay */}
      {renderBookDetails()}
      
      {/* Book reader overlay */}
      {renderBookReader()}
    </div>
  );
};

export default RewardsPage;
