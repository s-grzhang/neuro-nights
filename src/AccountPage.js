import React, { useState, useEffect } from "react";
import "./AccountPage.css";
import { useAuth } from "./AuthContext";
import { collection, getDocs, query, where, updateDoc, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "./firebase";

const AccountPage = ({ userData, updateUserData }) => {
  const { logout, userId } = useAuth();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");
  const [privacyOn, setPrivacyOn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [privacyInfo, setPrivacyInfo] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setName(userData.displayName || "");
      setAge(userData.age || "");
      setGender(userData.gender || "female");
      setPrivacyOn(userData.privacyEnabled || false);
    }
  }, [userData]);

  const togglePrivacy = async () => {
    // If turning privacy on, show info message
    if (!privacyOn) {
      setPrivacyInfo("Enabling enhanced privacy will anonymize your sleep data for research purposes. Your personal identifiers will be removed from research datasets.");
      setTimeout(() => {
        setPrivacyInfo("");
      }, 5000);
    }
    setPrivacyOn(!privacyOn);
  };

  // Function to anonymize existing sleep data
  const anonymizeExistingData = async () => {
    if (!userId) return;
    
    try {
      // Get all sleep records for this user
      const sleepQuery = query(
        collection(db, "sleep_records"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(sleepQuery);
      
      // For each record, create an anonymized version
      let count = 0;
      const anonymousId = `anon_${userId.substring(0, 8)}`;
      
      querySnapshot.forEach(async (document) => {
        try {
          const sleepData = document.data();
          
          // Create anonymized version
          const anonymizedData = {
            ...sleepData,
            userId: anonymousId,
            anonymized: true,
            // Round sleep duration to whole number
            sleepDuration: Math.round(sleepData.sleepDuration || 0),
            // Round sleep times to nearest 30 min
            sleepStart: sleepData.sleepStart ? roundTimeToHalfHour(sleepData.sleepStart) : '',
            sleepEnd: sleepData.sleepEnd ? roundTimeToHalfHour(sleepData.sleepEnd) : ''
          };
          
          // Add to anonymized collection
          await addDoc(collection(db, "anonymized_sleep_data"), anonymizedData);
          count++;
        } catch (error) {
          console.error("Error anonymizing record:", error);
        }
      });
      
      console.log(`Anonymized ${count} sleep records for user ${userId}`);
      setSuccessMessage(`Privacy enabled! ${count} sleep records have been anonymized.`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error anonymizing existing data:", error);
    }
  };
  
  // Helper function to round time to nearest 30 minutes
  const roundTimeToHalfHour = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      let roundedMinutes = Math.round(minutes / 30) * 30;
      let roundedHours = hours;
      
      if (roundedMinutes === 60) {
        roundedMinutes = 0;
        roundedHours = (hours + 1) % 24;
      }
      
      return `${roundedHours}:${roundedMinutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return timeStr; // Return original if parsing fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Only update fields that have changed
      const updates = {};
      
      if (name !== (userData?.displayName || "")) {
        updates.displayName = name;
      }
      
      if (age !== (userData?.age || "")) {
        updates.age = age ? parseInt(age) : null;
      }
      
      if (gender !== (userData?.gender || "female")) {
        updates.gender = gender;
      }
      
      const wasPrivacyEnabled = userData?.privacyEnabled || false;
      if (privacyOn !== wasPrivacyEnabled) {
        updates.privacyEnabled = privacyOn;
        
        // If privacy was just enabled, anonymize existing data
        if (privacyOn && !wasPrivacyEnabled) {
          anonymizeExistingData();
        }
      }
      
      if (Object.keys(updates).length > 0) {
        await updateUserData(updates);
        setSuccessMessage("Profile updated successfully!");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="account-page">
      <h1>My Account</h1>
      
      {/* Profile Summary */}
      <div className="profile-summary">
        <div className="profile-icon">
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

        <div className="profile-details">
          <h2>{userData?.displayName || "User"}</h2>
          <p>{userData?.email || "Guest User"}</p>
          <p className="points-display">
            <strong>{userData?.points || 0}</strong> points available
          </p>
        </div>
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {privacyInfo && (
        <div className="privacy-info-message">
          {privacyInfo}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Display Name</label>
          <input 
            type="text" 
            id="name" 
            className="input-field" 
            placeholder="Your Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        <div className="form-group">
      <label htmlFor="age">Age</label>
          <input 
            type="number" 
            id="age" 
            className="input-field" 
            placeholder="Your Age" 
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="form-group">
      <label htmlFor="gender">Gender</label>
          <select 
            id="gender" 
            className="dropdown"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={!isEditing}
          >
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="nonbinary">Nonbinary</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
      </select>
        </div>

      {/* Privacy Controls */}
        <div className="section">
      <h2>Privacy Controls</h2>
      <div className="privacy-setting">
            <span>Enhanced Privacy</span>
        <label className="switch">
              <input 
                type="checkbox" 
                checked={privacyOn} 
                onChange={togglePrivacy}
                disabled={!isEditing}
              />
          <span className="slider"></span>
        </label>
      </div>
          <p className="privacy-description">
            When enabled, your sleep data will be anonymized for research purposes. This helps protect your privacy while still contributing to sleep science.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="buttons-container">
          {isEditing ? (
            <>
              <button type="submit" className="button primary">
                Save Changes
              </button>
              <button 
                type="button" 
                className="button secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="button primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
          
          <button 
            type="button" 
            className="button logout"
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountPage;
