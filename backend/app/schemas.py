from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    subject: str
    file_type: str
    pages: int
    summary: str
    status: str
    created_at: datetime


class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    material_id: int
    question: str
    options: list[str]
    difficulty: str


class AttemptIn(BaseModel):
    quiz_id: int
    chosen_index: int
    lang: str = "en"


class AttemptOut(BaseModel):
    correct: bool
    answer_index: int
    explanation: str


class FlashcardOut(BaseModel):
    q: str
    a: str
    tag: str


class StatsOut(BaseModel):
    materials: int
    quizzes_answered: int
    correct: int
    accuracy: int  # 0-100
    recent: list[MaterialOut]


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    material_ids: list[int] = Field(default_factory=list)
    top_k: int = 6
    lang: str = "en"


class Citation(BaseModel):
    source: str
    quote: str


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
