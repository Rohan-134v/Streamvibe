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
  const [errorMessage, setErrorMessage] = useState(''); // For user-friendly error messages
  const [yourWsId, setYourWsId] = useState(null); // To store the streamer's own WebSocket ID

  const ws = useRef(null);
  const videoRef = useRef(null);
  // Map to hold RTCPeerConnection for each connected viewer
  const peerConnections = useRef(new Map()); // Map<viewerWsId, RTCPeerConnection>

  // Helper to send JSON messages via WebSocket
  const sendWebSocketMessage = (type, payload) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = { type, ...payload, senderWsId: yourWsId }; // Always include senderWsId
      ws.current.send(JSON.stringify(message));
      console.log(`Sent WS message: ${type}`, message);
    } else {
      console.warn('WebSocket not open. Message not sent:', type, payload);
      setStatus('WebSocket not connected. Please try again.');
    }
  };

  // Function to create and configure a new RTCPeerConnection for a viewer
  const createPeerConnection = (viewerWsId) => {
    console.log(`Creating new RTCPeerConnection for viewer: ${viewerWsId}`);
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Google's public STUN server
      ],
    });

    // Add local stream tracks to the peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
      console.log(`Added local stream tracks to PC for viewer: ${viewerWsId}`);
    } else {
      console.warn(`No local stream available when creating PC for viewer: ${viewerWsId}`);
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebSocketMessage('candidate', {
          roomId,
          candidate: event.candidate,
          targetWsId: viewerWsId, // Send candidate to this specific viewer
        });
      }
    };

    // Handle ICE connection state changes for debugging
    pc.oniceconnectionstatechange = () => {
      console.log(`PC for ${viewerWsId} ICE connection state: ${pc.iceConnectionState}`);
    };

    // Store the peer connection
    peerConnections.current.set(viewerWsId, pc);
    return pc;
  };

  // Initialize WebSocket connection and handle messages
  const initializeWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected.');
      return;
    }

    ws.current = new WebSocket('wss://ws-server-cgd7.onrender.com'); // Replace with your Render WebSocket URL

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setStatus('Connected to server as streamer');
      // Send initial message to identify as streamer and join room
      sendWebSocketMessage('streamer', { roomId });
    };

    ws.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WS message:', data.type, data);

        switch (data.type) {
          case 'connection-info': // Server sends this to provide own ws.id
            setYourWsId(data.yourWsId);
            console.log(`Streamer's WebSocket ID: ${data.yourWsId}`);
            break;

          case 'comment':
            setComments((prev) => [
              ...prev,
              {
                viewerId: data.viewerId?.trim() || 'Anonymous',
                message: data.message?.trim() || '',
              },
            ]);
            break;

          case 'viewer-joined':
            // A new viewer has joined, create a new RTCPeerConnection for them
            const newViewerWsId = data.viewerWsId;
            const pc = createPeerConnection(newViewerWsId);

            // Create an offer for the new viewer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendWebSocketMessage('offer', {
              roomId,
              sdp: pc.localDescription,
              targetWsId: newViewerWsId, // Send offer to this specific viewer
            });
            console.log(`Sent offer to new viewer: ${newViewerWsId}`);
            break;

          case 'answer':
            // Received an answer from a viewer
            const answerPc = peerConnections.current.get(data.senderWsId);
            if (answerPc && answerPc.remoteDescription?.type !== 'answer') {
              await answerPc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              console.log(`Received and set answer from viewer: ${data.senderWsId}`);
            } else {
              console.warn(`No PC found or already has remote description for answer from ${data.senderWsId}`);
            }
            break;

          case 'candidate':
            // Received an ICE candidate from a viewer
            const candidatePc = peerConnections.current.get(data.senderWsId);
            if (candidatePc) {
              try {
                await candidatePc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log(`Added ICE candidate from viewer: ${data.senderWsId}`);
              } catch (e) {
                console.error('Error adding received ICE candidate:', e);
              }
            } else {
              console.warn(`No PC found for candidate from ${data.senderWsId}`);
            }
            break;

          case 'stream-ended': // Server tells viewers to end stream, but streamer might get it too
            console.log('Stream ended by server or streamer disconnection.');
            stopStream();
            setStatus('Stream ended by streamer.');
            break;

          case 'disconnect':
            console.log('Server requested disconnection:', data.reason);
            stopStream();
            ws.current?.close();
            setStatus('Disconnected: ' + data.reason);
            break;

          case 'error':
            console.error('Server error:', data.message);
            setErrorMessage(`Server Error: ${data.message}`);
            break;

          default:
            console.warn('Unknown message type received from server:', data.type);
        }
      } catch (error) {
        // This catch block is for JSON parsing errors, binary data is handled by WebRTC
        console.error('Error parsing WebSocket message as JSON:', error);
        setErrorMessage('Received malformed message from server.');
      }
    };

    ws.current.onclose = () => {
      console.warn('WebSocket closed');
      setStatus('Disconnected from server');
      setIsStreaming(false);
      // Clean up all peer connections on WS close
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      setYourWsId(null);
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setStatus('WebSocket error occurred');
      setErrorMessage('WebSocket connection error. Check console for details.');
    };
  };

  // Starts the WebSocket connection and identifies as a streamer
  const startStream = async () => {
    if (!roomId.trim()) {
      setErrorMessage('Please enter a room ID to start streaming.');
      return;
    }
    setErrorMessage(''); // Clear previous errors
    await initializeWebSocket(); // Ensure WebSocket is ready
  };


  // Starts sharing camera or screen, and adds tracks to all existing peer connections
  const startSharing = async (getStreamFn, label) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setErrorMessage('Please connect to the server first by clicking "Start Streaming".');
      return;
    }

    setStatus(`${label} starting...`);
    setErrorMessage('');
    try {
      const mediaStream = await getStreamFn();
      setLocalStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Add tracks to all existing peer connections
      peerConnections.current.forEach(pc => {
        // Remove existing tracks if any, to avoid duplicates when switching sources
        pc.getSenders().forEach(sender => {
          if (sender.track) {
            pc.removeTrack(sender);
          }
        });
        // Add new tracks
        mediaStream.getTracks().forEach(track => {
          pc.addTrack(track, mediaStream);
        });
      });

      // Handle track ending (e.g., user stops screen sharing from browser UI)
      mediaStream.getTracks().forEach((track) => {
        track.onended = () => {
          console.log(`${label} track ended.`);
          // Optionally, notify viewers or reset stream state
          stopStream(); // Or just stop sharing this specific track
          setStatus(`${label} ended.`);
        };
      });

      setIsStreaming(true);
      setStatus(`${label} active.`);
    } catch (err) {
      console.error(`Error starting ${label.toLowerCase()}:`, err);
      setErrorMessage(`Failed to start ${label.toLowerCase()}: ${err.message}`);
      setStatus(`Failed to start ${label.toLowerCase()}`);
    }
  };

  const startScreenSharing = () => {
    startSharing(() =>
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }),
      'Screen sharing'
    );
  };

  const startCameraSharing = () => {
    startSharing(() =>
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }),
      'Camera sharing'
    );
  };

  const stopStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Close all active peer connections
    peerConnections.current.forEach(pc => {
      pc.close();
      console.log(`Closed RTCPeerConnection for viewer.`);
    });
    peerConnections.current.clear(); // Clear the map

    // If WebSocket is open, notify server about stream end
    if (ws.current?.readyState === WebSocket.OPEN) {
      sendWebSocketMessage('stream-ended', { roomId }); // Inform server stream has ended
    }

    setIsStreaming(false);
    setStatus('Stream stopped');
    setErrorMessage('');
  };

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopStream(); // Stop media and close peer connections
      ws.current?.close(); // Close WebSocket
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
            disabled={isStreaming} // Disable input once streaming starts
          />
          <button onClick={startStream} disabled={isStreaming}>
            Start Streaming
          </button>
          {status && <p className="status-message">{status}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>

        {isStreaming && (
          <div className="stream-section">
            <div className="video-container">
              <video
                ref={videoRef}
                className="video-preview"
                autoPlay
                muted // Streamer's own preview should be muted
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
