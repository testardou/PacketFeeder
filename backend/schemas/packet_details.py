from marshmallow import Schema, fields

class PacketDetailsSchema(Schema):
    id = fields.Int(required=True)
    timestamp = fields.Float(required=True)
    proto = fields.Str(required=True)
    src = fields.Str(required=True)
    dst = fields.Str(required=True)

    sport = fields.Int(allow_none=True)
    dport = fields.Int(allow_none=True)

    length = fields.Int(required=True)

    has_payload = fields.Bool(required=True)
    payload_len = fields.Int(required=True)