import React from "react";
import "./styles.css"; // Ensure the CSS file is imported
import { Link } from "react-router-dom"


const Pricing = () => {
  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          STREAM<span>VIBE</span>
        </div>
        <div className="nav-links">
          <Link to="/home">Home</Link> {/* Use Link component */}
          <Link to="/about">About</Link> {/* Use Link component */}
          <Link to="/home">Streams</Link> {/* Use Link component */}
          <Link to="/contact">Contact</Link> {/* Use Link component */}
        </div>
      </nav>

      <section className="content-section" style={{ marginTop: "80px" }}>
        <div className="container">
          <h1>Choose Your Plan</h1>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Basic</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">9.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features-list">
                <li>
                  <i className="fas fa-check"></i> 720p Streaming Quality
                </li>
                <li>
                  <i className="fas fa-check"></i> 1 Stream at a Time
                </li>
                <li>
                  <i className="fas fa-check"></i> Basic Chat Features
                </li>
                <li>
                  <i className="fas fa-check"></i> Ad-Supported
                </li>
              </ul>
              <button className="pricing-btn">Get Started</button>
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">19.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features-list">
                <li>
                  <i className="fas fa-check"></i> 1080p Streaming Quality
                </li>
                <li>
                  <i className="fas fa-check"></i> 3 Streams at a Time
                </li>
                <li>
                  <i className="fas fa-check"></i> Advanced Chat Features
                </li>
                <li>
                  <i className="fas fa-check"></i> Ad-Free Experience
                </li>
                <li>
                  <i className="fas fa-check"></i> Custom Emotes
                </li>
              </ul>
              <button className="pricing-btn">Get Started</button>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Premium</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">29.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features-list">
                <li>
                  <i className="fas fa-check"></i> 4K Streaming Quality
                </li>
                <li>
                  <i className="fas fa-check"></i> Unlimited Streams
                </li>
                <li>
                  <i className="fas fa-check"></i> Premium Chat Features
                </li>
                <li>
                  <i className="fas fa-check"></i> Ad-Free Experience
                </li>
                <li>
                  <i className="fas fa-check"></i> Custom Emotes & Badges
                </li>
                <li>
                  <i className="fas fa-check"></i> Priority Support
                </li>
              </ul>
              <button className="pricing-btn">Get Started</button>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/home">Home</Link> {/* Use Link component */}
            <Link to="/about">About Us</Link> {/* Use Link component */}
            <Link to="/rules">Rules</Link> {/* Use Link component */}
            <Link to="/legacy">Legacy</Link> {/* Use Link component */}
            <Link to="/pricing">Pricing</Link> {/* Use Link component */}
            <Link to="/contact">Contact</Link> {/* Use Link component */}
          </div>
          <div className="footer-section">
            <h3>Legal</h3>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="footer-section">
            <h3>Connect</h3>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 STREAMVIBE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;