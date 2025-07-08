from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import departments, faculty, students, projects, analytics, reports
from app.db.session import create_tables

app = FastAPI(title="University Research Portal API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, in production specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
async def startup():
    create_tables()

# Include API routes
app.include_router(departments.router)
app.include_router(faculty.router)
app.include_router(students.router)
app.include_router(projects.router)
app.include_router(analytics.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "University Research Portal API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
