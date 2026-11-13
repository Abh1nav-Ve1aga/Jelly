---
name: implement-skill

description: Use when the planning agent hands off an agreed feature with a repository, coding brief path, and commit SHA.
---

# Implement the agreed feature

## Read the handoff

Read `docs/planning/coding-brief.md` at the commit SHA supplied by the
planner. Use that version as the source of truth for the agreed behavior
and acceptance checks. Read the matching `docs/planning/teaching-brief.md`
at the same commit. Inspect the relevant code on the target branch before
making changes.

If you cannot read the brief or identify the target branch from the
handoff or project configuration, report the blocker to the planner.

## Implement and verify

Follow the repo's existing conventions. Reuse relevant helpers and
components, keep the change focused, and make routine implementation
decisions independently.

If a question affects the agreed behavior, send it to the planner with
the relevant part of the brief, what you found in the code, and your
recommended answer. Group related questions and continue work that does
not depend on the answer. The planner handles any user decisions.
If there is no planner messaging tool available, return the question
as a blocker in your result for the handoff to relay.

Run the relevant checks against the acceptance criteria. Review the
actual changes for duplication, unnecessary abstractions, and unrelated
edits. Record which checks passed and what still needs verification.

## Update the teaching brief

Keep the planner's short feature overview and add a **Coder's Implementation Details** section to `docs/planning/teaching-brief.md`. Include:

- The key files and what each is responsible for.
- The order to read them, from the feature's entry point to its result.
- The functions or components to focus on and how they connect.
- Why the important structures or patterns were chosen.
- The implementation commit SHA and the Git diff, or a reference the
  teaching agent can use to retrieve that exact diff.

This section should be breif but detailed. The teaching agent will inspect this section and create its teaching document for the use. you are NOT creating a teaching guide, just providing a report for the teaching guide to use.

## Hand off the results

Call the teaching handoff tool with the repository, target branch, teaching
brief path, commit SHA containing the updated brief, and implementation diff
or an exact reference to it.

As soon as the tool confirms that the teaching run has started, return a
coding status to the planner. Include the implementation commit SHA, check
results, any remaining issues, and the teaching run ID. Let the teacher
continue in the background.

If the handoff fails, report the error to the planner and keep the updated
teaching brief available for retry.