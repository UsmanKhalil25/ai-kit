---
name: pre-plan
description: Manually-invoked skill for /pre-plan. Before writing any implementation plan, discuss the plan with the user first and get their agreement on what it will cover. Only runs when the user explicitly types /pre-plan.
---

# Pre-Plan

The user wants to confirm your understanding before you write a plan, not after. Skip straight to a plan and you risk building the wrong thing in detail — this skill catches that earlier, in conversation, while it's still cheap to fix.

## Steps

1. **Do not write code or plan yet.** First, tell the user in your own words what you understand the task to be and what you think the plan will need to cover (goal, approach, anything you're unsure about). No fixed template — keep it conversational.
2. Load and apply the `asd-ste100` skill to how you phrase this discussion: short sentences, one idea each, no ambiguity. The user wants this easy to digest, not dense.
3. Ask the user to confirm or correct your understanding. Go back and forth until they agree you've got it right.
4. Only after the user confirms, build the actual plan (e.g. via EnterPlanMode/ExitPlanMode as normal).
