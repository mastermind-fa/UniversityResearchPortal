#!/bin/bash

# Script to add additional research projects to the University Research Portal

echo "Adding additional research projects to the University Research Portal..."

# Project 1: Blockchain Research
echo "Adding Project: Blockchain for Academic Credentialing"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Blockchain for Academic Credentialing",
  "description": "Research on blockchain technology applications for secure and verifiable academic credentials and certificates",
  "start_date": "2025-02-01",
  "end_date": null,
  "is_active": true,
  "budget": 180000.00,
  "funding_source": "University Innovation Grant",
  "dept_id": 3,
  "faculty_ids": [2, 7],
  "student_ids": [3, 9, 15]
}'

echo ""
echo "Adding Project: Autonomous Vehicle Communication Systems"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Autonomous Vehicle Communication Systems",
  "description": "Development of secure and efficient communication protocols between autonomous vehicles and infrastructure",
  "start_date": "2024-09-15",
  "end_date": "2026-08-31",
  "is_active": true,
  "budget": 450000.00,
  "funding_source": "Department of Transportation",
  "dept_id": 4,
  "faculty_ids": [4, 8],
  "student_ids": [6, 10, 12]
}'

echo ""
echo "Adding Project: Bioinformatics for Personalized Medicine"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Bioinformatics for Personalized Medicine",
  "description": "Applying computational methods to analyze genetic data for personalized medical treatments",
  "start_date": "2025-05-01",
  "end_date": null,
  "is_active": true,
  "budget": 385000.00,
  "funding_source": "National Institutes of Health",
  "dept_id": 2,
  "faculty_ids": [3, 5, 9],
  "student_ids": [1, 4, 7, 13]
}'

echo ""
echo "Adding Project: Smart Cities Infrastructure"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Smart Cities Infrastructure",
  "description": "Research on integrating IoT sensors and data analytics for improved urban infrastructure management",
  "start_date": "2025-03-15",
  "end_date": "2027-03-14",
  "is_active": true,
  "budget": 520000.00,
  "funding_source": "Smart City Innovation Partnership",
  "dept_id": 5,
  "faculty_ids": [6, 10],
  "student_ids": [8, 11, 14, 17]
}'

echo ""
echo "Adding Project: Virtual Reality in Education"
curl -X 'POST' \
  'http://127.0.0.1:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Virtual Reality in Education",
  "description": "Exploring the applications of virtual reality technology to enhance educational experiences and outcomes",
  "start_date": "2025-01-10",
  "end_date": "2026-12-31",
  "is_active": true,
  "budget": 290000.00,
  "funding_source": "Educational Technology Foundation",
  "dept_id": 1,
  "faculty_ids": [1, 4],
  "student_ids": [2, 5, 16, 18]
}'

echo ""
echo "Additional research projects have been added successfully!"
