from marshmallow import Schema, fields

class ReplayRealtimeSchema(Schema):
    packet_count = fields.Int(required=True)
    total_bytes = fields.Int(required=True)
    duration_seconds = fields.Float(required=True)
    min_packet_size = fields.Int(required=True)
    max_packet_size = fields.Int(required=True)
    src_ips = fields.List(fields.String(), required=True)
    dst_ips = fields.List(fields.String(), required=True)
    tcp_ports = fields.List(fields.Int(), required=True)
    udp_ports = fields.List(fields.Int(), required=True)