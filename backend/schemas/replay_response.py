from marshmallow import Schema, fields


class ReplayResponseSchema(Schema):
    """Schema for replay start response."""
    message = fields.String(required=True)
    packet_count = fields.Int(required=True)
    mode = fields.String(required=True)


class ErrorSchema(Schema):
    """Schema for error responses."""
    error = fields.String(required=True)

