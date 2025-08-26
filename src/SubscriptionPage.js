import React from "react";
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import "./SubscriptionPage.css";
const SubscriptionPage = () => {
  return (
    <main className="subscription-page">
      <h2 id="choose-plan">Choose Your Subscription Plan</h2>
      
      <div className="subscription-plan">
        <h3>Free Trial</h3>
        <p><strong>Duration:</strong> 14 days</p>
        <p><strong>Features:</strong></p>
        <ul>
          <li><FaCheckCircle /> Track your sleep hours and stages</li>
          <li><FaCheckCircle /> Limited access to educational resources</li>
          <li><FaCheckCircle /> Limited goal setting with AI suggestions</li>
        </ul>
        <p><strong>Price:</strong> Free</p>
        <Link to="/account" className="subscribe-btn">Start Free Trial</Link>
      </div>

      <div className="subscription-plan">
        <h3>Basic Plan</h3>
        <p><strong>Duration:</strong> Monthly</p>
        <p><strong>Price:</strong> $4.99/month</p>
        <p><strong>Features:</strong></p>
        <ul>
          <li><FaCheckCircle /> Full sleep tracking features</li>
          <li><FaCheckCircle /> Personalized sleep goals</li>
          <li><FaCheckCircle /> Access to basic educational content</li>
          <li><FaCheckCircle /> Earn reward points</li>
        </ul>
        <Link to="/account" className="subscribe-btn">Subscribe Now</Link>
      </div>

      <div className="subscription-plan">
        <h3>Premium Plan</h3>
        <p><strong>Duration:</strong> Monthly / Yearly</p>
        <p><strong>Price:</strong> $9.99/month or $99.99/year</p>
        <p><strong>Features:</strong></p>
        <ul>
          <li><FaCheckCircle /> Advanced sleep tracking & insights</li>
          <li><FaCheckCircle /> Full educational resources</li>
          <li><FaCheckCircle /> Access to all guided sleep exercises</li>
          <li><FaCheckCircle /> Higher reward points earning</li>
          <li><FaCheckCircle /> Premium books and resources available for points</li>
        </ul>
        <Link to="/account" className="subscribe-btn">Subscribe Now</Link>
      </div>

      <div className="subscription-plan">
        <h3>Family Plan</h3>
        <p><strong>Duration:</strong> Monthly / Yearly</p>
        <p><strong>Price:</strong> $14.99/month or $149.99/year</p>
        <p><strong>Features:</strong></p>
        <ul>
          <li><FaCheckCircle /> All Premium Plan features for up to 5 users</li>
          <li><FaCheckCircle /> Shared sleep data and goals for family members</li>
        </ul>
        <Link to="/account" className="subscribe-btn">Subscribe Now</Link>
      </div>
    </main>
  );
};

export default SubscriptionPage;
