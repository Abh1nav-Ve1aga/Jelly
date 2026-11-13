from concurrent.futures import Future, ThreadPoolExecutor

from mcp.server.fastmcp import FastMCP
from trueforge_sdk import TrueForge
from trueforge_sdk.types import UserMessage

#servers
mcp = FastMCP("Jelly Handoff", host="127.0.0.1", port=8000)
client = TrueForge(base_url="http://localhost:8790", timeout=600)

#coder and teather threads -> 1 worker per
coder_executor = ThreadPoolExecutor(max_workers=1)
teacher_executor = ThreadPoolExecutor(max_workers=1)

#job queues -> tied to session id
coder_jobs: dict[str, Future] = {}
teacher_jobs: dict[str, Future] = {}

#job outcome helper
def log_job_result(job: Future) -> None:
    try:
        print(f"Agent job completed: {job.result()}", flush=True)
    except Exception as error:
        print(f"Agent job failed: {error}", flush=True)

#executes an agent turn w/ session id and message
def run_agent_turn(
    session_id: str,
    message: str
):
    #start turn stream -> process each event
    with client.sessions.create_turn_stream(
        session_id=session_id,
        input=[UserMessage(content=message)],
    ) as events:
        for event in events:
            if event.type == "turn.done":
                #no done turn catch
                if event.state.status != "done" or event.state.output is None:
                    raise RuntimeError(
                        f"Session {session_id} ended with status: "
                        f"{event.state.status}"
                    )

                #return agent response
                return event.state.output.content

    #no return catch
    raise RuntimeError(f"Session {session_id} ended without a final event.")

#planner -> teacher
@mcp.tool()
def start_teacher(
    repository: str, 
    brief_path: str, 
    commit_sha: str
) -> str:
    #new session with teaching agent
    session = client.sessions.create(agent={"name": "jelly-teaching-agent"})
    session_id = session.data.id

    #prompt to teaching agent
    message = (
        f"Read `{brief_path}` in `{repository}` at commit `{commit_sha}` "
        "using GitHub MCP. Outline how you would teach the feature step by "
        "step, then end this turn. Write the final notebook after a follow-up "
        "provides the coder's implementation report and Git diff."
    )

    #queue in teacher job
    teacher_jobs[session_id] = teacher_executor.submit(
        run_agent_turn, session_id, message
    )
    teacher_jobs[session_id].add_done_callback(log_job_result)

    #return teacher session ID 
    return session_id

#planner -> coder
@mcp.tool()
def start_coder(
    planner_message: str,
    repository: str,
    brief_path: str,
    commit_sha: str,
    teacher_session_id: str,
) -> str:

    #ensure a teacher agent session was created
    if teacher_session_id not in teacher_jobs:
        raise ValueError("Call start_teacher first and pass its session ID.")

    #create coder agent session
    session = client.sessions.create(agent={"name": "jelly-coding-agent"})
    session_id = session.data.id

    #prompt to coding agent
    message = (
        f"Message from the planning agent:\n{planner_message}\n\n"
        f"Read `{brief_path}` in `{repository}` at commit `{commit_sha}` "
        "using GitHub MCP. Use that exact brief to implement the feature.\n\n"
        "After committing the implementation report, call "
        "`submit_implementation_report` with "
        f"`teacher_session_id={teacher_session_id}`, "
        f"`repository={repository}`, the `report_path`, and the `commit_sha` "
        "of the commit that contains the implementation report.\n\n"
        "Once the tool confirms the report was queued, return your coding "
        "status and check results."
    )

    #queue in coding job
    coder_jobs[session_id] = coder_executor.submit(
        run_agent_turn, session_id, message
    )
    coder_jobs[session_id].add_done_callback(log_job_result)

    #return coding session ID
    return session_id

#coder -> teacher
@mcp.tool()
def submit_implementation_report(
    teacher_session_id: str,
    repository: str,
    report_path: str,
    commit_sha: str,
) -> str:
    #retrieve teacher session id
    preparation = teacher_jobs.get(teacher_session_id)
    #no active session? -> error
    if preparation is None:
        raise ValueError("No teacher job found for that session ID.")

    #prompt to teaching agent
    message = (
        "Use the `write-teaching-notebook` skill. "
        f"Read `{report_path}` in `{repository}` at commit `{commit_sha}` "
        "using GitHub MCP. Use that report, the implementation diff it references, "
        "and the teaching brief and outline from this session."
    )

    def write_documentation():
        #wait for teacher to interpret teaching-brief
        preparation.result()
        #job
        return run_agent_turn(teacher_session_id, message)

    #queue teacher documentation job
    teacher_jobs[teacher_session_id] = teacher_executor.submit(
        write_documentation
    )
    teacher_jobs[teacher_session_id].add_done_callback(log_job_result)

    return teacher_session_id

#http listening server
if __name__ == "__main__":
    mcp.run(transport="streamable-http")