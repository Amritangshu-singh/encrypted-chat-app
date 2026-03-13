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
| Backend | Python 3.10+, Flask 3, Flask-SocketIO, PyJWT, bcrypt |
| Database | MongoDB 6+ |

## Project Structure

```
encrypted-chat-app/
├── backend/
│   ├── app.py                  # Flask app + Socket.io events
│   ├── config.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── setup_backend.sh        # Linux/Mac setup script
│   ├── setup_backend.bat       # Windows setup script
│   ├── routes/
│   │   ├── auth.py             # /api/auth/register, /api/auth/login
│   │   ├── users.py            # /api/users, /api/users/:id/public-key
│   │   ├── messages.py         # /api/messages/:userId
│   │   └── middleware.py       # JWT auth decorator
│   ├── models/
│   │   ├── user.py
│   │   └── message.py
│   └── utils/
│       ├── jwt_handler.py
│       └── encryption.py       # Key validation (server never decrypts)
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── setup_frontend.sh       # Linux/Mac setup script
│   ├── setup_frontend.bat      # Windows setup script
│   ├── public/index.html
│   └── src/
│       ├── App.jsx / App.css / index.js
│       ├── pages/
│       │   ├── Register.jsx    # Sign-up / sign-in page
│       │   └── Chat.jsx        # Main chat page
│       ├── components/
│       │   ├── ChatWindow.jsx  # Message area
│       │   ├── UserList.jsx    # Left sidebar
│       │   ├── MessageInput.jsx
│       │   └── UserStatus.jsx
│       └── utils/
│           ├── encryption.js   # TweetNaCl helpers
│           ├── api.js          # Axios API client
│           └── socket.js       # Socket.io singleton
├── start_app.sh                # Linux/Mac: start backend + frontend
├── start_app.bat               # Windows: start backend + frontend
└── README.md
```

---

## Prerequisites

Install the following tools before proceeding:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org/ |
| Python | 3.10+ | https://www.python.org/downloads/ |
| MongoDB | 6+ | https://www.mongodb.com/try/download/community |
| Git | any | https://git-scm.com/ |

---

## Step-by-Step Setup

### 1 — Install MongoDB

<details>
<summary><b>Windows</b></summary>

1. Download the MongoDB Community Server MSI from https://www.mongodb.com/try/download/community
2. Run the installer and complete the setup wizard (choose "Complete" install type).
3. MongoDB installs as a Windows Service and starts automatically.
4. Verify it is running:

```
mongosh --eval "db.adminCommand('ping')"
```

</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Verify:

```bash
mongosh --eval "db.adminCommand('ping')"
```

</details>

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

The commands below install MongoDB 7.0 on Ubuntu 22.04 (Jammy). For other Ubuntu/Debian versions or MongoDB versions, see the [official docs](https://www.mongodb.com/docs/manual/administration/install-on-linux/).

```bash
# Import the MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add the repository (Ubuntu 22.04)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt update && sudo apt install -y mongodb-org

# Start and enable
sudo systemctl start mongod
sudo systemctl enable mongod
```

Verify:

```bash
mongosh --eval "db.adminCommand('ping')"
```

</details>

---

### 2 — Clone the Repository

```bash
git clone https://github.com/Amritangshu-singh/encrypted-chat-app.git
cd encrypted-chat-app
```

---

### 3 — Set Up the Backend

<details>
<summary><b>Windows</b></summary>

```bat
cd backend
setup_backend.bat
```

</details>

<details>
<summary><b>Linux / macOS</b></summary>

```bash
cd backend
chmod +x setup_backend.sh
./setup_backend.sh
```

</details>

The script will:
- Create a Python virtual environment (`.venv`)
- Install all Python dependencies from `requirements.txt`
- Copy `backend/.env.example` → `backend/.env`

> **Optional:** Open `backend/.env` and set stronger values for `SECRET_KEY` and `JWT_SECRET` before going to production.

---

### 4 — Set Up the Frontend

<details>
<summary><b>Windows</b></summary>

```bat
cd ..\frontend
setup_frontend.bat
```

</details>

<details>
<summary><b>Linux / macOS</b></summary>

```bash
cd ../frontend
chmod +x setup_frontend.sh
./setup_frontend.sh
```

</details>

The script will:
- Install all npm dependencies
- Copy `frontend/.env.example` → `frontend/.env`

---

### 5 — Run the Application

#### Option A — Single command (recommended)

<details>
<summary><b>Windows</b></summary>

From the project root:

```bat
start_app.bat
```

This opens two separate terminal windows — one for the backend and one for the frontend.

</details>

<details>
<summary><b>Linux / macOS</b></summary>

From the project root:

```bash
chmod +x start_app.sh
./start_app.sh
```

Press `Ctrl+C` to stop both services.

</details>

#### Option B — Two separate terminals

**Terminal 1 — Backend:**

```bash
# Linux/Mac
cd backend
source .venv/bin/activate
python app.py
```

```bat
:: Windows
cd backend
.venv\Scripts\activate.bat
python app.py
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm start
```

---

### 6 — Open the App

Visit **http://localhost:3000** in your browser.

- **Backend API** runs at `http://localhost:5000`
- **Frontend** runs at `http://localhost:3000`

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

## Troubleshooting

**`mongosh: command not found` / MongoDB not running**

- Windows: Open Services (`Win+R` → `services.msc`) and verify "MongoDB" is running.
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

**`pip: command not found`**

Use `pip3` instead of `pip`, or ensure your Python virtual environment is activated.

**Backend fails to start: `Address already in use` (port 5000)**

Another process is using port 5000. Either stop that process or change the backend port:

```bash
# In backend/.env, add:
FLASK_RUN_PORT=5001
```

Then update `frontend/.env` to `REACT_APP_API_URL=http://localhost:5001`.

**Frontend fails to start: `npm start` error**

Make sure Node.js 18+ is installed:

```bash
node --version   # should print v18.x.x or higher
npm --version
```

If `node_modules` is missing or corrupted, delete it and re-run setup:

```bash
cd frontend
rm -rf node_modules
npm install
```

**Messages not delivered in real-time**

Ensure the backend is running and `frontend/.env` has the correct `REACT_APP_SOCKET_URL=http://localhost:5000`.

---

## License

MIT