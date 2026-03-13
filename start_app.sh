#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  SecureChat — Start Application"
echo "=========================================="

# Set up backend if needed
cd "$SCRIPT_DIR/backend"
if [ ! -d ".venv" ]; then
    echo "Backend not set up yet. Running setup..."
    bash setup_backend.sh
fi

# Start backend using the venv Python directly (avoids subshell activation issues)
echo "Starting backend..."
.venv/bin/python app.py &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID) — http://localhost:5000"

# Set up frontend if needed
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Frontend not set up yet. Running setup..."
    bash setup_frontend.sh
fi

# Start frontend
echo "Starting frontend..."
npm start &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID) — http://localhost:3000"

echo ""
echo "=========================================="
echo "  Both services are running!"
echo "  Open http://localhost:3000 in your browser."
echo ""
echo "  Press Ctrl+C to stop both services."
echo "=========================================="

# Stop both services on Ctrl+C or script exit
cleanup() {
    echo "Stopping services..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

wait
