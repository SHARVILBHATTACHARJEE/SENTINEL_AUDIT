# Expanded Common Port to Service Mapping
PORT_SERVICES = {
    7: "Echo", 9: "Discard", 13: "Daytime", 19: "Chargen", 20: "FTP-DATA", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 
    37: "Time", 42: "WINS", 43: "WHOIS", 53: "DNS", 67: "DHCP-Server", 68: "DHCP-Client", 69: "TFTP", 79: "Finger", 
    80: "HTTP", 88: "Kerberos", 109: "POP2", 110: "POP3", 111: "RPCBind", 113: "IDENT", 119: "NNTP", 123: "NTP", 
    135: "MSRPC", 137: "NetBIOS-NS", 138: "NetBIOS-DGM", 139: "NetBIOS-SSN", 143: "IMAP", 161: "SNMP", 162: "SNMPTRAP", 
    179: "BGP", 194: "IRC", 389: "LDAP", 427: "SLP", 443: "HTTPS", 444: "SNPP", 445: "Microsoft-DS (SMB)", 464: "kpasswd", 
    465: "SMTPS", 500: "ISAKMP", 512: "exec", 513: "login", 514: "shell/syslog", 515: "printer", 520: "RIP", 548: "AFP", 
    554: "RTSP", 587: "SMTP-Submission", 631: "IPP", 636: "LDAPS", 873: "Rsync", 902: "VMware-Auth", 989: "FTPS-DATA", 
    990: "FTPS", 993: "IMAPS", 995: "POP3S", 1080: "SOCKS", 1099: "RMI-Registry", 1194: "OpenVPN", 1433: "MSSQL", 
    1434: "MSSQL-Monitor", 1521: "Oracle", 1701: "L2TP", 1723: "PPTP", 1883: "MQTT", 2049: "NFS", 2082: "cPanel", 
    2083: "cPanel-SSL", 2181: "ZooKeeper", 2222: "DirectAdmin/SSH-Alt", 2375: "Docker", 2376: "Docker-SSL", 
    2628: "DICT", 3128: "Squid-Proxy", 3306: "MySQL", 3389: "RDP", 3690: "SVN", 4333: "mSQL", 4444: "Metasploit", 
    4500: "IPSec", 5000: "UPnP/Flask", 5060: "SIP", 5061: "SIPS", 5432: "PostgreSQL", 5672: "AMQP", 5900: "VNC", 
    5984: "CouchDB", 6379: "Redis", 6667: "IRC", 7001: "WebLogic", 7199: "Cassandra-JMX", 8000: "HTTP-Alt", 
    8008: "HTTP-Alt", 8080: "HTTP-Proxy", 8443: "HTTPS-Proxy", 8888: "HTTP-Alt", 9000: "SonarQube/PHP-FPM", 
    9042: "Cassandra", 9092: "Kafka", 9200: "Elasticsearch", 9300: "Elasticsearch-Node", 10000: "Webmin", 
    11211: "Memcached", 27017: "MongoDB", 27018: "MongoDB-Shard", 50000: "SAP", 61616: "ActiveMQ"
}

