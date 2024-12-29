import React, { useState } from "react";
import "./App.css";
import logo from "./moon-removebg-preview.png";
import homePageStars from "./home page stars.png";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { FaStar, FaArrowRight } from 'react-icons/fa';
import GoalsPage from "./GoalsPage";
import RewardsPage from "./RewardsPage"
import EducationPage from "./EducationPage"

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Router>
      <div>
        <header className="fixed-header">
          <h1>
            NeuroNights
            <img src={logo} alt="NeuroNights Logo" className="logo" />
          </h1>
          <div className="menu-icon" onClick={toggleMenu}>
            <div className="line"></div>
            <div className="line"></div>
          </div>
        </header>

        <div className={`side-menu ${menuOpen ? "open" : ""}`}>
          <div className="menu-icon" onClick={toggleMenu}>
            <div className="line"></div>
            <div className="line"></div>
          </div>

          <nav>
            <ul>
              <li><Link to="/">HOME</Link></li>
              <li><Link to="/goals">GOALS</Link></li>
              <li><a href="/rewards">REWARDS</a></li>
              <li><a href="/data">DATA</a></li>
              <li><a href="/education">EDUCATION</a></li>
            </ul>
          </nav>
        </div>

        <Routes>
          <Route path="/rewards" element={<RewardsPage />} /> 
          <Route path="/education" element={<EducationPage />} /> 
          <Route path="/" element={
            <main>
              {/* Home Page Content */}
              <div className="status-box">
                <img src={homePageStars} alt="Stars" className="status-box-image" />
                <div className="status-box-text">
                  <h2>You slept 8 hours today</h2>
                  <p>Keep it up!</p>
                </div>
              </div>

              <div className="reward-points">
                <h2>Reward Points</h2>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: "50%" }}>
                    <FaStar className="progress-star" />
                  </div>
                </div>
              </div>

              <div className="todays-goals">
                <h2>Today's Goals</h2>
                <div className="goal-cards">
                  <div className="goal-card">
                    <div className="goal-text">
                      <h3>Duration</h3>
                      <p>You will sleep for at least 8 hours.</p>
                    </div>
                    <Link to="/goals" className="goal-link">
                      <FaArrowRight />
                    </Link>
                  </div>
                  <div className="goal-card">
                    <div className="goal-text">
                      <h3>Consistency</h3>
                      <p>You will meet your goals every day of the week.</p>
                    </div>
                    <Link to="/goals" className="goal-link">
                      <FaArrowRight />
                    </Link>
                  </div>
                  <div className="goal-card">
                    <div className="goal-text">
                      <h3>Bedtime</h3>
                      <p>Sleep by 11 PM & wake up by 9 AM.</p>
                    </div>
                    <Link to="/goals" className="goal-link">
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          } />
          <Route path="/goals" element={<GoalsPage />} />
        </Routes>

        <footer className="footer">
          <p>© NeuroNights</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;