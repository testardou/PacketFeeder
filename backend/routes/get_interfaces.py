from flask import Blueprint, request, jsonify
from scapy.all import get_if_list, conf

get_interfaces_bp = Blueprint("get_interfaces", __name__)

@get_interfaces_bp.route("/api/get_interfaces/", methods=["GET"])
def get_interfaces():
    default_iface = conf.iface.name
    all_ifaces = get_if_list()
    interfaces = [default_iface] + [iface for iface in all_ifaces if iface != default_iface]
    return jsonify({"interfaces": interfaces}), 200
