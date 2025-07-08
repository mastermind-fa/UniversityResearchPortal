#!/bin/bash

# A simple script to run the University Research Portal backend without virtual environment

# Exit on error
set -e

echo "Setting up University Research Portal Backend..."

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database with sample data
echo "Initializing database with sample data..."
python init_db.py

# Run the application
echo "Starting the FastAPI application..."
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
