import asyncio
import ipaddress
import platform

class NetworkScanner:
    def __init__(self, max_concurrency=100):
        # Limit concurrency to not blow up Windows subprocess creation limits
        self.max_concurrency = max_concurrency

    async def ping_ip(self, ip: str, sem: asyncio.Semaphore) -> str:
        async with sem:
            try:
                # Tailor ping command exactly for the OS
                is_win = platform.system().lower() == 'windows'
                param = '-n' if is_win else '-c'
                timeout_param = '-w' if is_win else '-W'
                timeout_val = '800' if is_win else '1'

                cmd = f"ping {param} 1 {timeout_param} {timeout_val} {ip}"
                
                process = await asyncio.create_subprocess_shell(
                    cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                
                output = stdout.decode(errors='ignore').upper()
                
                # Check Windows specific unreachable texts
                if is_win:
                    if process.returncode == 0 and "DESTINATION HOST UNREACHABLE" not in output and "100% LOSS" not in output and "REQUEST TIMED OUT" not in output:
                        return ip
                else:
                    if process.returncode == 0:
                        return ip
            except Exception:
                pass
            return None

    async def scan_subnet(self, subnet_str: str, progress_callback=None, check_cancel=None):
        try:
            # Parses "192.168.1.0/24" effectively
            network = ipaddress.ip_network(subnet_str, strict=False)
        except ValueError:
            return [] # Invalid subnet

        hosts = list(network.hosts()) # Exclude network and broadcast address
        total = len(hosts)
        current = 0
        
        sem = asyncio.Semaphore(self.max_concurrency)
        tasks = []
        
        for host in hosts:
            if check_cancel and check_cancel():
                break
            tasks.append(asyncio.create_task(self.ping_ip(str(host), sem)))
            
        results = []
        for task in asyncio.as_completed(tasks):
            if check_cancel and check_cancel():
                break
            res = await task
            current += 1
            if progress_callback:
                progress_callback(current, total)
            if res:
                results.append(res)
                
        # Sort IP addresses accurately
        try:
            sorted_results = sorted(results, key=lambda ip: int(ipaddress.IPv4Address(ip)))
        except Exception:
            sorted_results = results
            
        return sorted_results
