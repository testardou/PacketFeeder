from flask_socketio import Namespace, emit
import time

class ReplayNamespace(Namespace):
    def on_connect(self):
        print("Client connected")
        emit("hello", {"msg": "Connection OK"})

    def on_disconnect(self):
        print("Client disconnected")

    def on_start_replay(self, data):
        print("Replay demandé :", data)
        for i in range(20):
            emit("replay_progress", {"progress": i * 5})
            time.sleep(1)