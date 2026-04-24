# StreamVibe

> **⚠️ Notice: The live site is currently down and is under active UI work and redesign progress. A fully redesigned version will be redeployed shortly.**

StreamVibe is a full-stack, real-time video streaming platform engineered for low-latency live stream transmission. Built on the MERN stack and powered by the WebSocket protocol, the platform enables users to broadcast and receive live video and text streams with sub-100ms latency. The architecture is designed around secure, private room-based sessions, ensuring that streams are strictly isolated between authorized participants.

The project demonstrates practical integration of real-time communication protocols, media processing pipelines, stateful server-side session management, and a React-based responsive frontend — all working in concert to deliver a cohesive streaming experience.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [WebSocket Protocol](#websocket-protocol)
- [Security](#security)
- [Live Demo](#live-demo)
- [Author](#author)

---

## Features

**Real-Time Live Streaming**
StreamVibe uses the WebSocket protocol (`ws`) to establish persistent, full-duplex connections between clients and the server. This eliminates the overhead of repeated HTTP handshakes and enables continuous, bidirectional data flow, which is what makes sub-100ms latency achievable for live video and text transmission.

**Secure Room-Based Session Routing**
Every streaming session is scoped to a named room. When a client connects, they are assigned or join a specific room, and the server enforces strict access control to ensure that stream data is only relayed to participants within that room. Unauthorized connections attempting to access a private room are rejected at the server level before any data is exchanged.

**User Authentication and Authorization**
The platform implements a complete authentication flow. Users can register with a username and password, which is hashed using bcrypt before being stored in MongoDB. On login, the server issues a signed JSON Web Token (JWT) that the client includes in subsequent requests. Protected routes and WebSocket connections validate this token before granting access.

**Media Processing with FFmpeg**
StreamVibe integrates FFmpeg via the `fluent-ffmpeg` and `ffmpeg-static` packages to handle server-side video stream processing. This enables the platform to ingest raw video data, process or transcode it as needed, and relay it to recipients in a compatible format — making it adaptable to different client capabilities and network conditions.

**Concurrent Multi-Stream Handling**
The frontend is built to handle multiple simultaneous data streams — both text and video — without blocking or degrading the user experience. React's component model and state management are leveraged to keep each stream's UI state isolated, so streams can be started, paused, or terminated independently.

**Persistent User and Session Data**
MongoDB with Mongoose is used as the persistence layer. User accounts, credentials, and relevant session metadata are stored and queried efficiently using Mongoose schemas and models, providing a structured interface to the database.

**Local Development with ngrok Tunneling**
For development and testing scenarios where the backend needs to be exposed to external clients or services, ngrok is integrated to create a secure tunnel from a public URL to the local server. This simplifies testing WebSocket connections from remote devices without requiring a full deployment.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | Component-based UI framework for building the streaming interface |
| HTML5 | Markup and media element structure |
| CSS3 | Styling, layout, and responsive design |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the server-side application |
| Express.js | Web framework for building the REST API and HTTP server |
| ws | Lightweight WebSocket library for managing real-time connections |
| fluent-ffmpeg | High-level FFmpeg wrapper for video stream processing |
| ffmpeg-static | Bundled static FFmpeg binary, removing the need for a system-level install |
| ngrok | Secure tunneling for exposing local servers during development |
| CORS | Cross-origin resource sharing middleware for the Express server |

### Database and Auth

| Technology | Purpose |
|---|---|
| MongoDB | NoSQL document database for storing user and session data |
| Mongoose | ODM (Object Document Mapper) providing schema definitions and query helpers |
| JSON Web Tokens (JWT) | Stateless, signed tokens for user authentication and route protection |
| bcryptjs | Password hashing library implementing the bcrypt algorithm |

---

## System Architecture

StreamVibe runs two independent servers that work together to serve the application:

**1. HTTP / REST Server (`mongo_server.js`)**
This is the Express application responsible for all standard HTTP interactions. It handles user registration and login, issues JWTs upon successful authentication, and serves any REST endpoints consumed by the frontend. It connects to MongoDB via Mongoose and is the authoritative source for all user account data. This server is stateless with respect to user sessions — all session context is encoded in the JWT itself.

**2. WebSocket Server (`ws_server.js`)**
This server manages all real-time communication. When a client wants to start or join a stream, it opens a persistent WebSocket connection to this server. The server maintains an in-memory registry of active rooms and their connected participants. Incoming stream data (video frames, text messages) from a broadcaster is received and immediately relayed to all other authorized participants in the same room. This server operates independently of the HTTP server, allowing it to be scaled or deployed separately if needed.

**3. React Frontend (`streamvibes/`)**
The React application communicates with both servers. Standard user flows such as login, registration, and data fetching go through the REST API over HTTP. Once authenticated and inside a session, the client opens a WebSocket connection to the WebSocket server for all real-time stream data. The frontend renders incoming streams reactively, updating the UI as new data arrives without requiring page reloads or polling.

```
Client (Browser)
    |
    |--- HTTP (REST) ---------> mongo_server.js (Express + MongoDB)
    |                               - POST /api/register
    |                               - POST /api/login  (returns JWT)
    |                               - GET  /api/profile (protected)
    |                               - GET  /api/rooms   (protected)
    |
    |--- WebSocket -----------> ws_server.js (ws + FFmpeg)
                                    - Room join / create
                                    - Stream broadcast
                                    - Stream relay to room participants
```

---

## Project Structure

```
Streamvibe/
│
├── streamvibes/                  # React frontend application
│   ├── public/                   # Static assets and HTML entry point
│   └── src/                      # React source files
│       ├── components/           # Reusable UI components
│       ├── pages/                # Page-level components (Login, Stream, etc.)
│       ├── App.js                # Root component and client-side routing
│       └── index.js              # React DOM entry point
│
├── ws_server.js                  # WebSocket server — real-time streaming logic,
│                                 # room management, and stream relay
│
├── mongo_server.js               # Express server — REST API, user authentication,
│                                 # JWT issuance, and MongoDB connection
│
├── package.json                  # Backend Node.js dependencies and scripts
├── package-lock.json             # Locked dependency tree for reproducible installs
└── README.md
```

---

## Getting Started

### Prerequisites

Ensure the following are installed on your system before proceeding:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (bundled with Node.js)
- **MongoDB** — either a local instance running on the default port (`27017`) or a remote connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Installation

Clone the repository and install dependencies for both the backend and the frontend separately.

```bash
# Step 1: Clone the repository
git clone https://github.com/Rohan-134v/Streamvibe.git
cd Streamvibe

# Step 2: Install backend dependencies
npm install

# Step 3: Install frontend dependencies
cd streamvibes
npm install
cd ..
```

---

## Environment Variables

Create a `.env` file in the root of the project directory. This file must not be committed to version control and should be created manually on each deployment environment.

```env
# MongoDB connection string
# For a local instance:  mongodb://localhost:27017/streamvibe
# For MongoDB Atlas:     mongodb+srv://<username>:<password>@cluster.mongodb.net/streamvibe
MONGO_URI=your_mongodb_connection_string

# Secret key used to sign and verify JWTs
# Use a long, randomly generated string in production environments
JWT_SECRET=your_jwt_secret_key

# Port for the Express HTTP server
PORT=5000

# Port for the WebSocket server
WS_PORT=8080
```

> Never commit your `.env` file to version control. Verify that `.env` is listed in `.gitignore` before making any commits.

---

## Running the Application

The application requires three processes running concurrently: the MongoDB/Express REST server, the WebSocket streaming server, and the React development server. Open three separate terminal windows, or use a process manager such as `concurrently` or `pm2`.

**Terminal 1 — Start the Express and MongoDB server:**
```bash
node mongo_server.js
```
This will establish a connection to MongoDB and begin listening for HTTP requests on the port defined in your `.env` file (default: `5000`).

**Terminal 2 — Start the WebSocket server:**
```bash
node ws_server.js
```
This starts the real-time WebSocket server, which will begin accepting connections on the port defined in your `.env` file (default: `8080`).

**Terminal 3 — Start the React development server:**
```bash
cd streamvibes
npm start
```
The frontend development server will be available at `http://localhost:3000` and will automatically hot-reload on any source file changes.

---

## API Overview

All HTTP endpoints are served by `mongo_server.js`. Protected routes require a valid JWT to be passed in the `Authorization` header using the Bearer schema: `Authorization: Bearer <token>`.

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/register` | No | Register a new user account with a hashed password |
| POST | `/api/login` | No | Authenticate with credentials and receive a signed JWT |
| GET | `/api/profile` | Yes | Retrieve the authenticated user's profile information |
| GET | `/api/rooms` | Yes | List currently available or active streaming rooms |

> Note: Exact route paths may differ from those listed above. Refer directly to `mongo_server.js` for the complete and authoritative list of endpoint definitions.

---

## WebSocket Protocol

All real-time communication flows through `ws_server.js`. Clients interact with the WebSocket server by sending and receiving JSON-encoded messages over the persistent connection.

**Establishing a Connection**

A client opens a WebSocket connection to `ws://localhost:8080`. The server expects an authentication token to be provided during the initial handshake or immediately after connection via a dedicated authentication message. Unauthenticated connections are terminated before they can interact with any room.

**Joining a Room**

After authentication, the client sends a message to join an existing room or create a new one. The server registers the socket as a participant of that room and begins routing relevant stream data to it.

```json
{
  "type": "join_room",
  "room": "room-identifier",
  "token": "jwt-token"
}
```

**Broadcasting a Stream**

The broadcaster sends stream data — video frames encoded as binary or base64, or text content — to the server. The server immediately relays this payload to all other active participants registered in the same room.

```json
{
  "type": "stream_data",
  "room": "room-identifier",
  "payload": "<binary or base64-encoded stream chunk>"
}
```

**Room Isolation**

The server maintains a strict mapping of room identifiers to participant socket connections. Data sent to a room is dispatched exclusively to sockets registered under that room's identifier. Any socket that has not been explicitly authorized for a room cannot receive its stream data, regardless of the message content or structure it sends.

---

## Security

**Password Hashing**
User passwords are never stored in plaintext. On registration, bcryptjs applies the bcrypt adaptive hashing algorithm with a configurable salt round count before the password hash is written to MongoDB. On login, the submitted password is compared against the stored hash using bcrypt's constant-time comparison function, which is specifically designed to prevent timing-based side-channel attacks.

**JWT-Based Stateless Authentication**
Upon successful login, the server signs a JWT containing the user's unique identifier and any relevant claims, using the secret key defined in the environment configuration. The token is returned to the client and must be included in the `Authorization: Bearer <token>` header for all protected HTTP requests. The server validates the token's cryptographic signature and expiry timestamp on every protected request, without needing to perform an additional database lookup, keeping authentication both fast and stateless.

**Room-Level Access Control**
The WebSocket server enforces room access at the point of connection. Clients must present a valid and unexpired JWT before being admitted to any room. Once inside a room, the server ensures that all stream data is relayed only to sockets explicitly registered as participants of that specific room, preventing any form of cross-session data leakage or eavesdropping.

**CORS Configuration**
The Express server uses the `cors` middleware to explicitly define which origins are permitted to make cross-origin HTTP requests to the API. This prevents unauthorized third-party web applications from consuming the API and provides an additional layer of protection against cross-origin request forgery.

---

## Live Demo

The live deployment is currently offline while the user interface is being redesigned and improved. It will be redeployed at the address below once the work is complete.

**Deployment URL:** [https://streamvibe-two.vercel.app](https://streamvibe-two.vercel.app)

---
