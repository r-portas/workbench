---
name: daily-journal
description:
  Interviews the user about their goals for the day and pre-populates a journal entry at
  journal/YYYY/YYYY-MM-DD.md. Use when the user asks to start their day, plan today, or run their
  daily journal.
---

# Daily Journal Interview

Interview the user briefly, then write the entry using `journal/_template.md` as the structure.

## Interview questions

1. What's the main focus for today?
2. Any specific tasks or outcomes you want to hit?
3. Anything open or unresolved from yesterday worth carrying forward?

Ask one at a time. Keep it short — this should take under a minute.

## After the interview

1. If `journal/<year>/<today's date>.md` already exists, tell the user and stop
   - Don't overwrite an entry that may already have notes in it
2. Find yesterday's entry at `journal/<year>/<yesterday's date>.md` (mind month/year boundaries)
   - Pull anything from its "Open questions" section as candidate carry-forwards
3. Create `journal/<year>/YYYY-MM-DD.md` (today's date) using `journal/_template.md` as the structure
4. Populate
   - `## Focus` — from questions 1 and 2 combined
   - `## Notes` — leave empty, user fills in through the day
   - `## Decisions` — leave empty
   - `## Open questions` — seed with carry-forwards found above
   - `## Links` — leave empty
5. Confirm the file path back to the user, don't print the whole entry unless asked
