const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

// Initialize express app
const app = express();
// Create an HTTP server that Express will use, and also the WebSocket server
const server = http.createServer(app);

// Enable CORS for all origins and JSON parsing for Express routes
app.use(cors());
app.use(express.json());

// WebSocket server initialized with the HTTP server
const wss = new WebSocket.Server({ server });

// --- MongoDB Setup ---
// IMPORTANT: Use environment variable for MongoDB URI for security and deployment flexibility.
// Set MONGO_URI as an environment variable in your deployment environment (e.g., Render).
const MONGO_URI = process.env.MONGO_URI;

// Exit if MONGO_URI is not set, crucial for robust deployment
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not set.');
  console.error('Please set it to your MongoDB connection string in your hosting environment.');
  process.exit(1); // Exit the process if the essential configuration is missing
}

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  // useNewUrlParser and useUnifiedTopology are deprecated and no longer needed in Mongoose 6.x+
  // They are removed here to prevent deprecation warnings.
})
.then(() => console.log('✅ Connected to MongoDB successfully!'))
.catch(err => {
  console.error('❌ Could not connect to MongoDB:', err.message);
  console.error('Please check your MONGO_URI environment variable and MongoDB Atlas network access settings.');
  process.exit(1); // Exit process on database connection failure
});

// MongoDB Schema for Rooms
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  streamer: { type: String, default: null }, // Store streamer ID if needed, or just presence
  comments: [
    {
      viewerId: String,
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

const Room = mongoose.model('Room', roomSchema);

// Clients object for tracking WebSocket connections
// Using Maps for efficient lookup of streamers and viewers by roomId
const clients = {
  streamers: new Map(), // Tracks active streamers by roomId: Map<roomId, WebSocket>
  viewers: new Map(),   // Tracks active viewers by roomId: Map<roomId, Set<WebSocket>>
  allConnections: new Map(), // Map<wsId, WebSocket> for direct lookup by unique ID
};

// Function to send JSON data to a specific client WebSocket
function sendJSON(client, data) {
  if (client && client.readyState === WebSocket.OPEN) {
    try {
      client.send(JSON.stringify(data));
      console.log(`Sent JSON message of type '${data.type}' to client ID: ${client.id || 'unknown'}`);
    } catch (error) {
      console.error(`Error sending JSON message to client ID: ${client.id || 'unknown'}:`, error);
    }
  } else {
    console.warn(`Attempted to send JSON to a non-open or non-existent client: ${client ? client.id : 'null'}`);
  }
}

// Function to broadcast binary data (e.g., video/audio) to all viewers in a specific room
function broadcastBinaryToViewers(roomId, binaryData) {
  const viewersInRoom = clients.viewers.get(roomId);
  if (viewersInRoom) {
    viewersInRoom.forEach((viewer) => {
      if (viewer.readyState === WebSocket.OPEN) {
        viewer.send(binaryData); // Forward binary data directly
      }
    });
    console.log(`Broadcasted binary data to ${viewersInRoom.size} viewers in room ${roomId}.`);
  } else {
    console.log(`No viewers to broadcast binary data to in room ${roomId}.`);
  }
}

// WebSocket connection handling logic
wss.on('connection', (ws) => {
  // Assign a unique ID to each WebSocket connection
  ws.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  clients.allConnections.set(ws.id, ws); // Store all active connections by ID

  console.log(`New client connected with ID: ${ws.id}`);

  // Store the room ID associated with this WebSocket for easier cleanup on disconnect
  let currentRoomId = null;
  let isStreamer = false;

  ws.on('message', async (message) => {
    try {
      // Attempt to parse the message as JSON. If it fails, it's likely binary data.
      const data = JSON.parse(message);
      const { type, roomId, viewerId, message: commentMessage, targetWsId, sdp, candidate, streamId } = data;

      // Validate roomId for all messages that require it
      if (roomId) {
        currentRoomId = roomId; // Store roomId for this connection
      } else if (['streamer', 'viewer', 'comment', 'offer', 'answer', 'candidate'].includes(type)) {
        console.error(`Received message of type '${type}' without roomId from client ID: ${ws.id}. Message:`, data);
        sendJSON(ws, { type: 'error', message: 'roomId is required for this message type.' });
        return;
      }

      switch (type) {
        case 'streamer':
          // Handle streamer connections
          isStreamer = true;
          if (clients.streamers.has(roomId)) {
            // Disconnect existing streamer if a new one connects to the same room
            const existingStreamer = clients.streamers.get(roomId);
            console.log(`Streamer already exists for room ${roomId} (ID: ${existingStreamer.id}). Disconnecting old streamer.`);
            sendJSON(existingStreamer, { type: 'disconnect', reason: 'New streamer connected to this room.' });
            existingStreamer.close(); // Close the old connection
          }
          clients.streamers.set(roomId, ws); // Register new streamer
          console.log(`Streamer ID: ${ws.id} connected to room ${roomId}.`);

          // Ensure the room exists in the database or create it
          let room = await Room.findOne({ roomId });
          if (!room) {
            room = new Room({ roomId, streamer: null }); // Streamer ID can be added here if authenticated
            await room.save();
            console.log(`Created new room: ${roomId} in DB.`);
          } else {
            // Optionally update streamer field in room if you track it
            // room.streamer = someStreamerId;
            // await room.save();
          }

          // Notify existing viewers in the room that a stream has started/restarted
          const viewersInRoom = clients.viewers.get(roomId);
          if (viewersInRoom) {
            viewersInRoom.forEach(viewer => sendJSON(viewer, { type: 'stream-started', roomId }));
            console.log(`Notified ${viewersInRoom.size} existing viewers in room ${roomId} about streamer connection.`);
          }
          break;

        case 'viewer':
          // Handle viewer connections
          if (!clients.streamers.has(roomId)) {
            sendJSON(ws, { type: 'no-stream', message: 'No active stream in this room.' });
            console.log(`Viewer ID: ${ws.id} tried to connect to room ${roomId} but no streamer is active.`);
            // Do not add viewer to map if no stream is active
          } else {
            if (!clients.viewers.has(roomId)) {
              clients.viewers.set(roomId, new Set());
            }
            clients.viewers.get(roomId).add(ws); // Add viewer to the set for this room
            console.log(`Viewer ID: ${ws.id} connected to room ${roomId}. Total viewers in room: ${clients.viewers.get(roomId).size}`);
            sendJSON(ws, { type: 'stream-active', roomId }); // Confirm stream is active

            // IMPORTANT: Instruct the streamer to create an offer for this new viewer
            const streamer = clients.streamers.get(roomId);
            if (streamer) {
              sendJSON(streamer, { type: 'viewer-joined', viewerWsId: ws.id, roomId });
              console.log(`Instructed streamer ID: ${streamer.id} in room ${roomId} to send offer to new viewer ID: ${ws.id}`);
            }
          }
          break;

        case 'comment':
          // Handle comments from viewers
          if (!viewerId || !commentMessage) {
            sendJSON(ws, { type: 'error', message: 'viewerId and message are required for comments.' });
            return;
          }
          console.log(`Received comment in room ${roomId} from ${viewerId}: "${commentMessage}"`);

          // Save comment to database
          await Room.updateOne(
            { roomId },
            { $push: { comments: { viewerId, message: commentMessage } } }
          );

          // Forward comment to the streamer
          const streamerForComment = clients.streamers.get(roomId);
          if (streamerForComment) {
            sendJSON(streamerForComment, { type: 'comment', viewerId, message: commentMessage, timestamp: Date.now() });
          }

          // Optionally, broadcast comments to all viewers in the room as well
          const currentViewers = clients.viewers.get(roomId);
          if (currentViewers) {
            currentViewers.forEach(viewer => {
              if (viewer !== ws) { // Don't send back to the sender
                sendJSON(viewer, { type: 'comment', viewerId, message: commentMessage, timestamp: Date.now() });
              }
            });
          }
          break;

        case 'offer':
        case 'answer':
        case 'candidate':
          // Handle WebRTC signaling messages
          // All WebRTC signaling messages should have a 'targetWsId' (the recipient's WebSocket ID)
          // The sender's ID (ws.id) is implicitly known.
          if (!targetWsId) {
            console.warn(`WebRTC message type '${type}' received from client ID: ${ws.id} without a targetWsId.`);
            sendJSON(ws, { type: 'error', message: `WebRTC message '${type}' requires a targetWsId.` });
            return;
          }

          const targetClient = clients.allConnections.get(targetWsId);

          if (targetClient) {
            // Forward the WebRTC message to the target client
            // Include the original sender's ID so the target knows who to respond to
            sendJSON(targetClient, {
              type,
              roomId,
              senderWsId: ws.id, // The ID of the client who sent this message
              sdp, // For 'offer' and 'answer'
              candidate, // For 'candidate'
              streamId // If you are passing stream IDs
            });
            console.log(`Relayed WebRTC '${type}' from client ID: ${ws.id} to client ID: ${targetWsId} in room ${roomId}.`);
          } else {
            console.warn(`Target client ID: ${targetWsId} not found for WebRTC '${type}' from client ID: ${ws.id} in room ${roomId}.`);
            sendJSON(ws, { type: 'error', message: `Target client ID: ${targetWsId} not found for WebRTC message.` });
          }
          break;

        default:
          console.warn(`Unknown JSON message type received from client ID: ${ws.id}: '${type}'. Full data:`, data);
          sendJSON(ws, { type: 'error', message: `Unknown message type: ${type}` });
      }
    } catch (error) {
      // If JSON.parse fails, it's likely binary data (e.g., video/audio stream)
      // Identify the sender's room and broadcast the binary data to viewers.
      const senderRoomId = Array.from(clients.streamers.entries()).find(([, client]) => client === ws)?.[0];

      if (senderRoomId) {
        broadcastBinaryToViewers(senderRoomId, message); // Relay binary data
      } else {
        console.warn(`Received unparseable message (likely binary) from unknown source or non-streamer (ID: ${ws.id}). Error: ${error.message}`);
      }
    }
  });

  // Handle WebSocket disconnection
  ws.on('close', () => {
    console.log(`Client ID: ${ws.id} disconnected.`);
    clients.allConnections.delete(ws.id); // Clean up from allConnections map

    if (currentRoomId) {
      if (isStreamer) {
        clients.streamers.delete(currentRoomId);
        console.log(`Streamer ID: ${ws.id} disconnected from room ${currentRoomId}. Notifying viewers.`);
        // Notify all viewers in the room that the stream has ended
        // Send JSON message to viewers to end stream, not binary
        broadcastBinaryToViewers(currentRoomId, JSON.stringify({ type: 'stream-ended', roomId: currentRoomId, message: 'Streamer disconnected.' }));
        // Optionally, clear all viewers for this room if the stream truly ends
        clients.viewers.delete(currentRoomId);
      } else {
        const viewersInRoom = clients.viewers.get(currentRoomId);
        if (viewersInRoom) {
          viewersInRoom.delete(ws);
          if (viewersInRoom.size === 0) {
            clients.viewers.delete(currentRoomId); // Clean up empty viewer set
            console.log(`All viewers disconnected from room ${currentRoomId}. Viewer map cleaned.`);
          }
          console.log(`Viewer ID: ${ws.id} disconnected from room ${currentRoomId}. Remaining viewers: ${viewersInRoom.size}`);
        }
      }
    }
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ID: ${ws.id}:`, error.message);
  });
});

---

### Express HTTP Routes

app.get('/', (req, res) => {
  res.send('StreamVibes WebSocket server is running. Connect via WebSocket for streaming functionality.');
});

// API endpoint to get comments for a specific room
app.get('/api/rooms/:roomId/comments', async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findOne({ roomId }, { comments: 1, _id: 0 }); // Fetch only comments
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }
    res.json(room.comments);
  } catch (error) {
    console.error(`Error fetching comments for room ${roomId}:`, error.message);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// API endpoint to check active streams
app.get('/api/streams/active', (req, res) => {
  const activeStreamRooms = Array.from(clients.streamers.keys());
  res.json({ activeStreams: activeStreamRooms });
});


---

### Start the HTTP and WebSocket Server

// Use process.env.PORT for Render deployment, fallback to 8080 for local development
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`HTTP: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
