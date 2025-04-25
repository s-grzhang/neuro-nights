import React, { useState } from 'react';
import './EducationPage.css'; // Style the page

import { 
  FaPlay, 
  FaRunning, 
  FaArrowLeft,
  FaYoutube
} from 'react-icons/fa';
import { GiBrain, GiSleepy } from 'react-icons/gi';
import { MdOutlineNightlight } from 'react-icons/md';
import { BsFillMoonStarsFill } from 'react-icons/bs';

// Game components
import BrainBuilder from './games/BrainBuilder/BrainBuilder';
import CircadianRhythmRacer from './games/CircadianRhythmRacer/CircadianRhythmRacer';

// Placeholder components for games that haven't been implemented yet
const SleepyBrainSimulator = ({ onBackToEducation }) => (
  <div className="placeholder-game">
    <h2>Sleepy Brain Simulator</h2>
    <p>This game is coming soon! Check back later to experience how a tired brain functions differently.</p>
    <button onClick={onBackToEducation}>Back to Education</button>
  </div>
);

const DreamDecoder = ({ onBackToEducation }) => (
  <div className="placeholder-game">
    <h2>Dream Decoder</h2>
    <p>This game is coming soon! Check back later to learn about dream patterns and what they mean for your brain.</p>
    <button onClick={onBackToEducation}>Back to Education</button>
  </div>
);

// Video player component
const VideoPlayer = ({ videoId, title, description, isMain = false }) => {
  const [playing, setPlaying] = useState(false);
  
  // Extract video ID from various YouTube URL formats
  const getYoutubeVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : url;
  };
  
  const embedId = getYoutubeVideoId(videoId);
  
  return (
    <div className={`video-card ${isMain ? 'main-video' : ''}`}>
      {playing ? (
        <div className="video-container">
          <iframe
            src={`https://www.youtube.com/embed/${embedId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          ></iframe>
        </div>
      ) : (
        <div className="video-preview" onClick={() => setPlaying(true)}>
          <img 
            src={`https://img.youtube.com/vi/${embedId}/hqdefault.jpg`} 
            alt={title} 
            className="thumbnail"
          />
          <div className="play-overlay">
            <FaPlay className="play-icon" />
          </div>
          <div className="video-info">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const EducationPage = ({ userId, userData, updateUserData }) => {
  const [activeGame, setActiveGame] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  
  // Sleep exercise videos data
  const videos = [
    {
      id: 'video1',
      videoId: 'https://www.youtube.com/watch?v=BSmYxnvUDHw&t=2702s',
      title: 'Deep Sleep Relaxation Exercise',
      description: 'A guided meditation to help you fall asleep faster and improve sleep quality.'
    },
    {
      id: 'video2',
      videoId: 'https://www.youtube.com/watch?v=FVlmTkgiMY8',
      title: 'Evening Wind-Down Routine',
      description: 'Gentle stretches and breathing exercises to prepare your body for sleep.'
    },
    {
      id: 'video3',
      videoId: 'https://www.youtube.com/watch?v=4wEDoKm40Yc&t=404s',
      title: 'Sleep-Inducing Breathwork',
      description: 'Specialized breathing techniques that trigger your body\'s relaxation response.'
    }
  ];

  const games = [
    {
      id: 'brain-builder',
      title: 'Brain Builder',
      icon: <GiBrain className="card-icon" />,
      description: 'Match pairs of brain parts with what they do during sleep! Learn how sleep helps with memory, learning, and focus.',
      points: 150,
      component: <BrainBuilder onBackToEducation={() => setActiveGame(null)} />
    },
    {
      id: 'circadian-rhythm-racer',
      title: 'Circadian Rhythm Racer',
      icon: <FaRunning className="card-icon" />,
      description: 'Help a little "Sleepy Cell" avoid blue light and catch melatonin drops in this side-scrolling adventure!',
      points: 100,
      component: <CircadianRhythmRacer 
        userId={userId} 
        userData={userData} 
        updateUserData={updateUserData} 
        onBackToEducation={() => setActiveGame(null)}
      />
    },
    {
      id: 'sleepy-brain-simulator',
      title: 'Sleepy Brain Simulator',
      icon: <BsFillMoonStarsFill className="card-icon" />,
      description: 'Experience how a tired brain functions differently! Tap fast to help a sleepy brain do simple tasks.',
      points: 100,
      component: <SleepyBrainSimulator onBackToEducation={() => setActiveGame(null)} />
    },
    {
      id: 'dream-decoder',
      title: 'Dream Decoder',
      icon: <GiSleepy className="card-icon" />,
      description: 'Decode dream patterns and learn about the science of dreams and what they mean for your brain.',
      points: 200,
      component: <DreamDecoder onBackToEducation={() => setActiveGame(null)} />
    }
  ];

  // Back to game selection menu
  const handleBackClick = () => {
    setActiveGame(null);
    setActiveVideo(null);
  };

  return (
    <main className="education-page">
      <div className="education-content">
        {activeGame ? (
          <div className="active-game-container">
            <button className="back-button" onClick={handleBackClick}>
              <FaArrowLeft /> Back to Education
            </button>
            <div className="active-game">
              {games.find(game => game.id === activeGame)?.component}
            </div>
          </div>
        ) : activeVideo ? (
          <div className="active-video-container">
            <button className="back-button" onClick={handleBackClick}>
              <FaArrowLeft /> Back to Education
            </button>
            <div className="active-video">
              <VideoPlayer 
                videoId={videos.find(video => video.id === activeVideo)?.videoId || ''}
                title={videos.find(video => video.id === activeVideo)?.title || ''}
                description={videos.find(video => video.id === activeVideo)?.description || ''}
                isMain={true}
              />
            </div>
          </div>
        ) : (
          <>
            <h1 className="page-title">Learn About Sleep</h1>
            <p className="page-description">Play educational games and watch videos to learn about how sleep affects your brain!</p>

            <h2 className="section-title">Sleep Games</h2>
            <div className="game-cards">
              {games.map(game => (
                <div key={game.id} className="game-card" onClick={() => setActiveGame(game.id)}>
                  {game.icon}
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <button className="play-button">Play Now</button>
                </div>
              ))}
            </div>

            <h2 className="section-title videos">Sleep Exercise Videos</h2>
            <div className="video-section">
              <div className="main-video-container">
                <VideoPlayer 
                  videoId={videos[0].videoId}
                  title={videos[0].title}
                  description={videos[0].description}
                  isMain={true}
                />
              </div>
              <div className="small-videos-container">
                {videos.slice(1).map(video => (
                  <VideoPlayer 
                    key={video.id}
                    videoId={video.videoId}
                    title={video.title}
                    description={video.description}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default EducationPage;
