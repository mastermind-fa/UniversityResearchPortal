#!/bin/bash

# Run server script for University Research Portal

echo "Starting University Research Portal server..."

# Change to Backend directory
cd ./Backend

# Check if the virtual environment exists
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
if [ ! -f ".requirements_installed" ]; then
  echo "Installing requirements..."
  pip install -r requirements.txt
  touch .requirements_installed
fi

# Run the backend server
echo "Starting FastAPI server..."
python main.py

# The script will stay here until the server is stopped with Ctrl+C
