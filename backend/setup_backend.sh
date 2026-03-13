#!/bin/bash
set -e

echo "=========================================="
echo "  SecureChat Backend Setup (Linux/Mac)"
echo "=========================================="

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed. Please install Python 3.10+ first."
    echo "  Linux: sudo apt install python3 python3-venv python3-pip"
    echo "  Mac:   brew install python"
    exit 1
fi

echo "Using Python: $(python3 --version)"

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "NOTE: Edit backend/.env to set a secure JWT_SECRET and SECRET_KEY before production use."
fi

echo ""
echo "=========================================="
echo "  Backend setup complete!"
echo ""
echo "  To start the backend server:"
echo "    source .venv/bin/activate"
echo "    python app.py"
echo ""
echo "  Server will run at: http://localhost:5000"
echo "=========================================="
