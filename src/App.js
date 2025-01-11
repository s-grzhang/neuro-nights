import React, { useState } from "react";
import "./App.css";
import logo from "./moon-removebg-preview.png";
import homePageStars from "./home page stars.png";
import { HashRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { FaStar, FaArrowRight } from 'react-icons/fa';
import GoalsPage from "./GoalsPage";
import RewardsPage from "./RewardsPage";
import EducationPage from "./EducationPage";
import DataPage from "./DataPage";
import AccountPage from "./AccountPage";
import SubscriptionPage from "./SubscriptionPage";

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [points, setPoints] = useState(0); // Points state

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Function to handle earning points
  const handleEarnPoints = (earnedPoints) => setPoints(prevPoints => prevPoints + earnedPoints);

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
              <AccountNavigation />
              <li><Link to="/">HOME</Link></li>
              <li><Link to="goals">GOALS</Link></li>
              <li><Link to="rewards">REWARDS</Link></li>
              <li><Link to="data">DATA</Link></li>
              <li><Link to="education">EDUCATION</Link></li>
              <li><Link to="subscription">SUBSCRIPTION</Link></li>
            </ul>
          </nav>
        </div>

        <Routes>
          <Route path="education" element={<EducationPage />} />
          <Route path="data" element={<DataPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="/" element={<HomePage points={points} handleEarnPoints={handleEarnPoints} />} />
          <Route path="goals" element={<GoalsPage onEarnPoints={handleEarnPoints} />} />
          <Route path="rewards" element={<RewardsPage points={points} setPoints={setPoints} />} />
        </Routes>

        <footer className="footer">
          <p>© NeuroNights</p>
        </footer>
      </div>
    </Router>
  );
};

const HomePage = ({ points }) => (
  <main>
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
        <div className="progress-bar" style={{ width: `${(points / 1000) * 100}%` }}>
          <FaStar className="progress-star" />
        </div>
      </div>
    </div>

    <div className="todays-goals">
      <h2>Today's Goals</h2>
      <div className="goal-cards">
        <GoalCard title="Duration" description="You will sleep for 9 hours tonight." link="goals" />
        <GoalCard title="Consistency" description="You will avoid a bedtime variance of more than 15 minutes." link="goals" />
        <GoalCard title="Bedtime" description="You will sleep from 11 PM to 8 AM." link="goals" />
      </div>
    </div>
  </main>
);

const GoalCard = ({ title, description, link }) => (
  <div className="goal-card">
    <div className="goal-text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <Link to={link} className="goal-link">
      <FaArrowRight />
    </Link>
  </div>
);

const AccountNavigation = () => {
  const navigate = useNavigate();
  return (
    <div className="account-icon" onClick={() => navigate("account")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="account-icon"
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 17c1.5-2 4-3 6.5-3s5 1 6.5 3" />
      </svg>
    </div>
  );
};

export default App;