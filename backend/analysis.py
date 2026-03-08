# Common Port to Service Mapping
PORT_SERVICES = {
    20: "FTP-DATA", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
    53: "DNS", 80: "HTTP", 110: "POP3", 111: "RPCBind", 135: "MSRPC",
    139: "NetBIOS-SSN", 143: "IMAP", 443: "HTTPS", 445: "Microsoft-DS (SMB)",
    993: "IMAPS", 995: "POP3S", 1723: "PPTP", 3306: "MySQL", 3389: "RDP",
    5432: "PostgreSQL", 5900: "VNC", 6379: "Redis", 8080: "HTTP-Proxy",
    27017: "MongoDB"
}

# Vulnerability Database
VULNERABILITY_MAP = {
    21: {"vector": "Brute Force, Anonymous Login", "description": "FTP is unencrypted. Check for Anonymous access."},
    22: {"vector": "Brute Force, Private Key Theft", "description": "SSH. Ensure key-based auth is enforced."},
    23: {"vector": "Sniffing, MITM", "description": "Telnet sends data in cleartext. Highly insecure."},
    25: {"vector": "Spam Relay", "description": "SMTP. Check for open relaying."},
    53: {"vector": "DNS Amplification", "description": "Check if Zone Transfers (AXFR) are allowed."},
    80: {"vector": "SQL Injection, XSS", "description": "Unencrypted Web. Susceptible to sniffing."},
    135: {"vector": "RPC Enumeration", "description": "MsRPC. Can enumerate user info."},
    139: {"vector": "SMB Exploit", "description": "NetBIOS. Vulnerable to enumeration."},
    443: {"vector": "Heartbleed, Poodle", "description": "Encrypted Web. Check for old SSL/TLS."},
    445: {"vector": "EternalBlue", "description": "SMB. Critical vector for Ransomware."},
    3306: {"vector": "Brute Force", "description": "MySQL. Ensure not exposed to public internet."},
    3389: {"vector": "BlueKeep", "description": "RDP. Critical target for RCE."},
    6379: {"vector": "Unauth Access", "description": "Redis. Often left without password."},
    27017: {"vector": "Unauth Access", "description": "MongoDB. Check default auth config."}
}

def analyze_port(port: int, banner: str = "") -> dict:
    service = PORT_SERVICES.get(port, "Unknown")
    vuln_info = VULNERABILITY_MAP.get(port, {
        "vector": "Unknown",
        "description": "No specific vulnerability data for this port."
    })
    return {
        "service": service,
        "attack_vector": vuln_info["vector"],
        "vulnerability_check": vuln_info["description"]
    }