import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css"; // Ensure the CSS file is imported

const streams = [
  {
    title: 'Gaming Marathon',
    streamer: 'ProGamer123',
    viewers: 1500,
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Gaming',
    url: '/room/12345',
    roomId: '12345'
  },
  {
    title: 'Live Music Session',
    streamer: 'MusicMaster',
    viewers: 800,
    thumbnail: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Music',
    url: '/room/67890',
    roomId: '67890'
  },
  {
    title: 'Tech Talk Show',
    streamer: 'TechGuru',
    viewers: 1200,
    thumbnail: 'https://images.unsplash.com/photo-1496065187959-7f07b8353c55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Talk Shows',
    url: '/room/11223',
    roomId: '11223'
  }
];

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    populateStreams();

    // Stream filters
    const filterButtons = document.querySelectorAll('.stream-filters button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        populateStreams(button.textContent);
      });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  const populateStreams = (category = 'All') => {
    const streamsGrid = document.querySelector('.streams-grid');
    streamsGrid.innerHTML = '';

    const filteredStreams = category === 'All'
      ? streams
      : streams.filter(stream => stream.category === category);

    filteredStreams.forEach(stream => {
      const streamCard = document.createElement('div');
      streamCard.className = 'stream-card';
      streamCard.style.cursor = 'pointer';

      // Use template literals with backticks
      streamCard.innerHTML = `
        <img src="${stream.thumbnail}" alt="${stream.title}">
        <div class="stream-info">
          <h3>${stream.title}</h3>
          <p>Streamer: ${stream.streamer}</p>
          <p>Viewers: ${stream.viewers}</p>
          <p>Room ID: ${stream.roomId}</p>
        </div>
      `;

      streamCard.addEventListener('click', () => {
        navigate(stream.url); // Navigate to the specific room page
      });

      streamsGrid.appendChild(streamCard);
    });
  };

  return (
    <div>
      <header>
        <nav className="navbar">
          <div className="logo">
            STREAM<span>VIBE</span>
          </div>
          <div className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/home">Streams</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Stream. Watch. Connect.</h1>
          <p>The Vibe is Here</p>
          <div className="cta-buttons">
            <Link to="/viewer" className="watch-btn">Watch Live</Link>
          </div>
        </div>
      </section>

      <section id="streams" className="streams-section">
        <h2>Popular Streams</h2>
        <div className="stream-filters">
          <button className="active">All</button>
          <button>Gaming</button>
          <button>Music</button>
          <button>Talk Shows</button>
        </div>
        <div className="streams-grid">
          {/* Stream cards will be populated dynamically */}
        </div>
      </section>

      <div className="footer-content">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/home">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/rules">Rules</Link>
          <Link to="/legacy">Legacy</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
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
    </div>
  );
};

export default Home;