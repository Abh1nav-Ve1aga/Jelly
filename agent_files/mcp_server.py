from collections import deque
from concurrent.futures import ThreadPoolExecutor
#
from threading import Lock
from uuid import uuid4

from mcp.server.fastmcp import FastMCP
from trueforge_sdk import TrueForge
from trueforge_sdk.types import UserMessage

# servers
mcp = FastMCP("Jelly Handoff", host="127.0.0.1", port=8000)
client = TrueForge(base_url="http://localhost:8790", timeout=600)

"""
6 worker threads -> 1 per route
threads allow us to execute and await agent turns in parallel
"""
executor = ThreadPoolExecutor(max_workers=6)
"""
works with pending dict -> prevents workers from modifying the dictionary at the same time
only 1 thread worker can use the lock at a time -> other threads wait their turn
"""
state_lock = Lock()

# agent -> agent
Route = tuple[str, str]
#message tuple
QueuedMessage = tuple[str, str]  # Message ID and text

# Each ordered pair gets its own recipient session.
sessions: dict[Route, str] = {}

# A route stays here while its worker is scheduled or running.
#route: queue of messages
pending: dict[Route, deque[QueuedMessage]] = {}

# Maintains the latest commit SHA of respositories
# Repository: latest verified origin/main commit SHA
latest_commits: dict[str, str] = {}

# (Session ID, repository) -> last confirmed local checkout SHA
session_commits: dict[tuple[str, str], str] = {}

def run_agent_turn(session_id: str, message: str):
    # create a stream -> send message to proper session
    # with block ends stream after return
    with client.sessions.create_turn_stream(
        session_id=session_id,
        input=[UserMessage(content=message)],
    ) as events:
        # process every return from recipient agent
        for event in events:
            # after final turn, check for unsuccessful return
            if event.type == "turn.done":
                if event.state.status != "done" or event.state.output is None:
                    raise RuntimeError(
                        f"Session {session_id} ended with status "
                        f"{event.state.status} or returned no output."
                    )
                # success? -> return
                return event.state.output.content

    # never returned -> error
    raise RuntimeError(f"Session {session_id} ended without a final event.")

# process all jobs in route queue 
def process_route_jobs(route: Route) -> None:
    sender, recipient = route

    # process all jobs
    while True:
        with state_lock:
            queue = pending[route]
            # route's queue empty -> no more jobs -> remove queue
            if not queue:
                del pending[route]
                #jobs processed -> return
                return

            #job waiting -> pop it
            message_id, message = queue.popleft()
            session_id = sessions.get(route)

        # Release the lock before calling TrueForge so other routes can run.
        try:
            #no history between agents -> create a route (session)
            if session_id is None:
                # new session with recipient agent
                session = client.sessions.create(agent={"name": recipient})
                session_id = session.data.id
                # create route tied to session id
                with state_lock:
                    sessions[route] = session_id

            # store reply of recipient agent, given the sender agent's message
            output = run_agent_turn(
                session_id,
                message,
            )
            print(
                f"[{message_id}] {sender} -> {recipient} "
                f"({session_id}) completed",
                flush=True,
            )
        # log route and print error
        except Exception as error:
            print(
                f"[{message_id}] {sender} -> {recipient} "
                f"({session_id or 'no session'}) failed: {error}",
                flush=True,
            )


@mcp.tool()
def communicate(sender: str, recipient: str, message: str) -> dict[str, str]:
    """
    Queue a message using exact TrueForge agent names.

    A queued response confirms acceptance. Replies are sent across the route with reversed
    sender and recipient
    """
    # format
    sender = sender.strip()
    recipient = recipient.strip()
    # ensure info is provided
    if not sender or not recipient or not message.strip():
        raise ValueError("Sender, recipient, and message must all be provided.")

    # create route, unique message id, and queued job
    route = (sender, recipient)
    message_id = uuid4().hex
    queued_job = (message_id, message)

    with state_lock:
        # worker processing jobs on route, append job
        if route in pending:
            pending[route].append(queued_job)
        # no jobs running on route -> no worker
        else:
            pending[route] = deque([queued_job])
            try:
                # assign a worker to job queue to process it
                executor.submit(process_route_jobs, route)
            # error -> delete route (we dont want it to appear as if a worker has been assigned)
            except RuntimeError:
                del pending[route]
                # re-raise error for caller
                raise

    return {"status": "queued", "message_id": message_id}

# run mcp server -> allows agents to call tools
if __name__ == "__main__":
    mcp.run(transport="streamable-http")