import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';
import './streamer.css';
const Streamer = () => {
  const [roomId, setRoomId] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [comments, setComments] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [status, setStatus] = useState('');
  const ws = useRef(null);
  const mediaRecorder = useRef(null);
  const videoRef = useRef(null);

  const initializeWebSocket = () => {
    if (!ws.current) {
      ws.current = new WebSocket('wss://final-5sjc.onrender.com');

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setStatus('Connected to server as streamer');
        ws.current.send(JSON.stringify({ type: 'streamer', roomId }));
        setIsStreaming(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'comment') {
            setComments((prev) => [
              ...prev,
              {
                viewerId: data.viewerId?.trim() || 'Anonymous', // Default to 'Anonymous' if undefined or empty
                message: data.message?.trim() || '', // Avoid empty messages
              },
            ]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      

      ws.current.onclose = () => {
        console.warn('WebSocket closed');
        setStatus('Disconnected from server');
        setIsStreaming(false);
      };

      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setStatus('WebSocket error occurred');
      };
    }
  };

  const startStream = async () => {
    if (!roomId.trim()) {
      alert('Enter a room ID!');
      return;
    }
    initializeWebSocket();
  };

  const startSharing = async (getStreamFn, label) => {
    setStatus(`${label} starting...`);
    try {
      const mediaStream = await getStreamFn();
      setLocalStream(mediaStream);

      // Display local stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const tracks = mediaStream.getTracks();

      // Start MediaRecorder for video and/or audio
      mediaRecorder.current = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm; codecs=vp8,opus', // Supports video and audio
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(event.data);
        }
      };

      mediaRecorder.current.start(100); // Send chunks every 100ms

      tracks.forEach((track) => {
        track.onended = () => {
          stopStream();
          setStatus(`${label} ended`);
        };
      });

      setIsStreaming(true);
    } catch (err) {
      console.error(`Error starting ${label.toLowerCase()}:`, err);
      setStatus(`Failed to start ${label.toLowerCase()}`);
    }
  };

  const startScreenSharing = () => {
    startSharing(() =>
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }), // Include audio for screen sharing
      'Screen sharing'
    );
  };

  const startCameraSharing = () => {
    startSharing(() =>
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }), // Include audio for camera sharing
      'Camera sharing'
    );
  };

  const stopStream = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    setIsStreaming(false);
    setStatus('Stream stopped');
  };

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopStream();
      ws.current?.close();
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

      <section className="hero">
        <div className="streamer-content">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={startStream}>Start Streaming</button>
        </div>

        {isStreaming && (
          <div className="stream-section">
            <div className="video-container">
              <video
                ref={videoRef}
                className="video-preview"
                autoPlay
                muted
                style={{ width: '100%', border: '1px solid #ccc' }}
              ></video>
            </div>
            <div className="control-buttons">
              <button onClick={startScreenSharing}>Start Screen Share</button>
              <button onClick={startCameraSharing}>Start Camera Share</button>
              <button onClick={stopStream}>Stop Streaming</button>
            </div>
            <div className="comment-section">
              <h3>Live Comments</h3>
              <div className="comments-list">
                {comments.map((comment, index) => (
                  <p key={index} className="comment">
                    <strong>{comment.viewerId}:</strong> {comment.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
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
            <Link to="#">Terms of Service</Link>
            <Link to="#">Privacy Policy</Link>
          </div>
          <div className="footer-section">
            <h3>Connect</h3>
            <div className="social-links">
              <Link to="#">
                <i className="fab fa-facebook"></i>
              </Link>
              <Link to="#">
                <i className="fab fa-twitter"></i>
              </Link>
              <Link to="#">
                <i className="fab fa-instagram"></i>
              </Link>
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

export default Streamer;
