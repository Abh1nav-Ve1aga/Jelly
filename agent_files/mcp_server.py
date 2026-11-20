from collections import deque
from concurrent.futures import ThreadPoolExecutor
from threading import Lock
from uuid import uuid4

from mcp.server.fastmcp import Context, FastMCP
from trueforge_sdk import TrueForge
from trueforge_sdk.types import UserMessage


# servers
mcp = FastMCP("Agent Communication", host="127.0.0.1", port=8000)
client = TrueForge(base_url="http://localhost:8790", timeout=600)

# protects shared dictionary and queue updates
state_lock = Lock()

# prevents duplicate session creation or registration
session_creation_lock = Lock()

# message id, sender, message
QueuedMessage = tuple[str, str, str]

# agent name -> session id
sessions: dict[str, str] = {}

# agent name -> executor with 1 worker
executors: dict[str, ThreadPoolExecutor] = {}

# agent name -> queue while its worker is scheduled or running
pending: dict[str, deque[QueuedMessage]] = {}


# fetch existing agent session or create one
def get_agent_session(agent_name: str) -> str:
    with session_creation_lock:
        with state_lock:
            session_id = sessions.get(agent_name)

        if session_id is None:
            session = client.sessions.create(agent={"name": agent_name})
            session_id = session.data.id

            with state_lock:
                sessions[agent_name] = session_id

    return session_id


# executes one agent turn
def run_agent_turn(session_id: str, message: str):
    with client.sessions.create_turn_stream(
        session_id=session_id,
        input=[UserMessage(content=message)],
    ) as events:
        for event in events:
            if event.type == "turn.done":
                if event.state.status != "done":
                    raise RuntimeError(
                        f"Session {session_id} ended with status: "
                        f"{event.state.status}"
                    )

                # a completed turn may have no final text
                if event.state.output is None:
                    return None

                return event.state.output.content

    raise RuntimeError(
        f"Session {session_id} ended without a final event."
    )


# process all messages queued for one agent
def process_agent_jobs(agent_name: str, session_id: str) -> None:
    while True:
        with state_lock:
            queue = pending[agent_name]

            # no more messages -> release this agent's queue
            if not queue:
                del pending[agent_name]
                return

            message_id, sender, message = queue.popleft()

        # release lock before waiting for the agent -> allows other workers to run jobs
        try:
            # identify the message's source for the recipient
            incoming_message = (
                f"Message ID: {message_id}\n"
                f"From agent: {sender}\n\n"
                f"{message}"
            )

            run_agent_turn(session_id, incoming_message)

            print(
                f"[{message_id}] {sender} -> {agent_name} "
                f"({session_id}) completed",
                flush=True,
            )

        # log failure -> continue processing later messages
        except Exception as error:
            print(
                f"[{message_id}] {sender} -> {agent_name} "
                f"({session_id}) failed: {error}",
                flush=True,
            )


# send a message without waiting for the recipient's response
@mcp.tool()
def communicate(
    sender: str,
    recipient: str,
    message: str,
) -> dict[str, str]:
    """
    Queue a message using exact TrueForge agent names.

    Returns immediately after submission, without waiting for execution.
    To reply, call communicate with sender and recipient reversed.
    A queued status confirms acceptance, not successful completion.
    """
    # format
    sender = sender.strip()
    recipient = recipient.strip()

    #validate basic info
    if not sender or not recipient or not message.strip():
        raise ValueError(
            "Sender, recipient, and message must all be provided."
        )

    # resolve recipient's session -> reused for all incoming messages
    session_id = get_agent_session(recipient)

    message_id = uuid4().hex
    queued_job: QueuedMessage = (message_id, sender, message)

    with state_lock:
        # existing worker will process this message
        if recipient in pending:
            pending[recipient].append(queued_job)

        else:
            # create 1 worker for this agent if needed
            if recipient not in executors:
                executors[recipient] = ThreadPoolExecutor(
                    max_workers=1,
                )

            pending[recipient] = deque([queued_job])

            try:
                executors[recipient].submit(
                    process_agent_jobs,
                    recipient,
                    session_id,
                )

            # submission failed -> remove queue so it can be retried
            except RuntimeError:
                del pending[recipient]
                raise

    return {
        "status": "queued",
        "message_id": message_id,
        "recipient": recipient,
        "session_id": session_id,
    }


# register an existing conversation, such as the master-user session
@mcp.tool()
def register_agent_session(
    agent_name: str,
    ctx: Context,
) -> dict[str, str]:
    """
    Register the calling TrueForge session under its exact agent name.

    Call from the conversation that should receive future messages.
    """
    agent_name = agent_name.strip()

    if not agent_name:
        raise ValueError("Agent name must be provided.")

    request = ctx.request_context.request

    if request is None:
        raise RuntimeError("No HTTP request context is available.")

    session_id = request.headers.get("x-tfg-session-id")

    if not session_id:
        raise RuntimeError(
            "TrueForge did not provide the calling session ID."
        )

    # coordinate registration with automatic session creation
    with session_creation_lock:
        with state_lock:
            existing_session = sessions.get(agent_name)

            # prevent switching destinations while messages are pending
            if (
                existing_session != session_id
                and agent_name in pending
            ):
                raise RuntimeError(
                    f"Cannot replace {agent_name}'s session "
                    "while its queue is active."
                )

            sessions[agent_name] = session_id

    return {
        "status": "registered",
        "agent": agent_name,
        "session_id": session_id,
    }


# run HTTP server -> exposes the MCP tools
if __name__ == "__main__":
    mcp.run(transport="streamable-http")