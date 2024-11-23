import React from 'react';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Legacy from './Pages/Legacy';
import Pricing from './Pages/Pricing';
import Rules from './Pages/Rules';
import OtherPage from './Pages/OtherPage';
import Home from './Pages/Index';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './Pages/styles.css';
import Streamer from './Pages/Streamer';
import Viewer from'./Pages/Viewer';
import Login from './Pages/LoginSignup';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home/>}/>
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/legacy" element={<Legacy/>} />
        <Route path="/pricing" element={<Pricing/>} />
        <Route path="/page2" element={<OtherPage/>} />
        <Route path="/rules" element={<Rules/>} />
        <Route path="/streamer" element={<Streamer/>} />
        <Route path="/viewer" element={<Viewer/>} />
        <Route path="/" element={<Login/>} />
      </Routes>
    </Router>
    );
  }

export default App;
