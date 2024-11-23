import React from "react";
import "./styles.css"; // Ensure the CSS file is imported
import { Link } from "react-router-dom"


const Rules = () => {
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
          <h1>Rules of Streaming</h1>
          <div className="rules-grid">
            <div className="rule-card">
              <i className="fas fa-shield-alt"></i>
              <h3>Content Guidelines</h3>
              <ul>
                <li>No explicit or adult content</li>
                <li>No hate speech or discrimination</li>
                <li>No copyrighted material without permission</li>
                <li>Family-friendly content is encouraged</li>
              </ul>
            </div>

            <div className="rule-card">
              <i className="fas fa-comments"></i>
              <h3>Chat Rules</h3>
              <ul>
                <li>Be respectful to others</li>
                <li>No spamming or flooding</li>
                <li>No harassment or bullying</li>
                <li>Keep discussions civil</li>
              </ul>
            </div>

            <div className="rule-card">
              <i className="fas fa-video"></i>
              <h3>Technical Requirements</h3>
              <ul>
                <li>Minimum 720p stream quality</li>
                <li>Stable internet connection</li>
                <li>Proper audio setup</li>
                <li>Regular streaming schedule</li>
              </ul>
            </div>

            <div className="rule-card">
              <i className="fas fa-user-shield"></i>
              <h3>Account Security</h3>
              <ul>
                <li>Use strong passwords</li>
                <li>Enable two-factor authentication</li>
                <li>Don't share account credentials</li>
                <li>Report suspicious activity</li>
              </ul>
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

export default Rules;