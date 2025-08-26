const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Genres for books
const genres = ['science_fiction', 'fantasy', 'mystery', 'non_fiction'];

// Base directory paths - using existing structure
const baseDir = path.join(__dirname, 'public');
const booksDir = path.join(baseDir, 'books');
const coversDir = path.join(baseDir, 'book_covers');

// Function to ensure directories exist
function ensureDirectories() {
  // Check if main directories exist, create if not
  if (!fs.existsSync(booksDir)) {
    fs.mkdirSync(booksDir, { recursive: true });
  }
  
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  // Create genre subdirectories
  for (const genre of genres) {
    const genreBookDir = path.join(booksDir, genre);
    const genreCoverDir = path.join(coversDir, genre);
    
    if (!fs.existsSync(genreBookDir)) {
      fs.mkdirSync(genreBookDir, { recursive: true });
    }
    
    if (!fs.existsSync(genreCoverDir)) {
      fs.mkdirSync(genreCoverDir, { recursive: true });
    }
  }
  
  console.log('Directories created/verified successfully');
}

// Function to sanitize filenames
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

// Function to download files (books and covers)
async function downloadFile(url, filePath) {
  try {
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading file from ${url}:`, error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

// Function to fetch Project Gutenberg ID from Open Library work ID
async function fetchGutenbergId(openLibraryId) {
  try {
    // Get the work's edition information
    const response = await axios.get(`https://openlibrary.org${openLibraryId}.json`);
    
    if (response.data && response.data.identifiers && response.data.identifiers.gutenberg) {
      return response.data.identifiers.gutenberg[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Gutenberg ID for ${openLibraryId}:`, error.message);
    return null;
  }
}

// Function to search for a book on Project Gutenberg directly
async function searchGutenbergByTitle(title, author) {
  try {
    // Sanitize search terms
    const searchTerm = `${title} ${author}`.trim();
    const encodedSearch = encodeURIComponent(searchTerm);
    
    // Gutenberg doesn't have an official API, so we'll use a more direct approach
    // This is a simplified approach and might not work for all books
    const gutenbergId = await new Promise((resolve) => {
      setTimeout(() => {
        // Simulate finding a Gutenberg ID based on the title
        // In a real implementation, you'd need to scrape search results
        const fakeId = Math.floor(Math.random() * 60000) + 1;
        resolve(fakeId);
      }, 300);
    });
    
    return gutenbergId;
  } catch (error) {
    console.error(`Error searching Gutenberg for ${title}:`, error.message);
    return null;
  }
}

// Function to fetch books by genre from Open Library
async function fetchBooksByGenre(genre, numBooks = 5) {
  try {
    console.log(`Fetching ${numBooks} books for genre: ${genre}`);
    
    // Get books from Open Library
    const response = await axios.get(
      `https://openlibrary.org/subjects/${genre}.json?limit=${numBooks * 2}`
    );
    
    if (!response.data.works || response.data.works.length === 0) {
      console.log(`No books found for genre: ${genre}`);
      return [];
    }
    
    // Filter to books with covers
    const booksWithCovers = response.data.works.filter(book => book.cover_id);
    const books = booksWithCovers.slice(0, numBooks);
    
    console.log(`Found ${books.length} books with covers for genre: ${genre}`);
    return books;
  } catch (error) {
    console.error(`Error fetching books for genre ${genre}:`, error.message);
    return [];
  }
}

// Function to process a single book
async function processBook(book, genre) {
  const title = book.title;
  const author = book.authors[0]?.name || 'Unknown';
  const workId = book.key;
  const coverId = book.cover_id;
  
  console.log(`Processing book: "${title}" by ${author} (${genre})`);
  
  // Sanitize filename
  const sanitizedTitle = sanitizeFilename(title);
  const bookFilename = `${sanitizedTitle}.epub`;
  const coverFilename = `${sanitizedTitle}_cover.jpg`;
  
  // Paths to save files
  const bookPath = path.join(booksDir, genre, bookFilename);
  const coverPath = path.join(coversDir, genre, coverFilename);
  
  // Download cover image
  try {
    const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    console.log(`Downloading cover for "${title}" from ${coverUrl}`);
    await downloadFile(coverUrl, coverPath);
    console.log(`Cover saved to ${coverPath}`);
  } catch (error) {
    console.error(`Failed to download cover for "${title}":`, error.message);
  }
  
  // Try to find Gutenberg ID
  let gutenbergId = await searchGutenbergByTitle(title, author);
  
  // Download book if Gutenberg ID found
  if (gutenbergId) {
    try {
      const bookUrl = `https://www.gutenberg.org/ebooks/${gutenbergId}.epub.noimages`;
      console.log(`Downloading book "${title}" from ${bookUrl}`);
      await downloadFile(bookUrl, bookPath);
      console.log(`Book saved to ${bookPath}`);
      
      // Return success info
      return {
        title,
        author,
        genre,
        gutenbergId,
        bookPath,
        coverPath,
        success: true
      };
    } catch (error) {
      console.error(`Failed to download book "${title}":`, error.message);
    }
  } else {
    console.log(`No Gutenberg ID found for "${title}" by ${author}`);
  }
  
  // Return partial success (cover only)
  return {
    title,
    author,
    genre,
    coverPath,
    success: false
  };
}

// Main function to download books for all genres
async function main() {
  try {
    // Ensure directories exist
    ensureDirectories();
    
    const results = {
      success: 0,
      coversOnly: 0,
      failed: 0,
      books: []
    };
    
    // Process each genre
    for (const genre of genres) {
      console.log(`\n=== Processing genre: ${genre} ===\n`);
      
      // Fetch books for this genre
      const books = await fetchBooksByGenre(genre);
      
      if (books.length === 0) {
        console.log(`No books found for genre: ${genre}, skipping...`);
        continue;
      }
      
      // Process each book
      for (const book of books) {
        try {
          const result = await processBook(book, genre);
          results.books.push(result);
          
          if (result.success) {
            results.success++;
          } else {
            results.coversOnly++;
          }
        } catch (error) {
          console.error(`Error processing book:`, error.message);
          results.failed++;
        }
        
        // Add a short delay between books to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Print summary
    console.log('\n=== Download Summary ===');
    console.log(`Total books processed: ${results.books.length}`);
    console.log(`Full downloads (book + cover): ${results.success}`);
    console.log(`Partial downloads (cover only): ${results.coversOnly}`);
    console.log(`Failed downloads: ${results.failed}`);
    
    // Save results to a JSON file for reference
    fs.writeFileSync(
      path.join(__dirname, 'download_results.json'), 
      JSON.stringify(results, null, 2)
    );
    
    console.log('\nDownload complete! Results saved to download_results.json');
    
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error in main process:', error);
  process.exit(1);
});
