---
name: document-skill

description: Document implemented features in a Jupyter notebook using the documentation brief, implementation report, Git diff, and source code.
---

# Document an Implemented Feature

Read the documentation brief, coder’s implementation report, and referenced Git diff when available. Inspect the source at the implementation commit to verify file paths, function names, behavior, and relationships.

Create a new `.ipynb` notebook in the project’s designated documentation directory. Use a descriptive filename containing the feature name and short implementation SHA. If it exists, add a numeric suffix.

## Explanation Block

Use this format for each documented part.

- **Name and location** — Identify the symbol and repository-relative file path. For external imports or built-ins, identify the package or runtime and where the feature uses it.
- **Purpose and behavior** — Briefly describe what it does and its role in the feature. Include inputs, outputs, state changes, and implementation rationale where relevant.
- **Code excerpt** — Show a small excerpt from the actual implementation illustrating its use.

## Notebook Structure

1. **Summary** — Briefly describe the implemented feature and overall approach.
2. **Flow map** — Show how relevant files, components, and functions connect. Use a Mermaid diagram to create a connective flowchart.
3. **Prerequisites** — Explain each distinct import, built-in function, and prerequisite concept used in the feature through an explanation block.
4. **Implementation** — Document the meaningful parts in execution or data-flow order using explanation blocks.
5. **Verification and references** — Briefly record the implementation SHA, diff reference, check results, and unverified behavior given. You should no be doing any tests of you own.

Choose implementation headings according to scope. A change involving two functions in one file can use those functions as the main headings, with the shared file path stated once. Introduce file or folder headings only when they help organize the content.

## Writing Rules

- Keep explanations concise, factual, and focused on the implementation.
- Explain each symbol or concept once. Later sections should reference its name and link to its primary explanation when possible.
- When revisiting a documented part, explain only its role in the current interaction or newly relevant behavior.
- Ground claims in the brief, report, diff, and inspected source. Label inferred rationale.
- Use Markdown cells with fenced code excerpts for source illustrations. Use executable cells for examples that can run in the notebook’s configured environment.

## Finish

Validate notebook structure, internal links, excerpts, and diagram rendering. Run executable examples when possible and briefly record any validation limitations.

Follow the GitHub synchronization skill, save the notebook to the repository, and report its path and saved commit SHA back to the requesting agent.