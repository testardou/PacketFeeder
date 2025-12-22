from flask_socketio import Namespace, emit
from flask import request

should_run = {}   
class ReplayNamespace(Namespace):
    def on_connect(self):
        sid = request.sid
        print("Client connected")
        should_run[sid] = True
        emit("hello", {"msg": "Connection OK", "sid": sid})
        emit("sid", {"sid": sid})

    def on_disconnect(self):
        sid = request.sid
        should_run[sid] = False
        print("Client disconnected:",sid)

    def on_stop_replay(self):
        sid = request.sid
        print("STOP request from client:", sid)
        should_run[sid] = False
        print('Should run:', should_run)


