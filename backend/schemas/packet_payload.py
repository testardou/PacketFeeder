from marshmallow import Schema, fields

class PacketPayloadSchema(Schema):
    payload = fields.Str(required=True)
