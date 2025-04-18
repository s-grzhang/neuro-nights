import React, { useState, useEffect } from 'react';
import './BookReader.css';
import { FaTimes, FaExpand, FaCompress, FaBookmark, FaVolumeUp, FaFont } from 'react-icons/fa';

const BookReader = ({ bookUrl, title, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16); // Default font size
  
  useEffect(() => {
    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullscreen = () => {
    const readerElement = document.getElementById('book-reader-container');
    
    if (!document.fullscreenElement) {
      if (readerElement.requestFullscreen) {
        readerElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  const changeFontSize = (increment) => {
    setFontSize(prevSize => {
      const newSize = prevSize + increment;
      return Math.min(Math.max(newSize, 12), 24); // Limit between 12-24px
    });
  };
  
  // For BookReader, we're using Open Library's reading system via iframe
  return (
    <div 
      id="book-reader-container" 
      className={`book-reader-overlay ${isFullscreen ? 'fullscreen' : ''}`}
    >
      <div className="reader-header">
        <h3>{title}</h3>
        <div className="reader-controls">
          <button onClick={() => changeFontSize(-1)} title="Decrease font size">
            <FaFont /> -
          </button>
          <button onClick={() => changeFontSize(1)} title="Increase font size">
            <FaFont /> +
          </button>
          <button title="Bookmark">
            <FaBookmark />
          </button>
          <button title="Read aloud">
            <FaVolumeUp />
          </button>
          <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button onClick={onClose} title="Close reader">
            <FaTimes />
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="reader-loading">
          <div className="loading-spinner"></div>
          <p>Loading book...</p>
        </div>
      )}
      
      <div className="reader-content" style={{ fontSize: `${fontSize}px` }}>
        <iframe 
          src={bookUrl}
          title={`${title} reader`}
          frameBorder="0"
          allowFullScreen
          onLoad={handleIframeLoad}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};

export default BookReader; 