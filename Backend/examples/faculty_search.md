# Faculty Search API Examples

## Search by name
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/search?name=Smith' \
  -H 'accept: application/json'
```

## Search by position and department
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/search?position=Associate%20Professor&dept_id=1' \
  -H 'accept: application/json'
```

## Search by research interests
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/search?research_interests=Machine%20Learning' \
  -H 'accept: application/json'
```

## Sample Response
```json
[
  {
    "faculty_id": 3,
    "first_name": "Robert",
    "last_name": "Smith",
    "email": "robert.smith@university.edu",
    "phone": "555-287-6543",
    "hire_date": "2019-08-15",
    "position": "Associate Professor",
    "dept_id": 1,
    "salary": 110000.0,
    "research_interests": "Machine Learning, Computer Vision, Natural Language Processing"
  },
  {
    "faculty_id": 7,
    "first_name": "Jennifer",
    "last_name": "Smith-Johnson",
    "email": "jennifer.smith@university.edu",
    "phone": "555-444-5678",
    "hire_date": "2017-09-01",
    "position": "Assistant Professor",
    "dept_id": 1,
    "salary": 95000.0,
    "research_interests": "Machine Learning, Neural Networks, AI Ethics"
  }
]
```
