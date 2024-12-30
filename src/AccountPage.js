import React, { useState } from "react";
import "./AccountPage.css";

const AccountPage = () => {
  const [privacyOn, setPrivacyOn] = useState(false);

  const togglePrivacy = () => {
    setPrivacyOn(!privacyOn);
  };

  return (
    <div className="account-page">
      {/* Placeholder Icon */}
      <div className="profile-icon" onClick={() => (window.location.href = "/account")}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 17c1.5-2 4-3 6.5-3s5 1 6.5 3" />
  </svg>
</div>

      {/* Name */}
      <label htmlFor="name">Name</label>
      <input type="text" id="name" className="input-field" placeholder="Your Name" />

      {/* Password */}
      <label htmlFor="password">Password</label>
      <input type="password" id="password" className="input-field" placeholder="Your Password" />

      {/* Age */}
      <label htmlFor="age">Age</label>
      <input type="number" id="age" className="input-field" placeholder="Your Age" />

      {/* Gender */}
      <label htmlFor="gender">Gender</label>
      <select id="gender" className="dropdown">
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="nonbinary">Nonbinary</option>
      </select>

      {/* Privacy Controls */}
      <h2>Privacy Controls</h2>
      <div className="privacy-setting">
        <span>Privacy Setting</span>
        <label className="switch">
          <input type="checkbox" checked={privacyOn} onChange={togglePrivacy} />
          <span className="slider"></span>
        </label>
      </div>
      <button className="orange-button">SET</button>

      {/* Subscriptions */}
      <h2>Subscriptions</h2>
      <p>You have 10 days left</p>
      <button className="orange-button">RENEW</button>
    </div>
  );
};

export default AccountPage;
