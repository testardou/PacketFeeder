from flask import Flask, request, jsonify
import sys
import os
from flask_cors import CORS
from flask_smorest import Api
from backend.routes.get_interfaces import get_interfaces_bp
from backend.routes.infos_pcap import infos_pcap_bp
from backend.routes.replay_realtime import replay_realtime_bp
from backend.routes.replay_faster import replay_faster_bp
from backend.routes.replay_fastest import replay_fastest_bp
from backend.routes.rewrite_pcap_file import rewrite_pcap_file_bp
from backend.routes.get_pcap_files import get_pcap_files_bp
from backend.routes.upload_pcap_file import upload_pcap_file_bp
from backend.routes.delete_pcap_file import delete_pcap_file_bp
from backend.routes.details_packets_pcap import details_packets_pcap_bp
from backend.sockets.realtime import ReplayNamespace
from backend.extension import socketio
from backend.schemas.infos_pcap import PcapInfoSchema

# Absolute path du dossier parent (PacketFeeder)
PARENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PARENT_DIR)

print("DEBUG PYTHONPATH =", sys.path) 

app = Flask(__name__)
CORS(app)

app.config["API_TITLE"] = "PacketFeeder API"
app.config["API_VERSION"] = "v1"
app.config["OPENAPI_VERSION"] = "3.0.3"
app.config["OPENAPI_URL_PREFIX"] = "/"
app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

api = Api(app)

### GET ###
api.register_blueprint(get_pcap_files_bp)
api.register_blueprint(get_interfaces_bp)
api.register_blueprint(infos_pcap_bp)
api.register_blueprint(details_packets_pcap_bp)

### POST ###
api.register_blueprint(replay_realtime_bp)
api.register_blueprint(replay_faster_bp)
api.register_blueprint(replay_fastest_bp)
api.register_blueprint(upload_pcap_file_bp)
api.register_blueprint(rewrite_pcap_file_bp)

### DELETE ###
api.register_blueprint(delete_pcap_file_bp)


### SOCKETS ###
socketio.init_app(app, cors_allowed_origins="*")
socketio.on_namespace(ReplayNamespace("/realtime"))

@app.route("/")
def home():
    return "Hello Flask!"



if __name__ == "__main__":
    app.run(debug=True)