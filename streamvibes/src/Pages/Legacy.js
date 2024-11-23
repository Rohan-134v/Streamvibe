import React from "react";
import "./styles.css";
import { Link } from "react-router-dom"

const Legacy = () => {
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
          <h1>Our Legacy</h1>
          <div className="team-grid">
            <div className="team-member">
              <img src="rithvik png.png" alt="Rithvik Matta" />
              <h3>Rithvik Rajesh Matta</h3>
              <p className="title">PES Electronic city campus</p>
              <p className="bio">SRN: PES2UG23CS485</p>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>

            <div className="team-member">
              <img src="rishi png.png" alt="Rishi A Sheth" />
              <h3>Rishi A Sheth</h3>
              <p className="title">PES Electronic city campus</p>
              <p className="bio">SRN: PES2UG23CS479</p>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>

            <div className="team-member">
              <img src="Rohan png.png" alt="Rohan Jogi Jogi" />
              <h3>Rohan Jogi</h3>
              <p className="title">PES Electronic city campus</p>
              <p className="bio">SRN: PES2UG23CS489</p>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
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

export default Legacy;