# Expanded Vulnerability Database
VULNERABILITY_MAP = {
    19: {"vector": "DDoS Amplification", "description": "Chargen. Easily spoofed, used in massive reflection attacks."},
    20: {"vector": "Unencrypted Traffic", "description": "FTP Data. Vulnerable to interception and MITM attacks."},
    21: {"vector": "Brute Force, Anonymous Login", "description": "FTP is unencrypted. Check for Anonymous access open."},
    22: {"vector": "Brute Force, Private Key Theft", "description": "SSH. Ensure strong keys, disable root password login."},
    23: {"vector": "Sniffing, MITM", "description": "Telnet sends everything in cleartext. Highly insecure."},
    25: {"vector": "Spam Relay, Spoofing", "description": "SMTP. Check for open relaying and missing SPF/DKIM records."},
    43: {"vector": "Information Disclosure", "description": "WHOIS. May reveal infrastructure info."},
    53: {"vector": "DNS Amplification, Zone Transfer", "description": "Check if AXFR Zone Transfers allowed to public."},
    69: {"vector": "Unauthenticated Read/Write", "description": "TFTP has no authentication. Highly vulnerable."},
    79: {"vector": "Information Enumeration", "description": "Finger. Can reveal active users and system info."},
    80: {"vector": "SQLi, XSS, SSRF", "description": "HTTP. Cleartext traffic. Susceptible to all OWASP Top 10."},
    88: {"vector": "Roasting", "description": "Kerberos. Vulnerable to Kerberoasting and ticket forging."},
    110: {"vector": "Cleartext Credentials", "description": "POP3. Passwords sent unencrypted."},
    111: {"vector": "RPC Enumeration", "description": "RPCBind. Attackers map services running on the machine."},
    119: {"vector": "Cleartext Traffic", "description": "NNTP. Usenet traffic sent unencrypted."},
    123: {"vector": "NTP Amplification", "description": "NTP. Vulnerable to DDoS reflection via monlist command."},
    135: {"vector": "RPC Enumeration", "description": "MSRPC. Can enumerate user info and interfaces."},
    137: {"vector": "NetBIOS Spoofing", "description": "NetBIOS-NS. Vulnerable to NBT-NS poisoning attacks."},
    139: {"vector": "SMB Exploit, Enumeration", "description": "NetBIOS. Vulnerable to local network enumeration."},
    143: {"vector": "Cleartext Credentials", "description": "IMAP. Email passwords sent unencrypted."},
    161: {"vector": "Information Disclosure", "description": "SNMP. 'public' default community string reveals ALL system data."},
    389: {"vector": "Null Bind, Injection", "description": "LDAP. Vulnerable to LDAP injection and anonymous active directory dumps."},
    443: {"vector": "Heartbleed, Poodle", "description": "HTTPS. Check for valid certificates and disabled legacy TLS/SSL versions."},
    445: {"vector": "EternalBlue, SMB Relay", "description": "SMB. Critical vector for Ransomware and unauthorized shares."},
    464: {"vector": "Brute Force", "description": "Kerberos Password Change. Brute-forceable endpoint."},
    500: {"vector": "VPN Offline Cracking", "description": "IKE/ISAKMP. Aggressive mode allows PSK hash extraction and offline cracking."},
    512: {"vector": "Unauthenticated Remote Execution", "description": "Rexec. Highly insecure remote command execution."},
    513: {"vector": "Trust Abuse", "description": "Rlogin. Insecure replacement for telnet."},
    514: {"vector": "Rsh / Syslog Spoofing", "description": "Rsh/Syslog. Can be spoofed to inject fake logs, or exploited for unauth shell."},
    548: {"vector": "AFP Enumeration", "description": "Apple File Protocol. Unauthenticated access can reveal shares."},
    873: {"vector": "Unauth File Access", "description": "Rsync. Can be misconfigured to allow public anonymous sync/read/write."},
    1080: {"vector": "Open Proxy", "description": "SOCKS Proxy. If unauthenticated, attackers route malicious traffic through it."},
    1099: {"vector": "Java Deserialization, RCE", "description": "RMI-Registry. Often highly vulnerable to Remote Code Execution via deserialization."},
    1433: {"vector": "Brute Force, SQL Injection", "description": "Microsoft SQL. Default 'sa' account often targeted."},
    1521: {"vector": "TNS Listener Poisoning", "description": "Oracle. Prone to TNS poisoning and brute forcing defaults."},
    2049: {"vector": "Unauth NFS Mounts", "description": "NFS. If improperly configured, anyone can mount the filesystem."},
    2375: {"vector": "Unauthorized RCE", "description": "Docker API. If exposed unauthenticated, yields complete host compromise."},
    3128: {"vector": "Open Proxy", "description": "Squid. Can be abused to access internal network (SSRF)."},
    3306: {"vector": "Brute Force, CVEs", "description": "MySQL. Should NEVER be exposed to public internet. Check for root weak configs."},
    3389: {"vector": "BlueKeep, Ransomware", "description": "RDP. Critical target. Requires Network Level Authentication (NLA) enforcement."},
    3690: {"vector": "Source Code Theft", "description": "SVN. Check for anonymous read access to proprietary code."},
    4444: {"vector": "Backdoor / Malware", "description": "Metasploit standard bind port. Highly indicative of an active compromise."},
    5000: {"vector": "SSRF, Debug RCE", "description": "Flask/UPNP. Flask debug mode allows unauthenticated arbitrary RCE via the debug console."},
    5432: {"vector": "Brute Force", "description": "PostgreSQL. Check default 'postgres' user and trust authentication."},
    5672: {"vector": "Unauth Access", "description": "AMQP (RabbitMQ). Default 'guest'/'guest' widely abused."},
    5900: {"vector": "VNC Auth Bypass", "description": "VNC. Prone to unencrypted keystroke sniffing, brute force, and auth bypasses."},
    5984: {"vector": "Unauth Access", "description": "CouchDB. Historically insecure defaults allowed open admin creation."},
    6379: {"vector": "Unauth Access, RCE", "description": "Redis. Often deployed without a password. Can lead directly to RCE via file writes."},
    7001: {"vector": "Java Deserialization", "description": "WebLogic. Notoriously vulnerable to critical unauthenticated RCE exploits."},
    8080: {"vector": "Tomcat RCE, Directory Traversal", "description": "HTTP Auth/Proxy. Often hosts Tomcat admin panels vulnerable to default credentials."},
    9200: {"vector": "Data Exposure, RCE", "description": "Elasticsearch. Data indexes widely leaked; older versions have Groovy RCEs."},
    10000: {"vector": "CVEs, Brute Force", "description": "Webmin. History of unauthenticated RCE CVEs (e.g., password_change.cgi)."},
    11211: {"vector": "DDoS Amplification, Data Leak", "description": "Memcached. No authentication supported. Massive DDoS vector and leaks cached data."},
    27017: {"vector": "Unauth Access, Data Ransom", "description": "MongoDB. Check for missing authentication. Widely targeted by automated ransomware."},
    61616: {"vector": "Java Deserialization", "description": "ActiveMQ. Frequently vulnerable to RCE via OpenWire protocol."}
}

def analyze_port(port: int, banner: str = "") -> dict:
    # Handle known ports
    service = PORT_SERVICES.get(port, "Unknown Service")
    
    # Check if inside ephemeral port ranges (dynamic/private assignments)
    if service == "Unknown Service" and (49152 <= port <= 65535):
        service = "Ephemeral / Dynamic Port"
        
    vuln_info = VULNERABILITY_MAP.get(port, {
        "vector": "Unknown / Target Dependent",
        "description": "No specific CVE or vector mapped natively. Assess banner and application context."
    })
    
    return {
        "service": service,
        "attack_vector": vuln_info["vector"],
        "vulnerability_check": vuln_info["description"]
    }