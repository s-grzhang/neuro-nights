import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "./moon-removebg-preview.png";
import homePageStars from "./home page stars.png";
import { HashRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { FaStar, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import GoalsPage from "./GoalsPage";
import RewardsPage from "./RewardsPage";
import EducationPage from "./EducationPage";
import DataPage from "./DataPage";
import AccountPage from "./AccountPage";
import SubscriptionPage from "./SubscriptionPage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // Firestore config
import LoginModal from "./LoginModal";
import { AuthProvider, useAuth } from "./AuthContext";
import CircadianRhythmRacer from "./games/CircadianRhythmRacer/CircadianRhythmRacer";
import BrainBuilder from "./games/BrainBuilder/BrainBuilder";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { userData, isAuthenticated, userId, logout, updateUserData } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();
  const [goals, setGoals] = useState({
    duration: "Loading...",
    consistency: "Loading...",
    bedtime: "Loading...",
  });

  // Get points from user data
  const points = userData?.points || 0;

  // Open login modal if redirected with state
  useEffect(() => {
    if (location.state?.openLoginModal) {
      setLoginModalOpen(true);
      // Clear the state to prevent reopening
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Function to handle earning points and update Firestore
  const handleEarnPoints = (earnedPoints) => {
    if (isAuthenticated) {
      const newPoints = (userData?.points || 0) + earnedPoints;
      updateUserData({ points: newPoints });
    }
  };

  // Toggle side menu
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Open/close login modal
  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);
  
  // Fetch goals from Firestore
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "goals"));
        let latestGoals = {};
        querySnapshot.forEach((doc) => {
          const goalText = doc.data().text;
          if (goalText.includes("sleep for")) {
            latestGoals.duration = goalText;
          } else if (goalText.includes("variance")) {
            latestGoals.consistency = goalText;
          } else if (goalText.includes("sleep from")) {
            latestGoals.bedtime = goalText;
          }
        });

        setGoals({
          duration: latestGoals.duration || "No duration goal set.",
          consistency: latestGoals.consistency || "No consistency goal set.",
          bedtime: latestGoals.bedtime || "No bedtime goal set.",
        });
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, []);

  const menuItems = [
    { name: 'Home', icon: 'home', path: '/' },
    { name: 'Education', icon: 'school', path: '/education' },
    { name: 'Data', icon: 'assessment', path: '/data' },
    { name: 'Goals', icon: 'flag', path: '/goals' },
    { name: 'Rewards', icon: 'card_giftcard', path: '/rewards' },
  ];

  const appInfo = {
    version: '1.0.0',
    platform: 'Android',
  };

  return (
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
        <div className="menu-header">
          <h2>NeuroNights</h2>
          <p className="app-version">v{appInfo.version} ({appInfo.platform})</p>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <nav>
          <ul>
            <AccountNavigation 
              isAuthenticated={isAuthenticated}
              openLoginModal={openLoginModal} 
            />
            {menuItems.map((item) => (
              <li key={item.name}><Link to={item.path} onClick={() => setMenuOpen(false)}>{item.name}</Link></li>
            ))}
            {isAuthenticated && (
              <li className="logout-item" onClick={() => { logout(); setMenuOpen(false); }}>
                <FaSignOutAlt /> LOGOUT
              </li>
            )}
          </ul>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<HomePage points={points} goals={goals} handleEarnPoints={handleEarnPoints} isAuthenticated={isAuthenticated} openLoginModal={openLoginModal} />} />
        <Route path="/education" element={<EducationPage userId={userId} userData={userData} updateUserData={updateUserData} />} />
        <Route path="/data" element={
          isAuthenticated ? <DataPage /> : <Navigate to="/" state={{ openLoginModal: true }} />
        } />
        <Route path="/goals" element={
          isAuthenticated ? <GoalsPage 
            userId={userId}
            userData={userData}
            updateUserData={updateUserData}
            onEarnPoints={handleEarnPoints} 
            goals={goals} 
            setGoals={setGoals} 
          /> : <Navigate to="/" state={{ openLoginModal: true }} />
        } />
        <Route path="/rewards" element={
          isAuthenticated ? <RewardsPage points={points} setPoints={(newPoints) => updateUserData({ points: newPoints })} userId={userId} /> : <Navigate to="/" state={{ openLoginModal: true }} />
        } />
        <Route path="/account" element={
          isAuthenticated ? <AccountPage userData={userData} updateUserData={updateUserData} /> : <Navigate to="/" state={{ openLoginModal: true }} />
        } />
        <Route path="/subscription" element={
          isAuthenticated ? <SubscriptionPage /> : <Navigate to="/" state={{ openLoginModal: true }} />
        } />
      </Routes>

      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />

      <footer className="footer">
        <p>© NeuroNights</p>
      </footer>
    </div>
  );
};

const HomePage = ({ points, goals, handleEarnPoints, isAuthenticated, openLoginModal }) => (
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
        <GoalCard 
          title="Duration" 
          description={goals.duration} 
          link="goals" 
          isAuthenticated={isAuthenticated}
          openLoginModal={openLoginModal}
        />
        <GoalCard 
          title="Consistency" 
          description={goals.consistency} 
          link="goals" 
          isAuthenticated={isAuthenticated}
          openLoginModal={openLoginModal}
        />
        <GoalCard 
          title="Bedtime" 
          description={goals.bedtime} 
          link="goals" 
          isAuthenticated={isAuthenticated}
          openLoginModal={openLoginModal}
        />
      </div>
    </div>
    
    {!isAuthenticated && (
      <div className="login-cta">
        <p>Sign up or log in to track your sleep goals and earn rewards!</p>
        <button className="cta-button" onClick={openLoginModal}>Get Started</button>
      </div>
    )}
  </main>
);

const GoalCard = ({ title, description, link, isAuthenticated, openLoginModal }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(link);
    } else {
      openLoginModal();
    }
  };
  
  return (
    <div className="goal-card">
      <div className="goal-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <a href={`#/${link}`} className="goal-link" onClick={handleClick}>
        <FaArrowRight />
      </a>
    </div>
  );
};

const AccountNavigation = ({ isAuthenticated, openLoginModal }) => {
  const navigate = useNavigate();
  
  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate("account");
    } else {
      openLoginModal();
    }
  };

  return (
    <div 
      className="account-icon" 
      onClick={handleAccountClick}
      title={isAuthenticated ? "My Account" : "Login / Register"}
    >
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