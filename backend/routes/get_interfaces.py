from flask import current_app, jsonify
from scapy.all import get_if_list, conf
from flask_smorest import Blueprint
from backend.schemas.get_interfaces import GetInterfacesSchema

get_interfaces_bp = Blueprint("get_interfaces", __name__, url_prefix="/api")

@get_interfaces_bp.route("/get_interfaces/", methods=["GET"])
@get_interfaces_bp.response(200, GetInterfacesSchema)
def get_interfaces():
    """
    Get list of available network interfaces.
    
    Returns:
        JSON response with list of interface names
    
    Raises:
        500: If error getting interfaces
    """
    current_app.logger.info("Get interfaces request received")
    
    try:
        default_iface = conf.iface.name
        all_ifaces = get_if_list()
        interfaces = [default_iface] + [iface for iface in all_ifaces if iface != default_iface]
        current_app.logger.info("Found %d network interfaces", len(interfaces))
        return jsonify({"interfaces": interfaces})
    except Exception as e:
        current_app.logger.error("Error getting interfaces: %s", str(e))
        return jsonify({"error": "Error getting network interfaces"}), 500
