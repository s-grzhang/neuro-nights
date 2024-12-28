import React, { useState } from "react";
import "./App.css";
import logo from "./moon-removebg-preview.png"; // Make sure to replace with the correct path to your logo image

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <header className="fixed-header">
        <h1>
          NeuroNights
          {/* Add the logo image to the right of the header */}
          <img src={logo} alt="NeuroNights Logo" className="logo" />
        </h1>
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </header>

      {/* Side menu that opens and closes */}
      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        {/* Inside the menu, add the same toggle button */}
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
        </div>

        <nav>
          <ul>
            <li><a href="#home">HOME</a></li>
            <li><a href="#goals">GOALS</a></li>
            <li><a href="#rewards">REWARDS</a></li>
            <li><a href="#data">DATA</a></li>
            <li><a href="#education">EDUCATION</a></li>
          </ul>
        </nav>
      </div>

      <main>
        <p style={{ marginTop: "60px" }}>Scroll down to see the header stay in place.</p>
        {[...Array(50)].map((_, i) => (
          <p key={i}>Content row {i + 1}</p>
        ))}
      </main>
    </div>
  );
};

export default App;