---
name: finalize feature

description: Use this skill when I confirm the feature design in the current planning chat
and ask you to finalize the briefs or start implementation. If a product or
design decision is still open, ask me about it in this chat.
---

# description
1. Review the feature and implementation approach we agreed on.
2. Overwrite these two files on the designated project branch:
   - `agent_files/coding-brief.md`: Record the feature goal, scope, expected
     behavior, agreed implementation steps, relevant files or components,
     edge cases, and acceptance checks.
   - `agent_files/teaching-brief.md`: Briefly state what the feature does
     and the implementation approach we agreed on.
3. Give both briefs the same feature title. Use GitHub write access only
   for these two files. Save them in the same commit and capture the commit
   SHA returned by GitHub.
4. Once both briefs are committed to GitHub, call `start_teacher` with the
   repository, the path to `teaching-brief.md`, and the commit SHA containing
   both briefs.

   As soon as `start_teacher` returns a session ID, call `start_coder` with a
   short `planner_message`, the repository, the path to `coding-brief.md`, the
   same commit SHA, and the returned `teacher_session_id`. The teacher can
   continue reading its brief while the coder starts implementation.

   If either tool is unavailable or a call fails, report which handoff failed
   and why. If `start_teacher` fails, stop before calling `start_coder`.
5. When both the coding agent and teaching agent get back to you, summarize implementation (coding agent work) and documentation (teaching agent work). Finally, report back to the user.