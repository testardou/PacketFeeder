from marshmallow import Schema, fields

class ReplayStepSchema(Schema):
    message = fields.String(required=True)
    progress = fields.Float(required=True)
    index = fields.Int(required=True)
    timestamp = fields.Float(required=True)
    size = fields.Int(required=True)
    packet_count = fields.Int(required=True)
    parsed_packet = fields.List(fields.Dict(), required=True)