import React from "react";
import { Link } from "react-router-dom"
import "./styles.css"; // Import your CSS file

const Contact = () => {
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
          <h1>Contact Us</h1>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="info-card">
                <i className="fas fa-map-marker-alt"></i>
                <h3>Address</h3>
                <p>
                  PES University
                  <br />
                  Electronic City
                  <br />
                  Bangalore, India
                </p>
              </div>
              <div className="info-card">
                <i className="fas fa-phone"></i>
                <h3>Phone</h3>
                <p>xxxxxxxxxx</p>
              </div>
              <div className="info-card">
                <i className="fas fa-envelope"></i>
                <h3>Email</h3>
                <p>support@streamvibe.com</p>
              </div>
              <div className="info-card">
                <i className="fas fa-clock"></i>
                <h3>Support Hours</h3>
                <p>24/7 Customer Support</p>
              </div>
            </div>

            <div className="contact-form-container">
              <form className="contact-form">
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Subject" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" required rows="6"></textarea>
                </div>
                <button type="submit">Send Message</button>
              </form>
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

export default Contact;