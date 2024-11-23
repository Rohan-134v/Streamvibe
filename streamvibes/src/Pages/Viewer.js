import React, { useState, useRef, useEffect } from 'react';
import "./styles.css";
import { Link } from "react-router-dom";
import "./viewer.css"

const Viewer = () => {
  const [roomId, setRoomId] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const videoRef = useRef(null);
  const ws = useRef(null);
  const mediaSource = useRef(null);
  const sourceBuffer = useRef(null);
  const queue = useRef([]);

  const appendBuffer = () => {
    if (sourceBuffer.current && !sourceBuffer.current.updating && queue.current.length > 0) {
      try {
        const chunk = queue.current.shift();
        sourceBuffer.current.appendBuffer(chunk);
      } catch (error) {
        console.error('Error appending buffer:', error);
        document.getElementById('status').textContent = 'Error in buffering stream';
      }
    }
  };

  const handleWebSocketMessage = (event) => {
    const status = document.getElementById('status');
    if (typeof event.data === 'string') {
      const message = JSON.parse(event.data);
      if (message.type === 'no-stream') {
        status.textContent = 'No active stream';
      } else if (message.type === 'end-stream') {
        status.textContent = 'Stream ended';
        if (mediaSource.current && mediaSource.current.readyState === 'open') {
          mediaSource.current.endOfStream();
        }
      } else if (message.type === 'comment') {
        setComments((prev) => [...prev, message.comment]);
      }
    } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        if (mediaSource.current && mediaSource.current.readyState === 'open' && sourceBuffer.current) {
          queue.current.push(new Uint8Array(arrayBuffer));
          appendBuffer();
        } else {
          console.warn('SourceBuffer is unavailable or MediaSource is not open.');
          setTimeout(() => {
            if (mediaSource.current && mediaSource.current.readyState === 'open' && sourceBuffer.current) {
              queue.current.push(new Uint8Array(arrayBuffer));
              appendBuffer();
            }
          }, 1000); // Increase delay to 1000ms for retry
        }
      };
      reader.readAsArrayBuffer(event.data);
    }
  };

  const connectToStream = () => {
    if (!roomId) {
      alert('Enter a room ID!');
      return;
    }

    const status = document.getElementById('status');
    const videoElement = videoRef.current;

    ws.current = new WebSocket('wss://final-5sjc.onrender.com');
    mediaSource.current = new MediaSource();
    videoElement.src = URL.createObjectURL(mediaSource.current);

    ws.current.onopen = () => {
      status.textContent = 'Connected to server as viewer';
      ws.current.send(JSON.stringify({ type: 'viewer', roomId }));
    };

    ws.current.onmessage = (event) => handleWebSocketMessage(event);

    ws.current.onerror = () => {
      status.textContent = 'WebSocket error occurred';
    };

    ws.current.onclose = () => {
      status.textContent = 'Disconnected from server';
    };

    mediaSource.current.addEventListener('sourceopen', () => {
      if (!sourceBuffer.current) {
        sourceBuffer.current = mediaSource.current.addSourceBuffer('video/webm; codecs="vp8, opus"');

        sourceBuffer.current.addEventListener('updateend', () => appendBuffer());
        sourceBuffer.current.addEventListener('error', (e) => {
          console.error('SourceBuffer Error:', e);
          status.textContent = 'Error in buffering stream';
        });
      }
    });
  };

  const sendComment = () => {
    if (!comment.trim()) return;
    ws.current?.send(JSON.stringify({ type: 'comment', roomId, comment }));
    setComments((prev) => [...prev, comment]);
    setComment('');
  };

  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
      if (mediaSource.current) mediaSource.current = null;
      if (sourceBuffer.current) sourceBuffer.current = null;
      queue.current = [];
    };
  }, []);

  return (
    <div>
       <nav className="navbar">
        <div className="logo">
          STREAM<span>VIBE</span>
        </div>
        <div className="nav-links">
          <Link to="/streamer">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </nav>
      <section className='hero'>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={connectToStream}>Connect to Stream</button>

      <div>
        <video id="video" ref={videoRef} autoPlay playsInline controls />
      </div>
      <p id="status"></p>

      <div className="comments-section">
        <h3>Comments</h3>
        <div className="comments-list">
          {comments.map((c, idx) => (
            <p key={idx}>{c}</p>
          ))}
        </div>
        <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={sendComment}>Send</button>
      </div>
      </section>
      <footer>
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
      </footer>
    </div>
  );
};

export default Viewer;
