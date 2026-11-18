---
name: github-sync

description: Synchronize repository changes before starting work and before publishing updates.
---

# GitHub Sync

Work against the repository’s `main` branch.

1. Before starting, check the latest remote commit. If using a local checkout, fetch and integrate incoming changes while preserving local work.
2. Before publishing, check remote `main` again. If it changed, review and integrate the incoming changes, then rerun affected checks. When using GitHub MCP, ensure the submitted file contents incorporate those changes.
3. Commit and push completed changes, or save them directly through GitHub MCP. If the write is rejected because the branch advanced, synchronize and retry.
4. Communicate the saved commit SHA, changed paths, and check results back. 

Coordinate writes when sharing a local checkout. Resolve conflicts carefully and ask the planning agent when they require a product or design decision. Avoid force-pushing.