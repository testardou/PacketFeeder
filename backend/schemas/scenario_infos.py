from marshmallow import Schema, fields
from backend.schemas.infos_pcap import PcapInfoSchema


class ScenarioItemSchema(Schema):
    type = fields.String(required=True)
    pcap_file = fields.String()
    technique_id = fields.String()
    tactic_id = fields.String()
    duration = fields.Float()


class ScenarioInfosRequestSchema(Schema):
    items = fields.List(fields.Nested(ScenarioItemSchema), required=True)


class PerPcapInfoEntrySchema(Schema):
    index = fields.Int(required=True)
    pcap_file = fields.String(required=True)
    infos = fields.Nested(PcapInfoSchema, required=True)


class ScenarioInfosResponseSchema(Schema):
    per_pcap = fields.List(fields.Nested(PerPcapInfoEntrySchema), required=True)
    all = fields.Nested(PcapInfoSchema, required=True)
