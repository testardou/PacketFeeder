"""
Socket.IO namespace for real-time replay communication.

Event types emitted (see backend.schemas.socket_events for schemas):
- run_status: RunStatusSchema - Current replay running status
- hello: HelloSchema - Connection confirmation
- sid: SidSchema - Session ID notification
- stop_confirmed: StopConfirmedSchema - Stop confirmation
- replay_progress: ReplayProgressSchema - Progress updates (from replay_loop)
- replay_error: ReplayErrorSchema - Error notifications (from replay_loop)
- replay_done: ReplayDoneSchema - Completion notification (from replay_loop)
"""
import logging
from flask_socketio import Namespace, emit
from flask import request

logger = logging.getLogger(__name__)

should_run = {}
running_status = {}  # Track running status per SID

class ReplayNamespace(Namespace):
    def on_connect(self):
        """
        Handle client connection.
        Emits: run_status (RunStatusSchema), hello (HelloSchema), sid (SidSchema)
        """
        sid = request.sid
        logger.info(f"Client connected: {sid}")
        should_run[sid] = True
        # Send current running status if it exists
        if sid in running_status:
            # Type: RunStatusSchema
            emit("run_status", {"sid": sid, "running": running_status[sid]}, namespace="/realtime")
        else:
            # Type: RunStatusSchema
            emit("run_status", {"sid": sid, "running": False}, namespace="/realtime")
        # Type: HelloSchema
        emit("hello", {"msg": "Connection OK", "sid": sid})
        # Type: SidSchema
        emit("sid", {"sid": sid})

    def on_disconnect(self):
        sid = request.sid
        should_run[sid] = False
        # Don't clear running_status on disconnect, keep it for reconnection
        logger.info(f"Client disconnected: {sid}")

    def on_stop_replay(self):
        """
        Handle stop replay request.
        Emits: stop_confirmed (StopConfirmedSchema), run_status (RunStatusSchema)
        """
        sid = request.sid
        logger.info(f"STOP request from client: {sid}")
        should_run[sid] = False
        running_status[sid] = False  # Update running status
        # Emit confirmation that stop was received
        # Type: StopConfirmedSchema
        emit("stop_confirmed", {"sid": sid, "stopped": True}, namespace="/realtime")
        # Type: RunStatusSchema
        emit("run_status", {"sid": sid, "running": False}, namespace="/realtime")
    
    def on_get_status(self):
        """
        Request current running status.
        Emits: run_status (RunStatusSchema)
        """
        sid = request.sid
        is_running = running_status.get(sid, False)
        # Type: RunStatusSchema
        emit("run_status", {"sid": sid, "running": is_running}, namespace="/realtime")


