from flask import request, jsonify
from scapy.all import get_if_list, conf
from flask_smorest import  Blueprint
from backend.schemas.get_interfaces import GetInterfacesSchema

get_interfaces_bp = Blueprint("get_interfaces", __name__, url_prefix="/api")

@get_interfaces_bp.route("/get_interfaces/", methods=["GET"])
@get_interfaces_bp.response(200, GetInterfacesSchema)
def get_interfaces():
    default_iface = conf.iface.name
    all_ifaces = get_if_list()
    interfaces = [default_iface] + [iface for iface in all_ifaces if iface != default_iface]
    return jsonify({"interfaces": interfaces})
