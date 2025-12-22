def payload_packet(pkt):
    raw_payload = bytes(pkt.payload)
    hex_payload = raw_payload.hex()
    return hex_payload