#!/bin/bash

# This script sets up and runs the University Research Portal backend

# Exit on error
set -e

echo "Setting up University Research Portal Backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database with sample data
echo "Initializing database with sample data..."
python init_db.py

# Run the application
echo "Starting the FastAPI application..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Note: this script will not reach this point because uvicorn will keep running
# until manually stopped
