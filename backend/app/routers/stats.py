from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..i18n import pick_text
from ..models import Attempt, Material, User
from ..schemas import MaterialOut, StatsOut

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def stats(lang: str = "en", db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    materials = db.query(func.count(Material.id)).filter(Material.owner_id == current.id).scalar() or 0
    total = db.query(func.count(Attempt.id)).filter(Attempt.user_id == current.id).scalar() or 0
    correct = (
        db.query(func.count(Attempt.id))
        .filter(Attempt.user_id == current.id, Attempt.correct.is_(True))
        .scalar()
        or 0
    )
    accuracy = round(correct / total * 100) if total else 0
    recent_rows = (
        db.query(Material)
        .filter(Material.owner_id == current.id)
        .order_by(Material.created_at.desc())
        .limit(5)
        .all()
    )
    recent = []
    for m in recent_rows:
        out = MaterialOut.model_validate(m)
        out.summary = pick_text(m.summary, lang)
        recent.append(out)
    return StatsOut(
        materials=materials,
        quizzes_answered=total,
        correct=correct,
        accuracy=accuracy,
        recent=recent,
    )
