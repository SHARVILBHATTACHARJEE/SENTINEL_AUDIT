import { useState } from 'react';
import { Terminal, ShieldAlert, Wifi, Activity, Download } from 'lucide-react';
import ScanForm from './components/scanform';
import ResultsTable from './components/ResultsTable';

function App() {
    const [results, setResults] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [scanStats, setScanStats] = useState({ target: '', range: '' });
    
    // NEW: State to track if a scan has actually happened
    const [hasScanned, setHasScanned] = useState(false);

    const handleScan = async (target, startPort, endPort, scanTcp, scanUdp, commonPortsOnly) => {
        setIsScanning(true);
        setResults([]);
        setError(null);
        setHasScanned(true); 

        const rangeText = commonPortsOnly ? "Common Ports" : `${startPort}-${endPort}`;
        setScanStats({ target, range: rangeText });

        try {
            // Use relative path for Vite proxy
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target,
                    start_port: parseInt(startPort),
                    end_port: parseInt(endPort),
                    scan_tcp: scanTcp,
                    scan_udp: scanUdp,
                    common_ports_only: commonPortsOnly,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to connect to scanner backend' }));
                throw new Error(errorData.detail || 'Unknown backend error');
            }

            const data = await response.json();
            setResults(data.results);
            // Update scan stats with the range returned from the backend for consistency
            setScanStats({ target, range: data.scanned_range });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await fetch('/api/download/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target: scanStats.target,
                    scanned_range: scanStats.range,
                    results: results,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sentinel_audit_report_${scanStats.target}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="app-container relative min-h-screen p-8 text-white">
            <div className="scan-overlay"></div>

            {/* Header */}
            <header className="flex items-center justify-between mb-12 animate-fade-in-down">
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-cyan-500 rounded bg-cyan-500/10">
                        <Terminal className="w-8 h-8 text-[var(--accent-cyan)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                            SENTINEL_AUDIT
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)] tracking-widest">
                            PROFESSIONAL PORT SCANNER & VULNERABILITY ANALYZER
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--accent-green)] glass-panel px-4 py-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse"></div>
                        SYSTEM ACTIVE
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Col: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="glass-panel p-6">
                        <h2 className="text-xl mb-6 flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-[var(--accent-cyan)]" />
                            TARGET CONFIGURATION
                        </h2>
                        <ScanForm onScan={handleScan} isScanning={isScanning} />
                    </section>

                    <section className="glass-panel p-6">
                        <h2 className="text-xl mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-[var(--accent-purple)]" />
                            STATUS LOG
                        </h2>
                        <div className="font-mono text-sm space-y-2 h-48 overflow-y-auto text-[var(--text-secondary)]">
                            <div className="text-[var(--accent-green)]"> System Initialized...</div>
                            
                            {isScanning && (
                                <div className="text-[var(--accent-cyan)] animate-pulse">
                                     Scanning Target {scanStats.target} ({scanStats.range})...
                                </div>
                            )}
                            
                            {error && (
                                <div className="text-[var(--accent-red)]">
                                     Error: {error}
                                </div>
                            )}
                            
                            {!isScanning && hasScanned && results.length > 0 && (
                                <div className="text-[var(--accent-green)]">
                                     Scan Complete. Found {results.length} open ports.
                                </div>
                            )}
                            
                            {!isScanning && hasScanned && results.length === 0 && !error && (
                                <div className="text-[var(--text-secondary)]">
                                     Scan Complete. No open ports found.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Col: Visualization/Results */}
                <div className="lg:col-span-8">
                    <section className="glass-panel p-6 min-h-[600px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[var(--accent-cyan)]" />
                                SCAN ANALYSIS RESULTS
                            </h2>
                            {!isScanning && hasScanned && results.length > 0 && (
                                <button onClick={handleDownloadPdf} className="flex items-center gap-2 text-sm text-[var(--accent-cyan)] glass-panel px-4 py-2 hover:bg-cyan-500/20 transition-all duration-300">
                                    <Download className="w-4 h-4" />
                                    Download Report
                                </button>
                            )}
                        </div>

                        {/* 1. Loading State */}
                        {isScanning && (
                            <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-16 h-16 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-mono text-[var(--accent-cyan)] animate-pulse">
                                    SCANNING PORTS {scanStats.range}...
                                </p>
                            </div>
                        )}

                        {/* 2. Results State */}
                        {!isScanning && hasScanned && results.length > 0 && (
                            <ResultsTable results={results} />
                        )}

                        {/* 3. Empty Results State */}
                        {!isScanning && hasScanned && results.length === 0 && !error && (
                            <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-[var(--accent-red)] opacity-80">
                                <ShieldAlert className="w-24 h-24 mb-4" />
                                <p className="font-bold tracking-widest">SCAN COMPLETE</p>
                                <p className="text-sm mt-2">NO OPEN PORTS FOUND ON TARGET</p>
                            </div>
                        )}

                        {/* 4. Initial "Waiting" State */}
                        {!isScanning && !hasScanned && (
                            <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-[var(--text-secondary)] opacity-50">
                                <Terminal className="w-24 h-24 mb-4" />
                                <p>WAITING FOR TARGET...</p>
                            </div>
                        )}
                    </section>
                </div>

            </main>
        </div>
    );
}

export default App;