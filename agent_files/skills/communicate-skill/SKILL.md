---
name: communicate

description: MCP tools useful for communication between agents
---

# Communicate

When you need to send another agent a question, update, reply, or handoff, call the `communicate` MCP tool.

Provide all three arguments as strings.

| Argument | What to pass |s
|---|---|
| `sender` | Your exact TrueForge agent name. |
| `recipient` | The receiving agent’s exact TrueForge agent name. |
| `message` | What you want the agent to know or do. Include relevant file paths and commit SHAs when the agent needs to read a specific version. |

A `queued` response means the server accepted the message for background processing. The recipient’s reply comes through a separate `communicate` call.

To reply to an incoming message, use your own name as `sender` and the original sender’s name as `recipient`. Call the tool explicitly to deliver the reply.

# .md files

For detailed instructions or context covering one task, use the filesystem MCP tools to create a concise Markdown file in the shared workspace. Organize it with descriptive headings so recipients can read the relevant sections. Call communicate() with the requested action, the shared file path, and any section names the recipient should focus on. Keep short requests, questions, replies, and status updates directly in the message. Reuse the file for follow-up clarification, and retain it until all agents that need it have finished.