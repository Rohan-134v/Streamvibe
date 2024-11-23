import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'; // Ensure you use the updated CSS with scoped styles

const LoginSignup = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Control component visibility
  const navigate = useNavigate();

  const handleSwitch = () => {
    setIsSignUp(!isSignUp);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const response = await axios.post('http://localhost:4000/api/signup', { username, email, password, role });
        setMessage(response.data.message);
      } else {
        const response = await axios.post('http://localhost:4000/api/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        setMessage('Login successful');
        setIsAuthenticated(true);

        // Navigate and hide the component
        if (response.data.role === 'streamer') {
          navigate('/streamer');
        } else {
          navigate('/home');
        }
        setIsVisible(false); // Hide the component after navigation
      }
    } catch (err) {
      setMessage('Error during authentication');
    }
  };

  useEffect(() => {
    const container = document.querySelector('.login-container .container');
    if (isSignUp) {
      container.classList.add('right-panel-active');
    } else {
      container.classList.remove('right-panel-active');
    }

    // Cleanup to reset styles when component unmounts
    return () => {
      container.classList.remove('right-panel-active');
    };
  }, [isSignUp]);

  // Render null if the component is not visible
  if (!isVisible || isAuthenticated) return null;

  return (
    <div className="login-container">
      {/* Main Container */}
      <div className="container">
        <div className={`form-container ${isSignUp ? 'sign-up-container' : 'sign-in-container'}`}>
          <form onSubmit={handleSubmit}>
            <h1>{isSignUp ? 'Create Account' : 'Sign In'}</h1>
            <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>{isSignUp ? 'or use your email for registration' : 'or use your account'}</span>
            {isSignUp && <input type="text" placeholder="Name" value={username} onChange={(e) => setUsername(e.target.value)} required />}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {isSignUp && (
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="viewer">Viewer</option>
                <option value="streamer">Streamer</option>
              </select>
            )}
            {message && <p>{message}</p>}
            <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className={`overlay-panel overlay-left ${isSignUp ? 'active' : ''}`}>
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={handleSwitch}>Sign In</button>
            </div>
            <div className={`overlay-panel overlay-right ${!isSignUp ? 'active' : ''}`}>
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={handleSwitch}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
