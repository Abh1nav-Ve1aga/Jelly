---
name: register-session

description: Register the master’s current conversation to receive agent messages and reports.
---

# Register the Master Session

At the start of a new master conversation, before delegating work, call
`register_agent_session` with your exact saved TrueForge agent name.

Confirm registration succeeded before proceeding. This makes the current
conversation the destination for messages addressed to your agent name.

Register again after the communication MCP server restarts. If registration
fails, report the blocker before starting other agents.