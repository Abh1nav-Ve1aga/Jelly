from mcp.server.fastmcp import FastMCP
from trueforge_sdk import TrueForge

#server connections
mcp = FastMCP("Jelly Handoff", host="127.0.0.1", port=8000)
client = TrueForge(base_url="http://localhost:8790", timeout=600)

#decorator -> function below is a tool
@mcp.tool()
def start_coder() -> str:
    #create session with coding agent
    session = client.sessions.create(agent={"name": "jelly-planning-agent"})
    #new turn (exchange) -> return stream stored in events
    events = client.sessions.create_turn_stream(
        #specifies session
        session_id=session.data.id,
        input=[{"type": "user.message", "content": "Reply with exactly: Hello, world!"}]
    )

    #for each chunk response from coder agent
    for event in events:
        #once coder agent has finished -> final turn
        if event.type == "turn.done":
            #failure or no reply stored
            if event.state.status != "done" or event.state.output is None:
                raise RuntimeError(
                    f"Coder turn ended with status: {event.state.status}"
                )

            #return coder's response
            return event.state.output.content

    #no done turn returned
    raise RuntimeError("The coder stream ended without a final turn.")

#if file run from terminal -> start up http server (keep listening)
if __name__ == "__main__":
    #connecting via http
    mcp.run(transport="streamable-http")