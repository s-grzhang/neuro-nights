import React from 'react';
import './PrivacyPolicy.css';
import { FaTimes } from 'react-icons/fa';

const PrivacyPolicy = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="privacy-overlay" onClick={(e) => {
      // Close the modal when clicking outside
      if (e.target.className === 'privacy-overlay') onClose();
    }}>
      <div className="privacy-modal">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>Privacy Policy</h2>
        
        <div className="privacy-content">
          <h3>Introduction</h3>
          <p>
            Welcome to NeuroNights. We are committed to protecting your privacy and handling your data with transparency.
            This Privacy Policy explains how we collect, use, and share your personal information.
          </p>
          
          <h3>Information We Collect</h3>
          <p>
            We collect the following types of information:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Email address, password, age group, and gender.</li>
            <li><strong>Sleep Data:</strong> Information about your sleep patterns, duration, and habits.</li>
            <li><strong>App Usage:</strong> How you interact with our application and features.</li>
          </ul>
          
          <h3>How We Use Your Information</h3>
          <p>
            Your data will be used for:
          </p>
          <ul>
            <li>Providing personalized sleep recommendations and insights.</li>
            <li>Improving our sleep goal recommender AI system.</li>
            <li>Enhancing the functionality and user experience of the app.</li>
            <li>Account management and authentication.</li>
          </ul>
          
          <h3>Data Sharing</h3>
          <p>
            <strong>Your data will be shared with the sleep goals recommender AI</strong> to provide personalized recommendations. 
            This AI system analyzes your sleep patterns and preferences to suggest optimal sleep goals.
          </p>
          <p>
            We do not sell your personal information to third parties. However, we may share anonymized, aggregated data 
            for research purposes to improve our sleep science knowledge base.
          </p>
          
          <h3>Data Security</h3>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access
            or disclosure. However, no internet transmission is completely secure, and we cannot guarantee the security
            of information transmitted through our platform.
          </p>
          
          <h3>Your Rights</h3>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Object to certain data processing activities</li>
          </ul>
          
          <h3>Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h3>Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@neuronights.com.
          </p>
          
          <p className="last-updated">Last Updated: November 18, 2023</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 