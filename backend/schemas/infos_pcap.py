from marshmallow import Schema, fields

class ProtocolsSchema(Schema):
    macs = fields.List(fields.String(), required=True)
    ips = fields.List(fields.String(), required=True)
    ipv6s = fields.List(fields.String(), required=True)
    tcp_ports = fields.List(fields.Int(), required=True)
    udp_ports = fields.List(fields.Int(), required=True)
    icmp_types = fields.List(fields.Int(), required=True)
    arp_ips = fields.List(fields.String(), required=True)
    dns_domains = fields.List(fields.String(), required=True)

class PcapInfoSchema(Schema):
    packet_count = fields.Int(required=True)
    total_bytes = fields.Int(required=True)
    duration_seconds = fields.Float(required=True)
    min_packet_size = fields.Int(required=True)
    max_packet_size = fields.Int(required=True)
    protocols = fields.Nested(ProtocolsSchema, required=True)