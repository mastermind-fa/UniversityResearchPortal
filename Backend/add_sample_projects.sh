#!/bin/bash

# Script to add sample projects to the University Research Portal

echo "Adding sample projects to the University Research Portal..."

# Project 1: AI Research
echo "Adding Project 1: AI Research"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Advanced AI for Natural Language Understanding",
  "description": "Research project focused on developing new neural network architectures for improved natural language understanding and generation",
  "start_date": "2025-01-15",
  "end_date": null,
  "is_active": true,
  "budget": 275000.00,
  "funding_source": "National Science Foundation",
  "dept_id": 1,
  "faculty_ids": [1, 3],
  "student_ids": [2, 5, 8]
}'

echo ""
echo "Adding Project 2: Quantum Computing"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Quantum Computing Applications in Cryptography",
  "description": "Exploring how quantum computing can enhance and threaten current cryptographic methods",
  "start_date": "2024-11-03",
  "end_date": "2025-05-15",
  "is_active": false,
  "budget": 190000.00,
  "funding_source": "Department of Defense",
  "dept_id": 3,
  "faculty_ids": [2],
  "student_ids": [1, 3]
}'

echo ""
echo "Adding Project 3: Sustainable Energy"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Sustainable Energy Solutions for Urban Areas",
  "description": "Research on renewable energy integration in urban infrastructure",
  "start_date": "2024-10-01",
  "end_date": null,
  "is_active": true,
  "budget": 320000.00,
  "funding_source": "Corporate Sponsor - Green Energy Inc.",
  "dept_id": 5,
  "faculty_ids": [5],
  "student_ids": [7, 12, 18]
}'

echo ""
echo "Adding Project 4: Medical Imaging"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Advanced Neural Networks for Medical Imaging",
  "description": "Research project focused on developing neural network models for improving medical imaging diagnostics",
  "start_date": "2025-07-01",
  "end_date": null,
  "is_active": true,
  "budget": 350000.00,
  "funding_source": "National Institutes of Health",
  "dept_id": 1,
  "faculty_ids": [1, 3, 5],
  "student_ids": [2, 4, 6, 8]
}'

echo ""
echo "Adding Project 5: Climate Change Modeling"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Climate Change Modeling and Prediction",
  "description": "Development of advanced computational models for climate change prediction and impact assessment",
  "start_date": "2025-03-01",
  "end_date": null,
  "is_active": true,
  "budget": 420000.00,
  "funding_source": "Environmental Protection Agency",
  "dept_id": 2,
  "faculty_ids": [4, 6, 8],
  "student_ids": [9, 11, 14, 16]
}'

echo ""
echo "Sample projects have been added!"
