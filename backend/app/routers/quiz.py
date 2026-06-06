from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, owned_material
from ..i18n import pick_options, pick_text
from ..models import Attempt, Quiz, User
from ..schemas import AttemptIn, AttemptOut, FlashcardOut, QuizOut

router = APIRouter(prefix="/quiz", tags=["quiz"])


def _to_out(q: Quiz, lang: str) -> QuizOut:
    return QuizOut(
        id=q.id,
        material_id=q.material_id,
        question=pick_text(q.question, lang),
        options=pick_options(q.options, lang),
        difficulty=q.difficulty,
    )


@router.get("/material/{material_id}", response_model=list[QuizOut])
def quiz_for_material(material_id: int, lang: str = "en", db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    material = owned_material(db, material_id, current)
    return [_to_out(q, lang) for q in material.quizzes]


@router.get("/material/{material_id}/flashcards", response_model=list[FlashcardOut])
def flashcards_for_material(material_id: int, lang: str = "en", db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    """Flashcards diturunkan dari soal quiz: Q = pertanyaan, A = jawaban benar + penjelasan."""
    material = owned_material(db, material_id, current)
    cards = []
    for q in material.quizzes:
        opts = pick_options(q.options, lang)
        answer = opts[q.answer_index] if 0 <= q.answer_index < len(opts) else ""
        expl = pick_text(q.explanation, lang)
        a = f"{answer}" + (f" — {expl}" if expl else "")
        cards.append(FlashcardOut(q=pick_text(q.question, lang), a=a, tag=q.difficulty))
    return cards


@router.post("/submit", response_model=AttemptOut)
def submit_answer(payload: AttemptIn, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    quiz = db.get(Quiz, payload.quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Question not found")

    correct = payload.chosen_index == quiz.answer_index
    db.add(
        Attempt(
            user_id=current.id,
            quiz_id=quiz.id,
            chosen_index=payload.chosen_index,
            correct=correct,
        )
    )
    db.commit()
    return AttemptOut(
        correct=correct,
        answer_index=quiz.answer_index,
        explanation=pick_text(quiz.explanation, payload.lang),
    )
