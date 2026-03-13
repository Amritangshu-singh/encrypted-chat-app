# 🔐 SecureChat — End-to-End Encrypted Chat Application

A production-ready, WhatsApp/Telegram-style chat application with true end-to-end encryption. Messages are encrypted on the client before they reach the server — even the server operator cannot read them.

## Features

- **End-to-End Encryption** — TweetNaCl.js (Curve25519 + XSalsa20-Poly1305) on the client; server only stores ciphertext.
- **User Registration & Login** — email or phone number, JWT authentication, bcrypt password hashing.
- **WhatsApp/Telegram-style UI** — left sidebar with all registered users, chat area, online/offline status.
- **Real-time messaging** — Socket.io for instant delivery and typing indicators.
- **Private key never leaves the device** — stored in `localStorage`, never sent to the server.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TweetNaCl.js, Socket.io-client, Axios |
| Backend | Python 3.12, Flask 3, Flask-SocketIO, PyJWT, bcrypt |
| Database | MongoDB 7 |
| DevOps | Docker, Docker Compose |

## Project Structure

```
encrypted-chat-app/
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.jsx / App.css / index.js
│   │   ├── pages/
│   │   │   ├── Register.jsx    # Sign-up / sign-in page
│   │   │   └── Chat.jsx        # Main chat page
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx  # Message area
│   │   │   ├── UserList.jsx    # Left sidebar
│   │   │   ├── MessageInput.jsx
│   │   │   └── UserStatus.jsx
│   │   └── utils/
│   │       ├── encryption.js   # TweetNaCl helpers
│   │       ├── api.js          # Axios API client
│   │       └── socket.js       # Socket.io singleton
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── app.py                  # Flask app + Socket.io events
│   ├── config.py
│   ├── routes/
│   │   ├── auth.py             # /api/auth/register, /api/auth/login
│   │   ├── users.py            # /api/users, /api/users/:id/public-key
│   │   ├── messages.py         # /api/messages/:userId
│   │   └── middleware.py       # JWT auth decorator
│   ├── models/
│   │   ├── user.py
│   │   └── message.py
│   ├── utils/
│   │   ├── jwt_handler.py
│   │   └── encryption.py       # Key validation (server never decrypts)
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start

### Using Docker Compose (recommended)

```bash
git clone https://github.com/Amritangshu-singh/encrypted-chat-app.git
cd encrypted-chat-app

# Copy and edit environment files (optional — defaults work for local dev)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker-compose up --build
```

The app will be available at **http://localhost:3000**.

### Running manually

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set environment variables (or create backend/.env from .env.example)
export MONGO_URI=mongodb://localhost:27017/encrypted_chat
export JWT_SECRET=your-jwt-secret

python app.py
```

**Frontend**

```bash
cd frontend
npm install

# Create frontend/.env from .env.example
cp .env.example .env
npm start
```

Visit **http://localhost:3000** in your browser.

## Security Architecture

```
Alice's browser                 Server (Flask)              Bob's browser
──────────────────              ────────────────            ──────────────────
1. Generate keypair             Stores only:                1. Generate keypair
   (Curve25519)                  • encrypted ciphertext        (Curve25519)
2. Send public key ──────────►   • nonces                  2. Send public key ──────────►
   to server                     • timestamps
3. Fetch Bob's pubkey ◄────────
4. Encrypt msg with
   Bob's pubkey + Alice's SK
5. Send ciphertext ──────────►  Relay → Bob ──────────────► 6. Decrypt with own SK
                                                                + Alice's pubkey
```

- Private keys are **never** sent to the server.
- The server **cannot** decrypt any message.
- Passwords are hashed with **bcrypt** (salt rounds 12).
- JWT tokens expire after **24 hours** (configurable).

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register with email/phone |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/users` | JWT | List all users |
| GET | `/api/users/{id}/public-key` | JWT | Fetch a user's public key |
| GET | `/api/messages/{userId}` | JWT | Chat history with a user |

### Socket.io Events

| Event (emit) | Event (receive) | Description |
|---|---|---|
| `send_message` | `receive_message` | Send / receive encrypted message |
| `user_typing` | `user_typing` | Typing indicator |
| — | `user_online` | Online/offline status broadcast |

## License

MIT