import socket
import asyncio
from backend.analysis import analyze_port

# List of common ports to check if "Common Ports Only" is selected
# Includes a mix of TCP and UDP ports
COMMON_PORTS = [
    20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 123, 135, 137, 138, 139, 
    143, 161, 162, 389, 443, 445, 500, 514, 520, 636, 853, 993, 995, 
    1433, 1434, 1521, 1701, 1723, 3306, 3389, 5060, 5061, 5900, 8080, 8443
]

class PortScanner:
    def __init__(self, concurrency_limit=1000):
        self.concurrency_limit = concurrency_limit

    async def scan_target(self, target: str, start_port: int, end_port: int, scan_tcp: bool, scan_udp: bool, common_ports_only: bool, progress_callback=None, check_cancel=None):
        results = []
        
        # Determine which ports to scan
        if common_ports_only:
            ports_to_scan = sorted(list(set(COMMON_PORTS)))
        else:
            ports_to_scan = list(range(start_port, end_port + 1))

        total_scans = 0
        if scan_tcp: total_scans += len(ports_to_scan)
        if scan_udp: total_scans += len(ports_to_scan)
        
        current_scan = 0
        
        # We don't need a heavy thread lock in Asyncio for simple int increments
        def update_progress():
            nonlocal current_scan
            current_scan += 1
            if progress_callback and total_scans > 0:
                progress_callback(current_scan, total_scans)

        sem = asyncio.Semaphore(self.concurrency_limit)

        async def scan_tcp_port(port):
            if check_cancel and check_cancel():
                return None
            async with sem:
                result = None
                try:
                    # Connect with a fast timeout (200ms)
                    fut = asyncio.open_connection(target, port)
                    reader, writer = await asyncio.wait_for(fut, timeout=0.2)
                    
                    try:
                        # Try to grab banner
                        banner_fut = reader.read(1024)
                        data = await asyncio.wait_for(banner_fut, timeout=0.1)
                        if data:
                            banner = data.decode(errors='ignore').strip()
                        else:
                            banner = "No Banner (TCP)"
                    except (asyncio.TimeoutError, Exception):
                        banner = "No Banner (TCP)"
                    finally:
                        writer.close()
                        try:
                            await writer.wait_closed()
                        except Exception:
                            pass

                    analysis = analyze_port(port, banner)
                    result = {
                        "port": port,
                        "service": f"{analysis['service']} (TCP)",
                        "banner": banner,
                        "attack_vector": analysis["attack_vector"],
                        "vulnerability_check": analysis["vulnerability_check"]
                    }
                except (asyncio.TimeoutError, ConnectionRefusedError, OSError, Exception) as e:
                    pass
                update_progress()
                return result

        async def scan_udp_port(port):
            if check_cancel and check_cancel():
                return None
            async with sem:
                result = None
                
                class UdpProtocol(asyncio.DatagramProtocol):
                    def __init__(self):
                        self.transport = None
                        self.response_received = asyncio.Event()

                    def connection_made(self, transport):
                        self.transport = transport

                    def datagram_received(self, data, addr):
                        self.response_received.set()

                    def error_received(self, exc):
                        pass

                loop = asyncio.get_running_loop()
                transport = None
                try:
                    transport, protocol = await asyncio.wait_for(
                        loop.create_datagram_endpoint(
                            UdpProtocol,
                            remote_addr=(target, port)
                        ),
                        timeout=0.2
                    )
                    transport.sendto(b"")
                    
                    # wait for response (0.5s overall UDP ping)
                    await asyncio.wait_for(protocol.response_received.wait(), timeout=0.5)
                    
                    banner = "UDP Response Detected"
                    analysis = analyze_port(port, banner)
                    result = {
                        "port": port,
                        "service": f"{analysis['service']} (UDP)",
                        "banner": banner,
                        "attack_vector": analysis["attack_vector"],
                        "vulnerability_check": "UDP Service Open. Vulnerable to amplification attacks if public."
                    }
                except (asyncio.TimeoutError, ConnectionResetError, OSError, Exception):
                    pass
                finally:
                    if transport:
                        transport.close()
                
                update_progress()
                return result

        tasks = []
        if scan_tcp:
            tasks.extend([asyncio.create_task(scan_tcp_port(port)) for port in ports_to_scan])
        if scan_udp:
            tasks.extend([asyncio.create_task(scan_udp_port(port)) for port in ports_to_scan])

        if tasks:
            completed_results = await asyncio.gather(*tasks)
            for res in completed_results:
                if res:
                    results.append(res)
                    
        # Sort results by port number so they appear in order
        results.sort(key=lambda x: x["port"])
        
        return results