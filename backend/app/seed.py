import uuid
from sqlalchemy.orm import Session

from .models import BreathingExercise, ExerciseSource

# name, description, defaultRepetitions, defaultInhale, defaultHold1, defaultExhale, defaultHold2
DEFAULT_EXERCISES = [
    (
        "Extended Exhale (4-6)",
        "A slow breathing pattern that emphasizes a longer exhale to support relaxation and reduce mental tension. "
        "Keeping the exhale longer than the inhale encourages a calmer, more steady breathing rhythm.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, then exhale for 6 seconds through the nose or mouth. "
        "Repeat for several cycles at a comfortable pace.",
        10,
        4,
        0,
        6,
        0,
    ),
    (
        "Extended Exhale (4-8)",
        "A slow breathing pattern that emphasizes a longer exhale to support relaxation and reduce mental tension. "
        "Keeping the exhale longer than the inhale encourages a calmer, more steady breathing rhythm.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, then exhale for 8 seconds through the nose or mouth. "
        "Repeat for several cycles at a comfortable pace.",
        10,
        4,
        0,
        8,
        0,
    ),
    (
        "Extended Exhale (5-10)",
        "A slow breathing pattern that combines a gentle, slightly longer inhale with a much longer exhale to support "
        "deep relaxation and a steady breathing rhythm. This version increases overall breath length and may feel more "
        "settling for experienced users.\n\n"
        "How it works\n"
        "Inhale through the nose for 5 seconds, then exhale for 10 seconds through the nose or mouth. "
        "Repeat for several cycles at a comfortable pace.",
        10,
        5,
        0,
        10,
        0,
    ),
    (
        "Resonance Breathing (5-5)",
        "A balanced breathing pattern with equal-length inhales and exhales. This steady rhythm supports a calm, "
        "regulated breathing flow and can help bring the body and mind into a more relaxed state.\n\n"
        "How it works\n"
        "Inhale through the nose for 5 seconds, then exhale through the nose for 5 seconds. Continue for several "
        "minutes, keeping the breath smooth and unforced.",
        12,
        5,
        0,
        5,
        0,
    ),
    (
        "Resonance Breathing (6-6)",
        "A balanced breathing pattern with equal-length inhales and exhales. This steady rhythm supports a calm, "
        "regulated breathing flow and can help bring the body and mind into a more relaxed state.\n\n"
        "How it works\n"
        "Inhale through the nose for 6 seconds, then exhale through the nose for 6 seconds. Continue for several "
        "minutes, keeping the breath smooth and unforced.",
        10,
        6,
        0,
        6,
        0,
    ),
    (
        "Box Breathing (4-4-4-4)",
        "A structured breathing pattern with equal phases for inhaling, holding, exhaling, and holding again. "
        "This steady rhythm can help improve focus and create a sense of calm and control.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, hold for 4 seconds, exhale for 4 seconds, then hold again for "
        "4 seconds. Repeat for several cycles at a steady, relaxed pace.",
        8,
        4,
        4,
        4,
        4,
    ),
    (
        "Box Breathing (5-5-5-5)",
        "A structured breathing pattern with equal phases for inhaling, holding, exhaling, and holding again. "
        "This steady rhythm can help improve focus and create a sense of calm and control.\n\n"
        "How it works\n"
        "Inhale through the nose for 5 seconds, hold for 5 seconds, exhale for 5 seconds, then hold again for "
        "5 seconds. Repeat for several cycles at a steady, relaxed pace.",
        6,
        5,
        5,
        5,
        5,
    ),
    (
        "Inhale Hold (4-8-8)",
        "Holding the breath briefly can help improve focus and encourage a slower, more controlled breathing rhythm.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, hold the breath for 8 seconds, then exhale slowly for 8 seconds. "
        "Repeat for several cycles at a comfortable pace.",
        4,
        4,
        8,
        8,
        0,
    ),
    (
        "Inhale Hold (4-12-8)",
        "A breathing exercise that introduces a longer pause after inhalation. Extending the breath hold can help "
        "improve focus and encourage a slower, more controlled breathing rhythm for more experienced practice.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, hold the breath for 12 seconds, then exhale slowly for 8 seconds. "
        "Repeat for several cycles at a comfortable pace.",
        4,
        4,
        12,
        8,
        0,
    ),
    (
        "Inhale Hold (4-16-8)",
        "A breathing exercise with a prolonged pause after inhalation. This advanced variation further extends the "
        "breath hold and is intended to support deep focus and a very slow, controlled breathing rhythm.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, hold the breath for 16 seconds, then exhale slowly for 8 seconds. "
        "Repeat for a small number of cycles at a comfortable pace.",
        2,
        4,
        16,
        8,
        0,
    ),
    (
        "Exhale Hold (4-0-8-4)",
        "An advanced breathing exercise that introduces a pause after exhalation. This practice relies on maintaining "
        "relaxation during the breath hold and is best approached once a steady, regulated breathing rhythm has been "
        "established through simpler exercises.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, exhale slowly for 8 seconds, then hold the breath after exhalation "
        "for 4 seconds. Repeat for a small number of cycles at a calm, unforced pace.",
        6,
        4,
        0,
        8,
        4,
    ),
    (
        "Exhale Hold (4-0-8-8)",
        "An advanced breathing exercise that extends the pause after exhalation. This variation emphasizes staying "
        "relaxed while the breath is held on empty and supports a slow, steady breathing rhythm when practiced without "
        "strain.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, exhale slowly for 8 seconds, then hold the breath after exhalation "
        "for 8 seconds. Repeat for a small number of cycles at a calm, unforced pace.",
        4,
        4,
        0,
        8,
        8,
    ),
    (
        "Exhale Hold (4-0-8-12)",
        "An advanced breathing exercise with an extended pause after exhalation. This variation places strong emphasis "
        "on remaining relaxed during the breath hold and maintaining a slow, steady rhythm without forcing or tension.\n\n"
        "Inhale through the nose for 4 seconds, exhale slowly for 8 seconds, then hold the breath after exhalation for "
        "12 seconds. Repeat for a small number of cycles at a calm, unforced pace.",
        2,
        4,
        0,
        8,
        12,
    ),
    (
        "4-7-8 Breathing",
        "A slow breathing pattern designed to support relaxation and calm the nervous system. The emphasis on a long "
        "exhale helps reduce tension and can make it easier to settle to find rest or sleep.\n\n"
        "How it works\n"
        "Inhale through the nose for 4 seconds, hold for 7 seconds, then exhale slowly through the mouth for 8 seconds. "
        "Repeat for several cycles, keeping the exhale longer than the inhale. If holding feels uncomfortable, shorten "
        "the timings while maintaining the 4-7-8 rhythm.",
        4,
        4,
        7,
        8,
        0,
    ),
]


