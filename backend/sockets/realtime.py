import logging
from flask_socketio import Namespace, emit
from flask import request

logger = logging.getLogger(__name__)

should_run = {}
running_status = {}  # Track running status per SID

class ReplayNamespace(Namespace):
    def on_connect(self):
        sid = request.sid
        logger.info(f"Client connected: {sid}")
        should_run[sid] = True
        # Send current running status if it exists
        if sid in running_status:
            emit("run_status", {"sid": sid, "running": running_status[sid]}, namespace="/realtime")
        else:
            emit("run_status", {"sid": sid, "running": False}, namespace="/realtime")
        emit("hello", {"msg": "Connection OK", "sid": sid})
        emit("sid", {"sid": sid})

    def on_disconnect(self):
        sid = request.sid
        should_run[sid] = False
        # Don't clear running_status on disconnect, keep it for reconnection
        logger.info(f"Client disconnected: {sid}")

    def on_stop_replay(self):
        sid = request.sid
        logger.info(f"STOP request from client: {sid}")
        should_run[sid] = False
        running_status[sid] = False  # Update running status
        # Emit confirmation that stop was received
        emit("stop_confirmed", {"sid": sid, "stopped": True}, namespace="/realtime")
        emit("run_status", {"sid": sid, "running": False}, namespace="/realtime")
    
    def on_get_status(self):
        """Request current running status"""
        sid = request.sid
        is_running = running_status.get(sid, False)
        emit("run_status", {"sid": sid, "running": is_running}, namespace="/realtime")


