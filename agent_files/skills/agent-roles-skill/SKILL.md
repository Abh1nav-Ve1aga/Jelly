---
name: agents

description: Lists agent roles. Used when determining who to communicate with
---

# Agents

Use this directory when choosing which agent to contact. Use each agent’s exact configured name when communicating.

| Agent | Role |
|---|---|
| master | Head agent. Coordinates agent work, communicates with user directly, resolves questions about scope and behavior, and reviews results. Teaches user implemented code. |
| coder | Implements code, repository changes, runs checks, and commits and pushes completed work. |
| documenter | Creates and maintains documentation grounded in the implementation and source code. |

Follow the communication skill to contact another agent. Include enough context for the recipient to act.

*** Note to user: Keep this files updated when agents are added, renamed, or their responsibilities change. ***