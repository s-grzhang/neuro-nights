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
      <div className="profile-icon">👤</div>

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
