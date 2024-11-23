import React from "react";
import { Link } from 'react-router-dom'; // Import Link component
import "./styles.css"; // Import your CSS file

const About = () => {
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
          <h1>About STREAMVIBE</h1>
          <div className="about-content">
            <div className="mission-vision">
              <div className="mission">
                <h2>
                  <i className="fas fa-bullseye"></i> Our Mission
                </h2>
                <p>
                  To create a vibrant streaming community where creators and
                  viewers can connect, share, and grow together in a safe and
                  engaging environment.
                </p>
              </div>
              <div className="vision">
                <h2>
                  <i className="fas fa-eye"></i> Our Vision
                </h2>
                <p>
                  To become the world's leading platform for interactive live
                  streaming, fostering meaningful connections and empowering
                  content creators globally.
                </p>
              </div>
            </div>

            <div className="values">
              <h2>Our Core Values</h2>
              <div className="values-grid">
                <div className="value-card">
                  <i className="fas fa-heart"></i>
                  <h3>Community First</h3>
                  <p>We prioritize building and nurturing our community above all else.</p>
                </div>
                <div className="value-card">
                  <i className="fas fa-lock"></i>
                  <h3>Trust & Safety</h3>
                  <p>We ensure a secure environment for all our users.</p>
                </div>
                <div className="value-card">
                  <i className="fas fa-lightbulb"></i>
                  <h3>Innovation</h3>
                  <p>We continuously evolve and improve our platform.</p>
                </div>
                <div className="value-card">
                  <i className="fas fa-hands-helping"></i>
                  <h3>Support</h3>
                  <p>We provide comprehensive support to our creators and viewers.</p>
                </div>
              </div>
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

export default About;
