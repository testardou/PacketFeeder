from marshmallow import Schema, fields

class GetInterfacesSchema(Schema):
    interfaces = fields.List(fields.String(), required=True)