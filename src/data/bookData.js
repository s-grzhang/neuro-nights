// Book catalog with multiple genres
export const bookData = {
  sciFi: [
    {
      id: 'sci-1',
      title: 'The Lost World',
      author: 'Arthur Conan Doyle',
      description: 'A thrilling adventure to a prehistoric plateau where dinosaurs still roam.',
      chapters: [
        { id: 'sci-1-1', title: 'Chapter 1: The Challenge', points: 200, pdfPath: '/books/science_fiction/the_lost_world.epub' },
        { id: 'sci-1-2', title: 'Chapter 2: The Expedition', points: 300, pdfPath: '/books/science_fiction/the_lost_world.epub' },
        { id: 'sci-1-3', title: 'Chapter 3: The Plateau', points: 450, pdfPath: '/books/science_fiction/the_lost_world.epub' },
      ],
    },
    {
      id: 'sci-2',
      title: 'The Time Machine',
      author: 'H.G. Wells',
      description: 'A scientist travels through time to discover the future of humanity.',
      chapters: [
        { id: 'sci-2-1', title: 'Chapter 1: The Time Traveler', points: 220, pdfPath: '/books/science_fiction/the_time_machine.epub' },
        { id: 'sci-2-2', title: 'Chapter 2: The Future', points: 320, pdfPath: '/books/science_fiction/the_time_machine.epub' },
        { id: 'sci-2-3', title: 'Chapter 3: The Eloi', points: 470, pdfPath: '/books/science_fiction/the_time_machine.epub' },
      ],
    },
    {
      id: 'sci-3',
      title: 'Frankenstein',
      author: 'Mary Shelley',
      description: 'A scientist creates life, but his creation turns into a monster.',
      chapters: [
        { id: 'sci-3-1', title: 'Chapter 1: The Creation', points: 250, pdfPath: '/books/science_fiction/frankenstein_or_the_modern_prometheus.epub' },
        { id: 'sci-3-2', title: 'Chapter 2: The Monster', points: 350, pdfPath: '/books/science_fiction/frankenstein_or_the_modern_prometheus.epub' },
        { id: 'sci-3-3', title: 'Chapter 3: The Reckoning', points: 500, pdfPath: '/books/science_fiction/frankenstein_or_the_modern_prometheus.epub' },
      ],
    },
  ],
  fantasy: [
    {
      id: 'fan-1',
      title: 'The Prince',
      author: 'Niccolò Machiavelli',
      description: 'A treatise on political power and leadership.',
      chapters: [
        { id: 'fan-1-1', title: 'Chapter 1: Principalities', points: 180, pdfPath: '/books/fantasy/the_prince.epub' },
        { id: 'fan-1-2', title: 'Chapter 2: Hereditary', points: 280, pdfPath: '/books/fantasy/the_prince.epub' },
        { id: 'fan-1-3', title: 'Chapter 3: Mixed', points: 420, pdfPath: '/books/fantasy/the_prince.epub' },
      ],
    },
    {
      id: 'fan-2',
      title: 'Treasure Island',
      author: 'Robert Louis Stevenson',
      description: 'A young boy\'s adventure to find buried treasure.',
      chapters: [
        { id: 'fan-2-1', title: 'Chapter 1: The Old Sea Dog', points: 210, pdfPath: '/books/fantasy/treasure_island.epub' },
        { id: 'fan-2-2', title: 'Chapter 2: The Map', points: 310, pdfPath: '/books/fantasy/treasure_island.epub' },
        { id: 'fan-2-3', title: 'Chapter 3: The Voyage', points: 440, pdfPath: '/books/fantasy/treasure_island.epub' },
      ],
    },
  ],
  mystery: [
    {
      id: 'mys-1',
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      description: 'A collection of twelve detective stories featuring Sherlock Holmes.',
      chapters: [
        { id: 'mys-1-1', title: 'A Scandal in Bohemia', points: 190, pdfPath: '/books/mystery/the_adventures_of_sherlock_holmes_12_stories_.epub' },
        { id: 'mys-1-2', title: 'The Red-Headed League', points: 290, pdfPath: '/books/mystery/the_adventures_of_sherlock_holmes_12_stories_.epub' },
        { id: 'mys-1-3', title: 'A Case of Identity', points: 430, pdfPath: '/books/mystery/the_adventures_of_sherlock_holmes_12_stories_.epub' },
      ],
    },
    {
      id: 'mys-2',
      title: 'The Hound of the Baskervilles',
      author: 'Arthur Conan Doyle',
      description: 'Sherlock Holmes investigates a supernatural hound haunting the Baskerville family.',
      chapters: [
        { id: 'mys-2-1', title: 'Chapter 1: The Curse', points: 220, pdfPath: '/books/mystery/the_hound_of_the_baskervilles.epub' },
        { id: 'mys-2-2', title: 'Chapter 2: The Investigation', points: 330, pdfPath: '/books/mystery/the_hound_of_the_baskervilles.epub' },
        { id: 'mys-2-3', title: 'Chapter 3: The Truth', points: 450, pdfPath: '/books/mystery/the_hound_of_the_baskervilles.epub' },
      ],
    },
  ],
  non_fiction: [
    {
      id: 'nf-1',
      title: 'The Selfish Gene',
      author: 'Richard Dawkins',
      description: 'A revolutionary book on evolutionary biology and genetics.',
      chapters: [
        { id: 'nf-1-1', title: 'Chapter 1: Why are people?', points: 170, pdfPath: '/books/non_fiction/the_selfish_gene.epub' },
        { id: 'nf-1-2', title: 'Chapter 2: The replicators', points: 260, pdfPath: '/books/non_fiction/the_selfish_gene.epub' },
        { id: 'nf-1-3', title: 'Chapter 3: Immortal coils', points: 400, pdfPath: '/books/non_fiction/the_selfish_gene.epub' },
      ],
    },
    {
      id: 'nf-2',
      title: 'Body Language',
      author: 'Allan Pease',
      description: 'Understanding human communication through body language.',
      chapters: [
        { id: 'nf-2-1', title: 'Chapter 1: The Basics', points: 200, pdfPath: '/books/non_fiction/body_language.epub' },
        { id: 'nf-2-2', title: 'Chapter 2: Gestures', points: 300, pdfPath: '/books/non_fiction/body_language.epub' },
        { id: 'nf-2-3', title: 'Chapter 3: Applications', points: 460, pdfPath: '/books/non_fiction/body_language.epub' },
      ],
    },
  ]
}; 