import socket
import asyncio
import urllib.request
import urllib.parse
import json
import re
from concurrent.futures import ThreadPoolExecutor
from backend.analysis import analyze_port

# Create a dedicated pool for network-intensive API calls
# This allows hundreds of CVE lookups to happen in parallel
cve_executor = ThreadPoolExecutor(max_workers=500)

# List of common ports to check if "Common Ports Only" is selected
# Includes a mix of TCP and UDP ports
COMMON_PORTS = [
    20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 123, 135, 137, 138, 139, 
    143, 161, 162, 389, 443, 445, 500, 514, 520, 636, 853, 993, 995, 
    1433, 1434, 1521, 1701, 1723, 3306, 3389, 5060, 5061, 5900, 8080, 8443
]

def parse_banner_keyword(banner: str) -> str:
    if not banner or "No Banner" in banner or "UDP Response" in banner:
        return ""
    # Strip non-alphanumeric, keep dots and spaces
    clean = re.sub(r'[^a-zA-Z0-9\.\s]', ' ', banner).strip()
    words = clean.split()
    
    # Filter out pure status numbers (like SMTP "220" or HTTP "200")
    words = [w for w in words if not re.match(r'^\d+$', w)]
    
    # Filter out common noise protocols or generic terms
    noise = {"esmtp", "smtp", "http", "https", "ftp", "scanme.nmap.org", "ubuntu", "debian", "welcome", "ready", "server", "bad", "request"}
    valid_words = [w for w in words if w.lower() not in noise]

    if not valid_words:
        return ""
        
    keyword = " ".join(valid_words[:2])
    if len(keyword) < 3:
        return ""
    return keyword

def fetch_cves_sync(keyword: str):
    if not keyword:
        return []
    url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch={urllib.parse.quote(keyword)}&resultsPerPage=3"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 SentinelAudit/1.0'})
        with urllib.request.urlopen(req, timeout=3.0) as response:
            data = json.loads(response.read().decode())
            vulns = data.get("vulnerabilities", [])
            results = []
            for v in vulns:
                cve_data = v.get("cve", {})
                cve_id = cve_data.get("id", "Unknown CVE")
                descriptions = cve_data.get("descriptions", [])
                desc_text = descriptions[0].get("value", "No description available.") if descriptions else "No description available."
                
                # Extract CVSS Metrics
                metrics = cve_data.get("metrics", {})
                base_score = 0.0
                severity = "UNKNOWN"
                
                for metric_key in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
                    if metric_key in metrics and len(metrics[metric_key]) > 0:
                        metric_data = metrics[metric_key][0]
                        cvss_data = metric_data.get("cvssData", {})
                        base_score = cvss_data.get("baseScore", 0.0)
                        severity = metric_data.get("baseSeverity", cvss_data.get("baseSeverity", "UNKNOWN")).upper()
                        break
                        
                results.append({
                    "id": cve_id, 
                    "description": desc_text,
                    "baseScore": base_score,
                    "severity": severity
                })
            return results
    except Exception:
        return []

async def fetch_cves(banner: str):
    keyword = parse_banner_keyword(banner)
    if not keyword:
        return []
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(cve_executor, fetch_cves_sync, keyword)


class PortScanner:
    def __init__(self, concurrency_limit=2000):
        self.concurrency_limit = concurrency_limit

    async def scan_target(self, target: str, start_port: int, end_port: int, scan_tcp: bool, scan_udp: bool, common_ports_only: bool, progress_callback=None, check_cancel=None):
        results = []
        
        if common_ports_only:
            ports_to_scan = sorted(list(set(COMMON_PORTS)))
        else:
            ports_to_scan = list(range(start_port, end_port + 1))

        total_scans = 0
        if scan_tcp: total_scans += len(ports_to_scan)
        if scan_udp: total_scans += len(ports_to_scan)
        
        current_scan = 0
        
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
                    # Give remote servers up to 1.5s to establish the TCP handshake
                    fut = asyncio.open_connection(target, port)
                    reader, writer = await asyncio.wait_for(fut, timeout=1.5)
                    
                    try:
                        # Wait up to 1.0s for the server to reply with its software banner
                        banner_fut = reader.read(1024)
                        data = await asyncio.wait_for(banner_fut, timeout=1.0)
                        if data:
                            banner = data.decode(errors='ignore').strip()
                        else:
                            banner = "No Banner (TCP)"
                    except (asyncio.TimeoutError, Exception):
                        # Try sending a generic probe to trigger a response (e.g., for HTTP services)
                        try:
                            writer.write(b"GET / HTTP/1.1\r\n\r\n")
                            await writer.drain()
                            data = await asyncio.wait_for(reader.read(1024), timeout=1.0)
                            if data:
                                banner = data.decode(errors='ignore').strip()
                            else:
                                banner = "No Banner (TCP)"
                        except Exception:
                            banner = "No Banner (TCP)"
                    finally:
                        writer.close()
                        try:
                            await writer.wait_closed()
                        except Exception:
                            pass

                    # Fetch CVES from NIST API based on grabbed banner
                    cve_data = await fetch_cves(banner)
                    vuln_data = analyze_port(port, banner)
                    service_name = vuln_data['service']

                    # Determine Baseline Port Severity
                    critical_ports = {21, 22, 23, 139, 445, 1433, 1521, 2375, 3306, 3389, 4444, 1099}
                    high_ports = {25, 53, 69, 111, 135, 161, 389, 512, 513, 514, 873, 2049, 5900, 6379, 9200}
                    
                    base_severity = "LOW"
                    if port in critical_ports:
                        base_severity = "CRITICAL"
                    elif port in high_ports:
                        base_severity = "HIGH"
                    elif vuln_data.get("attack_vector") != "Unknown / Target Dependent":
                        base_severity = "MEDIUM"

                    # Upgrade severity based on live NIST CVE Data (if any high-scoring CVEs were found)
                    for cve in cve_data:
                        score = cve.get("baseScore", 0.0)
                        if score >= 9.0:
                            base_severity = "CRITICAL"
                        elif score >= 7.0 and base_severity not in ["CRITICAL"]:
                            base_severity = "HIGH"
                        elif score >= 4.0 and base_severity not in ["CRITICAL", "HIGH"]:
                            base_severity = "MEDIUM"

                    result = {
                        "port": port,
                        "state": "open",
                        "protocol": "tcp",
                        "service": service_name,
                        "banner": banner,
                        "attack_vector": vuln_data["attack_vector"],
                        "vulnerability_check": vuln_data["vulnerability_check"],
                        "cve_data": cve_data,
                        "base_severity": base_severity
                    }
                except (asyncio.TimeoutError, ConnectionRefusedError, OSError, Exception):
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
                    await asyncio.wait_for(protocol.response_received.wait(), timeout=0.5)
                    
                    banner = "UDP Response Detected"
                    vuln_data = analyze_port(port, banner)
                    service_name = vuln_data['service']
                    
                    # UDP Severities
                    critical_ports = {53, 69, 137, 161, 500}
                    base_severity = "LOW"
                    if port in critical_ports:
                        base_severity = "HIGH"
                    elif vuln_data.get("attack_vector") != "Unknown / Target Dependent":
                        base_severity = "MEDIUM"
                        
                    result = {
                        "port": port,
                        "state": "open",
                        "protocol": "udp",
                        "service": service_name,
                        "banner": banner,
                        "attack_vector": vuln_data["attack_vector"],
                        "vulnerability_check": vuln_data["vulnerability_check"],
                        "cve_data": [],
                        "base_severity": base_severity
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
                    
        results.sort(key=lambda x: x["port"])
        return results