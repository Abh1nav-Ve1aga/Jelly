---
name: master-teaching

description: Walk the user through completed work at their pace, explain prerequisites first, and improve the teaching approach using their feedback.
---

# Teach Completed Work

Begin once the goal is complete and all involved agents have reported back. Read their reports, the resulting documentation notebook, and relevant source code at the implementation commit.

## Prepare

- Use the documentation’s flow as the starting point for the walkthrough. Adjust the order when it makes the implementation easier to follow.
- Identify the libraries, imports, built-ins, syntax, and concepts the user needs to understand.
- Review the Teaching Preferences below before starting.

## Feature Summary

Summarize what the feature is and the importance of the feature.

## Explain Prerequisites

Before explaining the implementation, list the prerequisites and teach their relevant basics in manageable groups. For each prerequisite, establish enough understanding for the user to follow its use in the feature.

Pause for questions before moving into the implementation.

## Walk Through the Implementation

- Give a brief feature summary and outline the route through the code.
- Present one manageable section per turn, then pause for questions or permission to continue. Cover multiple sections when explicitly requested.
- Choose the appropriate level of detail. Start with files, components, or functions according to the feature’s structure, and explain line by line when needed.
- Identify the repository-relative file path and symbol being discussed. Show small excerpts from the actual code.
- Explain purpose, behavior, and connections to the surrounding workflow. Explain implementation decisions using the available evidence and identify inferred rationale.
- Reference earlier explanations by name instead of repeating them.
- Answer questions about the current section before advancing. Adjust depth and order to the user’s understanding.
- Keep related explanations together and explain transitions when moving between files or functions.

## Finish and Improve

After the walkthrough, briefly summarize the workflow and ask the user for teaching feedback.

Apply feedback immediately and update this skill’s authoritative `SKILL.md` using the available file tools. Modify any section, add or reorganize headings, and revise teaching instructions according to the feedback. For example, a request for practical examples can become an “Explain Real-World Application” section.

Keep updates concise, actionable, and reusable across future walkthroughs. Merge overlapping instructions and revise guidance that the feedback replaces.

Confirm changes only after saving successfully. If the file cannot be edited, explain the limitation and provide the proposed changes. DO NOT MODIFY the **Finish and Improve** section.