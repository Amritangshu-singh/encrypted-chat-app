#!/bin/bash
set -e

echo "=========================================="
echo "  SecureChat Frontend Setup (Linux/Mac)"
echo "=========================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ first."
    echo "  Linux: https://nodejs.org or sudo apt install nodejs npm"
    echo "  Mac:   brew install node"
    exit 1
fi

echo "Using Node.js: $(node --version)"
echo "Using npm:     $(npm --version)"

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo ""
echo "=========================================="
echo "  Frontend setup complete!"
echo ""
echo "  To start the frontend development server:"
echo "    npm start"
echo ""
echo "  App will open at: http://localhost:3000"
echo "=========================================="
