import socket
from backend.analysis import analyze_port

# List of common ports to check if "Common Ports Only" is selected
# Includes a mix of TCP and UDP ports
COMMON_PORTS = [
    20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 123, 135, 137, 138, 139, 
    143, 161, 162, 389, 443, 445, 500, 514, 520, 636, 853, 993, 995, 
    1433, 1434, 1521, 1701, 1723, 3306, 3389, 5060, 5061, 5900, 8080, 8443
]

class PortScanner:
    def scan_target(self, target: str, start_port: int, end_port: int, scan_tcp: bool, scan_udp: bool, common_ports_only: bool, progress_callback=None, check_cancel=None):
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

        # Helper to update progress
        def update_progress():
            nonlocal current_scan
            current_scan += 1
            if progress_callback and total_scans > 0:
                progress_callback(current_scan, total_scans)

        # -------------------------------------------
        # PHASE 1: TCP CONNECT SCAN
        # -------------------------------------------
        if scan_tcp:
            for port in ports_to_scan:
                if check_cancel and check_cancel():
                    break
                try:
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                        s.settimeout(0.3)
                        if s.connect_ex((target, port)) == 0:
                            try:
                                banner = s.recv(1024).decode(errors='ignore').strip()
                            except:
                                banner = ""
                            
                            if not banner:
                                banner = "No Banner (TCP)"

                            analysis = analyze_port(port, banner)
                            results.append({
                                "port": port,
                                "service": f"{analysis['service']} (TCP)",
                                "banner": banner,
                                "attack_vector": analysis["attack_vector"],
                                "vulnerability_check": analysis["vulnerability_check"]
                            })
                except Exception as e:
                    pass
                update_progress()

        # -------------------------------------------
        # PHASE 2: UDP SCAN
        # -------------------------------------------
        if scan_udp:
            for port in ports_to_scan:
                if check_cancel and check_cancel():
                    break
                try:
                    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                        s.settimeout(1.0)
                        try:
                            s.sendto(b"", (target, port))
                            data, _ = s.recvfrom(1024)
                            banner = "UDP Response Detected"
                            
                            analysis = analyze_port(port, banner)
                            results.append({
                                "port": port,
                                "service": f"{analysis['service']} (UDP)",
                                "banner": banner,
                                "attack_vector": analysis["attack_vector"],
                                "vulnerability_check": "UDP Service Open. Vulnerable to amplification attacks if public."
                            })
                        except socket.timeout:
                            pass
                        except ConnectionResetError:
                            pass
                except Exception as e:
                    pass
                update_progress()

        # Sort results by port number so they appear in order

        # Sort results by port number so they appear in order
        results.sort(key=lambda x: x["port"])
        
        return results