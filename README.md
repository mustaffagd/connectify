# Connectify

A production-quality real-time chat and video meeting platform built with React, Node.js, PostgreSQL, Socket.IO, and WebRTC.

## Features

- **User Authentication** - Secure registration/login with JWT and bcrypt password hashing
- **User Profiles** - Create and edit profiles with avatar, bio, and username
- **User Search** - Find other users by username or email
- **Real-time Chat** - Instant one-to-one messaging with Socket.IO
- **Typing Indicators** - See when the other user is typing
- **Online Presence** - Real-time online/offline status indicators
- **Message History** - Persistent conversation history stored in PostgreSQL
- **Unread Messages** - Track unread message counts per conversation
- **Video Calls** - One-to-one video calling using WebRTC peer-to-peer
- **Call Controls** - Microphone mute, camera toggle, end call
- **Incoming Call Notifications** - Accept or reject incoming video calls
- **Responsive Design** - Works on desktop and mobile devices
- **Security** - Helmet, CORS, rate limiting, input validation, parameterized queries

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | PostgreSQL 17 |
| Video/Audio | WebRTC (simple-peer) |
| Auth | JWT + bcrypt |
| State | React Context + Zustand |

## Architecture

```
connectify/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── chat/        # Chat UI components
│   │   │   ├── video/       # Video call components
│   │   │   ├── layout/      # Layout components (Navbar, Sidebar)
│   │   │   └── common/      # Shared components (Avatar, Spinner)
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API service layer
│   │   ├── sockets/         # Socket.IO event constants
│   │   └── utils/           # Utility functions
│   └── package.json
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── models/          # Database query layer
│   │   ├── routes/          # Express routes
│   │   ├── sockets/         # Socket.IO event handlers
│   │   ├── utils/           # Utilities and migration runner
│   │   └── server.js        # Entry point
│   ├── migrations/          # SQL migration files
│   ├── __tests__/           # Test files
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** v20+ 
- **PostgreSQL** v14+
- **npm** v9+

## PostgreSQL Setup

```bash
# Create database user
sudo -u postgres psql -c "CREATE USER chatadmin WITH PASSWORD 'your_password';"

# Create database
sudo -u postgres psql -c "CREATE DATABASE connectify_db OWNER chatadmin;"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE connectify_db TO chatadmin;"
```

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | Secret key for JWT signing | Required |
| JWT_EXPIRES_IN | Token expiration time | 7d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| STUN_SERVER_URL | STUN server for WebRTC | stun:stun.l.google.com:19302 |
| TURN_SERVER_URL | TURN server URL (optional) | - |
| TURN_USERNAME | TURN server username | - |
| TURN_PASSWORD | TURN server password | - |

### Frontend (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000 |
| VITE_SOCKET_URL | Socket.IO server URL | http://localhost:5000 |

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd connectify

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## Running Locally

```bash
# 1. Start PostgreSQL
sudo systemctl start postgresql

# 2. Run database migrations
cd server
npm run migrate

# 3. Start the backend (terminal 1)
npm run dev

# 4. Start the frontend (terminal 2)
cd ../client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/users/search?q=query | Search users | Yes |
| GET | /api/users/:id | Get user by ID | Yes |
| PUT | /api/users/profile | Update profile | Yes |

### Conversations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/conversations | Create conversation | Yes |
| GET | /api/conversations | List conversations | Yes |
| GET | /api/conversations/:id | Get conversation | Yes |

### Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/conversations/:id/messages | Send message | Yes |
| GET | /api/conversations/:id/messages | Get messages | Yes |
| PUT | /api/conversations/:id/read | Mark as read | Yes |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server health check |

## Socket.IO Events

### Chat Events
| Event | Direction | Description |
|-------|-----------|-------------|
| join-conversation | Client→Server | Join a conversation room |
| leave-conversation | Client→Server | Leave a conversation room |
| send-message | Client→Server | Send a message |
| new-message | Server→Client | Receive a message |
| typing-start | Client→Server | User started typing |
| typing-stop | Client→Server | User stopped typing |
| mark-read | Client→Server | Mark messages as read |
| users-online | Server→Client | List of online user IDs |
| messages-read | Server→Client | Messages were read |

### Call Signaling Events
| Event | Direction | Description |
|-------|-----------|-------------|
| call-user | Client→Server | Initiate a call |
| call-initiated | Server→Client | Call request sent |
| incoming-call | Server→Client | Incoming call notification |
| accept-call | Client→Server | Accept a call |
| reject-call | Client→Server | Reject a call |
| call-accepted | Server→Client | Call was accepted |
| call-rejected | Server→Client | Call was rejected |
| offer | Client→Server | WebRTC SDP offer |
| answer | Client→Server | WebRTC SDP answer |
| ice-candidate | Client→Server | ICE candidate exchange |
| end-call | Client→Server | End the call |
| call-ended | Server→Client | Call has ended |

## Testing

```bash
cd server
npm test
```

### Manual WebRTC Testing

1. Open http://localhost:5173 in two different browser windows
2. Register two different accounts
3. In window 1, search for the other user and start a conversation
4. Click the video call button in the chat header
5. In window 2, accept the incoming call
6. Both windows should show local and remote video
7. Test mute/unmute, camera on/off, and end call

## WebRTC Configuration

For production, configure STUN/TURN servers in `server/.env`:

```env
STUN_SERVER_URL=stun:your-stun-server.com:3478
TURN_SERVER_URL=turn:your-turn-server.com:3478
TURN_USERNAME=your_username
TURN_PASSWORD=your_password
```

Free STUN servers:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

For TURN (needed for restrictive NATs/firewalls), consider:
- [Twilio TURN](https://www.twilio.com/stun-turn)
- [Coturn](https://github.com/coturn/coturn) (self-hosted)

## Render Deployment

### Backend (Web Service)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd server && npm install && npm run migrate`
   - **Start Command:** `cd server && node src/server.js`
   - **Environment:** Node
4. Set environment variables in Render dashboard

### Frontend (Static Site)

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/dist`
4. Set environment variables:
   - `VITE_API_URL` = your backend URL
   - `VITE_SOCKET_URL` = your backend URL

### Database

1. Create a PostgreSQL instance on Render
2. Copy the Internal Database URL
3. Set as `DATABASE_URL` in your backend service

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days
- All API routes require authentication
- Users can only access their own conversations
- SQL injection prevented via parameterized queries
- Rate limiting on all endpoints
- Helmet security headers enabled
- CORS configured for specific origins
- Input validation on all endpoints
- Environment variables for all secrets

## Troubleshooting

**Database connection refused:**
```bash
sudo systemctl start postgresql
```

**Port already in use:**
```bash
lsof -i :5000  # Find process using port
kill <PID>     # Stop it
```

**WebRTC not working locally:**
- Use HTTPS in production (required for camera/microphone access)
- For local testing, use `localhost` (browsers allow camera on localhost)
- Check browser console for permission errors

**Socket.IO connection issues:**
- Ensure backend is running on port 5000
- Check CORS configuration in `server/.env`
- Verify `CLIENT_URL` matches your frontend URL

## License

MIT
