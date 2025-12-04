from flask import Flask, request, jsonify
import sys
import os
from flask_cors import CORS
from backend.routes.get_interfaces import get_interfaces_bp
from backend.routes.infos_pcap import infos_pcap_bp
from backend.routes.replay_realtime import replay_realtime_bp
from backend.routes.replay_faster import replay_faster_bp
from backend.sockets.realtime import ReplayNamespace
from backend.extension import socketio

# Absolute path du dossier parent (PacketFeeder)
PARENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PARENT_DIR)

print("DEBUG PYTHONPATH =", sys.path) 

app = Flask(__name__)
CORS(app)

app.register_blueprint(get_interfaces_bp)
app.register_blueprint(infos_pcap_bp)
app.register_blueprint(replay_realtime_bp)
app.register_blueprint(replay_faster_bp)
socketio.init_app(app, cors_allowed_origins="*")
socketio.on_namespace(ReplayNamespace("/realtime"))

@app.route("/")
def home():
    return "Hello Flask!"



if __name__ == "__main__":
    app.run(debug=True)