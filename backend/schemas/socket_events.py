"""
Schemas for Socket.IO event emissions.
These define the structure of data sent via socketio.emit().
"""
from marshmallow import Schema, fields


class RunStatusSchema(Schema):
    """Schema for run_status event."""
    sid = fields.String(required=True, description="Session ID")
    running = fields.Bool(required=True, description="Whether replay is currently running")


class ReplayProgressSchema(Schema):
    """Schema for replay_progress event."""
    progress = fields.Float(required=True, description="Progress percentage (0-100)")
    index = fields.Int(required=True, description="Current packet index (0-based)")
    timestamp = fields.Float(required=True, description="Packet timestamp")
    size = fields.Int(required=True, description="Packet size in bytes")
    remaining_time = fields.Float(required=True, description="Remaining time in seconds")
    next_packet = fields.Float(required=True, description="Delay until next packet in seconds")
    packet_count = fields.Int(required=True, description="Total number of packets")


class ReplayErrorSchema(Schema):
    """Schema for replay_error event."""
    sid = fields.String(required=True, description="Session ID")
    error = fields.String(required=True, description="Error message")
    message = fields.String(required=True, description="Detailed error message")
    packets_sent = fields.Int(missing=None, description="Number of packets sent before error")


class ReplayDoneSchema(Schema):
    """Schema for replay_done event."""
    msg = fields.String(required=True, description="Completion message")


class HelloSchema(Schema):
    """Schema for hello event (connection confirmation)."""
    msg = fields.String(required=True, description="Connection message")
    sid = fields.String(required=True, description="Session ID")


class SidSchema(Schema):
    """Schema for sid event (session ID notification)."""
    sid = fields.String(required=True, description="Session ID")


class StopConfirmedSchema(Schema):
    """Schema for stop_confirmed event."""
    sid = fields.String(required=True, description="Session ID")
    stopped = fields.Bool(required=True, description="Whether replay was stopped")

