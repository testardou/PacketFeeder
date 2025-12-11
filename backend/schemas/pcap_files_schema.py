from marshmallow import Schema, fields

class PcapFilesSchema(Schema):
    files = fields.List(fields.String(), required=True)