def seed_defaults(db: Session) -> None:
    defaults_by_name = {
        name: {
            "description": description,
            "defaultRepetitions": reps,
            "defaultInhale": inhale,
            "defaultHold1": hold1,
            "defaultExhale": exhale,
            "defaultHold2": hold2,
        }
        for name, description, reps, inhale, hold1, exhale, hold2 in DEFAULT_EXERCISES
    }

    existing_defaults = (
        db.query(BreathingExercise)
        .filter(BreathingExercise.source == ExerciseSource.DEFAULT)
        .all()
    )

    for existing in existing_defaults:
        if existing.name not in defaults_by_name:
            db.delete(existing)
            continue
        values = defaults_by_name[existing.name]
        existing.description = values["description"]
        existing.defaultRepetitions = values["defaultRepetitions"]
        existing.defaultInhale = values["defaultInhale"]
        existing.defaultHold1 = values["defaultHold1"]
        existing.defaultExhale = values["defaultExhale"]
        existing.defaultHold2 = values["defaultHold2"]

    existing_names = {ex.name for ex in existing_defaults}
    for name, values in defaults_by_name.items():
        if name in existing_names:
            continue
        db.add(
            BreathingExercise(
                exerciseID=str(uuid.uuid4()),
                name=name,
                description=values["description"],
                source=ExerciseSource.DEFAULT,
                defaultRepetitions=values["defaultRepetitions"],
                defaultInhale=values["defaultInhale"],
                defaultHold1=values["defaultHold1"],
                defaultExhale=values["defaultExhale"],
                defaultHold2=values["defaultHold2"],
            )
        )
    db.commit()