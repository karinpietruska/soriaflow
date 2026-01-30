# Backend Implementation Notes

This document records important implementation decisions and refinements made
during the development of the SoriaFlow backend. It complements the formal
project documentation by explaining how the conceptual design
was adapted during practical implementation.

The goal of this file is to make the development process transparent and
traceable, especially where theoretical models were refined based on practical
experience.

---

## Session Model Refinement

### Initial Concept

In the initial UML model created during the conception phase, exercise sessions
were described using fields such as `repetitionsUsed`. During implementation,
it became clear that this terminology introduced ambiguity when distinguishing
between:

- the number of repetitions a user plans to perform
- the number of repetitions actually completed during a session

This ambiguity made it harder to reason about session state and duration
calculations.

### Revised Model

To improve clarity and semantic correctness, the session model was redesigned
with an explicit separation of concerns:

- `repetitionsPlanned`: number of repetitions the user intends to perform
- `repetitionsCompleted`: number of repetitions actually completed
- per-cycle timing values expressed explicitly in seconds:
  - `inhaleSec`
  - `hold1Sec`
  - `exhaleSec`
  - `hold2Sec`

This refinement resulted in a clearer and more intuitive session lifecycle and
simplified both validation and duration computation.

---

## Computed Duration Fields

Two duration-related values are computed dynamically in the backend:

- `cycleDuration`: sum of inhale, hold, exhale, and hold durations for a single
  breathing cycle
- `totalDuration`: `cycleDuration × repetitionsCompleted`

These values are intentionally **not stored** in the database. They are derived
at runtime to avoid data duplication and to ensure consistency with the actual
session state.

---

## Session Lifecycle Semantics

Exercise sessions follow a clearly defined lifecycle:

1. **Start session**
   - stores planned repetitions and per-cycle timing
   - initializes `repetitionsCompleted` to `0`
   - sets the `startedAt` timestamp

2. **Finish session**
   - records the number of completed repetitions
   - sets the `endedAt` timestamp
   - marks whether the session was aborted

Additional guards were implemented to prevent invalid session states, including:
- finishing a session more than once
- completing more repetitions than originally planned

---

## Database Handling

- The backend uses a local SQLite database for persistence.
- Schema changes during development may require deleting the local `app.db`
  file. The database is recreated automatically on application startup.
- Default breathing exercises are seeded idempotently to ensure that restarting
  the server does not create duplicate entries.
- User-defined preset exercises are stored as separate records with unique IDs.

---

## Testing and Validation

Backend functionality and edge cases were validated manually using the FastAPI
Swagger UI (`/docs`). Tested scenarios include:

- valid and invalid session start requests
- valid and invalid session completion requests
- error handling for non-existent exercise and session IDs
- verification of computed duration values based on completed repetitions

---

## Summary

The refinements reflect a natural evolution from conceptual design to
practical implementation. Adjusting the model during development improved
correctness, readability, and long-term maintainability while remaining
aligned with the original project goals.