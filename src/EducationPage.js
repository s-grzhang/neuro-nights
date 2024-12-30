import React from 'react';
import './EducationPage.css'; // Style the page

import { FaBrain, FaPuzzlePiece, FaGamepad, FaQuestionCircle } from 'react-icons/fa';

const EducationPage = () => {
  return (
    <div className="education-page">
      {/* Quizzes & Games Section */}
      <h1>Quizzes & Games</h1>
      <div className="card-grid">
        <div className="card">
          <FaBrain className="card-icon" />
          <h2 className="card-title">Brain Teasers</h2>
          <p className="card-description">Understand the relationship between mental health disorders & sleep.</p>
          <button className="card-button">100 pts.</button>
        </div>
        <div className="card">
          <FaPuzzlePiece className="card-icon" />
          <h2 className="card-title">Memory Games</h2>
          <p className="card-description">Learn the short- and long-term effects of insufficient sleep on memory with some fun brain teasers.</p>
          <button className="card-button">150 pts.</button>
        </div>
        <div className="card">
          <FaGamepad className="card-icon" />
          <h2 className="card-title">Fun Challenges</h2>
          <p className="card-description">Explore the changes in brain structure and function during the teenage years.</p>
          <button className="card-button">150 pts.</button>
        </div>
        <div className="card">
          <FaQuestionCircle className="card-icon" />
          <h2 className="card-title">Trivia Quiz</h2>
          <p className="card-description">Test your knowledge on the role of sleep in the growth & maintenance of new neurons.</p>
          <button className="card-button">100 pts.</button>
        </div>
      </div>

      {/* Sleep Exercises Section */}
      <h1>Sleep Exercises</h1>
      <div className="video-section">
        <div className="large-video">
          <iframe 
            width="300" 
            height="168.75" 
            src="https://www.youtube.com/embed/4wEDoKm40Yc" 
            frameborder="0" 
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
        <div className="small-video-row">
          <iframe 
            className="small-video" 
            width="100" 
            height="56.25" 
            src="https://www.youtube.com/embed/vPUQ265HU2Q" 
            frameborder="0" 
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
          <iframe 
            className="small-video" 
            width="100" 
            height="56.25" 
            src="https://www.youtube.com/embed/ft-vhYwHzxw" 
            frameborder="0" 
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
          <iframe 
            className="small-video" 
            width="100" 
            height="56.25" 
            src="https://www.youtube.com/embed/z867dlHCq9c" 
            frameborder="0" 
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </div>

      {/* Share Neuronights Section */}
      <h1>Share Neuronights</h1>
      <div className="social-media-icons">
        <i className="fab fa-whatsapp"></i>
        <i className="fab fa-facebook"></i>
        <i className="fab fa-twitter"></i>
        <i className="fab fa-instagram"></i>
      </div>
    </div>
  );
};

export default EducationPage;
