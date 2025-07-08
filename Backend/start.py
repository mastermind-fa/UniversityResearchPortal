"""
Simple script to initialize database and run the FastAPI application
"""

import os
import sys
import subprocess

def main():
    print("Setting up University Research Portal Backend...")
    
    # Install requirements
    print("Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Initialize database with sample data
    print("Initializing database with sample data...")
    subprocess.run([sys.executable, "init_db.py"])
    
    # Run the application
    print("Starting the FastAPI application...")
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])

if __name__ == "__main__":
    main()
