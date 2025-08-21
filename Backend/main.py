from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    departments, faculty, students, projects, publications, 
    funding, collaborators, student_research, analytics, reports, auth
)
from app.db.session import create_tables

app = FastAPI(
    title="University Research Portal API",
    description="Comprehensive University Research Management System API",
    version="1.0.0"
)

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
    try:
        create_tables()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()

# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(departments.router, prefix="/api", tags=["departments"])
app.include_router(faculty.router, prefix="/api", tags=["faculty"])
app.include_router(students.router, prefix="/api", tags=["students"])
app.include_router(projects.router, prefix="/api", tags=["projects"])
app.include_router(publications.router, prefix="/api", tags=["publications"])
app.include_router(funding.router, prefix="/api", tags=["funding"])
app.include_router(collaborators.router, prefix="/api", tags=["collaborators"])
app.include_router(student_research.router, prefix="/api", tags=["student-research"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(reports.router, prefix="/api", tags=["reports"])

@app.get("/")
def read_root():
    return {
        "message": "University Research Portal API",
        "version": "1.0.0",
        "description": "Advancing Knowledge Through Collaborative Research & Innovation"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "university-research-portal"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
