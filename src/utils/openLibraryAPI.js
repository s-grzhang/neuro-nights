/**
 * Utility functions for interacting with Open Library API
 */

// Base URLs
const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org/b';

/**
 * Get cover image URL from Open Library
 * @param {string} olid - Open Library ID
 * @param {string} size - Size of cover ('S', 'M', or 'L')
 * @returns {string} Cover image URL
 */
export const getCoverUrl = (olid, size = 'M') => {
  if (!olid) return null;
  return `${COVERS_BASE}/olid/${olid}-${size}.jpg`;
};

/**
 * Search books in Open Library
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Object>} Search results
 */
export const searchBooks = async (query, limit = 10) => {
  try {
    const response = await fetch(`${OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch from Open Library');
    return await response.json();
  } catch (error) {
    console.error('Error searching Open Library:', error);
    throw error;
  }
};

/**
 * Get book details by Open Library ID
 * @param {string} olid - Open Library ID
 * @returns {Promise<Object>} Book details
 */
export const getBookDetails = async (olid) => {
  try {
    const response = await fetch(`${OPEN_LIBRARY_BASE}/works/${olid}.json`);
    if (!response.ok) throw new Error('Failed to fetch book details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

/**
 * Format books data for our app from Open Library results
 * @param {Array} books - Books data from Open Library
 * @param {string} genre - Genre category
 * @returns {Array} Formatted books
 */
export const formatBooksData = (books, genre) => {
  return books.map((book, index) => {
    // Extract OLID from key
    const olid = book.key.split('/').pop();
    
    // Check if this is "On the Beach" by Nevil Shute
    const isOnTheBeach = book.title && book.title.toLowerCase().includes('on the beach') ||
                         (book.author_name && book.author_name.some(name => name.toLowerCase().includes('shute')));
    
    // Special case for "On the Beach" - use local PDF instead of Open Library
    const readUrl = isOnTheBeach ? '#' : `https://openlibrary.org${book.key}`;
    
    return {
      id: `${genre}-${index + 1}`,
      olid,
      title: book.title,
      author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
      coverImg: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
      description: book.first_sentence || `A ${genre} book by ${book.author_name ? book.author_name[0] : 'Unknown Author'}`,
      chapters: [
        { id: `${genre}-${index + 1}-1`, title: 'Chapter 1', points: 180 + Math.floor(Math.random() * 50) },
        { id: `${genre}-${index + 1}-2`, title: 'Chapter 2', points: 270 + Math.floor(Math.random() * 50) },
        { id: `${genre}-${index + 1}-3`, title: 'Chapter 3', points: 390 + Math.floor(Math.random() * 50) }
      ],
      readUrl: readUrl,
      // Flag to indicate embedded PDF should be used
      useEmbeddedPdf: isOnTheBeach
    };
  });
};

/**
 * Fetch books for genres from Open Library
 * @param {string} genre - Genre to fetch
 * @returns {Promise<Array>} Formatted books for the genre
 */
export const fetchGenreBooks = async (genre) => {
  try {
    // Map our genres to appropriate Open Library search terms
    const searchTerms = {
      sciFi: 'science fiction',
      fantasy: 'fantasy',
      mystery: 'mystery detective',
      non_fiction: 'non-fiction'
    };
    
    const searchTerm = searchTerms[genre] || genre;
    const results = await searchBooks(`subject:${searchTerm}`, 5);
    return formatBooksData(results.docs, genre);
  } catch (error) {
    console.error(`Error fetching ${genre} books:`, error);
    return [];
  }
}; 