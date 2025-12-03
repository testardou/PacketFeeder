from collections import Counter
import time
from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from scapy.all import conf, rdpcap, sendp

from core.utils.read_pcap import read_pcap
from core.utils.send_pcap import send_pcap

@api_view(['POST'])
def infos_pcap(request):
    file = request.FILES['file']
    packets = read_pcap(file)
    if len(packets) == 0:
        return {"error": "Empty PCAP"}

    # timestamps
    first_ts = packets[0].time
    last_ts = packets[-1].time
    duration = last_ts - first_ts if last_ts > first_ts else 0
    sizes = [len(pkt) for pkt in packets]
    total_bytes = sum(sizes)
    src_ips = []
    dst_ips = []
    tcp_ports = []
    udp_ports = []

    for pkt in packets:
        if pkt.haslayer("IP"):
            if pkt["IP"].src not in src_ips:
                src_ips.append(pkt["IP"].src)
            if pkt["IP"].dst not in dst_ips:
                dst_ips.append(pkt["IP"].dst)
        if pkt.haslayer("TCP"):
            if pkt["TCP"].sport not in tcp_ports:
                tcp_ports.append(pkt["TCP"].sport)
            if pkt["TCP"].dport not in tcp_ports:
                tcp_ports.append(pkt["TCP"].dport)
        elif pkt.haslayer("UDP"):
            if pkt["UDP"].sport not in udp_ports:
                udp_ports.append(pkt["UDP"].sport)
            if pkt["UDP"].dport not in udp_ports:
                udp_ports.append(pkt["UDP"].dport)


    infos = {
        "packet_count": len(packets),
        "total_bytes": total_bytes,
        "duration_seconds": str(duration),

        "min_packet_size": min(sizes),
        "max_packet_size": max(sizes),

        "src_ips": src_ips,
        "dst_ips": dst_ips,
        "tcp_ports": tcp_ports,
        "udp_ports": udp_ports,
    }
    return Response(infos)

@api_view(['POST'])
def replay_real_time(request):
    if request.method == 'POST':
        file = request.FILES['file']
        iface = request.POST['iface']

        task_id = str(time.time()).replace('.', '')
        temp_path = f"/tmp/{task_id}.pcap"

        with open(temp_path, "wb") as f:
            for chunk in file.chunks():
                f.write(chunk)

        return Response({"task_id": task_id})
    
@api_view(['GET'])
def replay_get_progress(request):
    task_id = request.GET.get("task_id")
    iface = request.GET.get("iface", "wlp4s0")

    temp_path = f"/tmp/{task_id}.pcap"
    packets = rdpcap(temp_path)

    def event_stream():
        total = len(packets)
        for i, pkt in enumerate(packets):
            progress = int((i + 1) / total * 100)
            yield f"data: {progress}\n\n"
            send_pcap(pkt, iface=iface)

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")