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
          <p className="card-description">Challenge your mind with fun puzzles.</p>
          <button className="card-button">400 pts.</button>
        </div>
        <div className="card">
          <FaPuzzlePiece className="card-icon" />
          <h2 className="card-title">Memory Games</h2>
          <p className="card-description">Train your memory and attention skills.</p>
          <button className="card-button">350 pts.</button>
        </div>
        <div className="card">
          <FaGamepad className="card-icon" />
          <h2 className="card-title">Fun Challenges</h2>
          <p className="card-description">Interactive challenges to enjoy and learn.</p>
          <button className="card-button">450 pts.</button>
        </div>
        <div className="card">
          <FaQuestionCircle className="card-icon" />
          <h2 className="card-title">Trivia Quiz</h2>
          <p className="card-description">Test your knowledge on various topics.</p>
          <button className="card-button">300 pts.</button>
        </div>
      </div>

      {/* Sleep Exercises Section */}
      <h1>Sleep Exercises</h1>
      <div className="video-section">
        <div className="large-video">
          <video src="video1.mp4" controls></video>
        </div>
        <div className="small-video-row">
          <video className="small-video" src="video2.mp4" controls></video>
          <video className="small-video" src="video3.mp4" controls></video>
          <video className="small-video" src="video4.mp4" controls></video>
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
