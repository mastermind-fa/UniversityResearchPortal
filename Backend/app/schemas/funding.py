from typing import List, Optional
from datetime import date
from pydantic import BaseModel

# Base schema for FundingSource
class FundingSourceBase(BaseModel):
    source_name: str
    source_type: str
    contact_info: Optional[str] = None

# Schema for creating a new FundingSource
class FundingSourceCreate(FundingSourceBase):
    pass

# Schema for updating a FundingSource
class FundingSourceUpdate(FundingSourceBase):
    pass

# Schema for FundingSource response (when fetching from API)
class FundingSourceInDB(FundingSourceBase):
    funding_id: int
    
    class Config:
        from_attributes = True

# Schema for FundingSource with funding details
class FundingSourceWithProjects(FundingSourceInDB):
    projects: List[dict] = []
    total_funding: Optional[float] = None
    
    class Config:
        from_attributes = True

# Base schema for ProjectFunding
class ProjectFundingBase(BaseModel):
    project_id: int
    funding_id: int
    amount: float
    start_date: date
    end_date: date
    grant_number: Optional[str] = None

# Schema for creating a new ProjectFunding
class ProjectFundingCreate(ProjectFundingBase):
    pass

# Schema for updating a ProjectFunding
class ProjectFundingUpdate(ProjectFundingBase):
    pass

# Schema for ProjectFunding response (when fetching from API)
class ProjectFundingInDB(ProjectFundingBase):
    class Config:
        from_attributes = True

# Schema for ProjectFunding with details
class ProjectFundingWithDetails(ProjectFundingInDB):
    project_title: Optional[str] = None
    source_name: Optional[str] = None
    source_type: Optional[str] = None
    
    class Config:
        from_attributes = True

# Schema for paginated list of funding allocations
class PaginatedProjectFunding(BaseModel):
    total: int
    total_pages: int
    current_page: int
    items: List[ProjectFundingWithDetails]
