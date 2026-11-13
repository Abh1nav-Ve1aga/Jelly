---
name: write-teaching-notebook

description: Use when the coder's implementation report arrives with a Git diff or an exact reference to it. Use those materials and the planner's teaching brief to create a new Jupyter notebook under docs/teaching/.
---

# Write a teaching notebook

Use the planner’s teaching brief, the coder’s implementation report, and
the actual Git diff. Open the relevant source files when the diff alone
doesn’t show enough context to explain the behavior. Assume I know
programming fundamentals and want help following a large code change
one piece at a time.

## 1. Summarize the feature

In a short Markdown cell, explain what the feature does, what someone
using the app would notice, and the key idea behind the implementation.
Mention any meaningful difference between the agreed plan and what shipped.

## 2. Show me where to start reading

Choose one concrete example and trace it from the entry point to the
observable result. For each step, list the file path, the function or
component to open, and what it passes to the next step.

Use a small diagram when several components, branches, or layers interact.
Keep the labels consistent with the actual code. Make the reading order
clear enough to follow with the repo open beside the notebook.

## 3. Walk through the major pieces in that order

Give each major function, component, or block of logic its own section.
Use the same order and names as the reading guide above. For each section:

- **Where to look** — Give the file path, function or component name,
  and line numbers when you can verify them.
- **How it works** — Show a short excerpt of the actual code. Walk
  through its inputs, key decisions, and output or side effect.
- **Why it’s there** — Explain what responsibility the code owns and why
  the structure or pattern helps. Use the coder’s stated rationale when
  available. Label your own interpretation when the reason is inferred.
- **What happens next** — Show where the value, event, or control goes
  next so I can move to the next file without guessing.

Include existing code when it’s needed to follow the flow. Use short
before-and-after snippets when they make a change easier to understand.
Keep incidental edits out of the main walkthrough.

## 4. Finish the example and show what was checked

Carry the example through to the final result. If one edge case reveals
something important, briefly show where its path diverges. Summarize the
checks the coder actually ran and flag anything still unverified.

## 5. Save the notebook

Create a new `.ipynb` under `docs/teaching/` a feature. Use Markdown
cells for explanations and fenced snippets in the source language.
Include the implementation commit SHA and return the notebook’s path
and commit SHA after publishing.