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
    const [progress, setProgress] = useState(0);

    const handleScan = async (target, startPort, endPort, scanTcp, scanUdp, commonPortsOnly) => {
        setIsScanning(true);
        setResults([]);
        setError(null);
        setHasScanned(true); 
        setProgress(0);

        const rangeText = commonPortsOnly ? "Common Ports" : `${startPort}-${endPort}`;
        setScanStats({ target, range: rangeText });

        const progressInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/progress');
                if (res.ok) {
                    const data = await res.json();
                    if (data.total > 0) {
                        setProgress(Math.round((data.current / data.total) * 100));
                    }
                }
            } catch (e) {
                console.error("Progress fetch error:", e);
            }
        }, 500);

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
            clearInterval(progressInterval);
            setProgress(100);
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

    const handleCancel = async () => {
        try {
            await fetch('/api/cancel', { method: 'POST' });
        } catch (e) {
            console.error("Cancel fetch error:", e);
        }
    };

    return (
        <div className="h-screen p-4 md:p-8 text-white bg-[var(--bg-primary)] flex flex-col w-full overflow-hidden">
            <div className="w-full h-full flex flex-col max-w-full">
                {/* Header */}
                <header className="flex items-center justify-between mb-6 shrink-0 w-full">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--bg-secondary)] border border-[#333] rounded-lg">
                            <Terminal className="w-8 h-8 text-[var(--accent-orange)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                SENTINEL AUDIT
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                Professional Port Scanner & Vulnerability Analyzer
                            </p>
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1 min-h-0">
                
                {/* Left Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-[var(--bg-secondary)] border border-[#333] rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-[var(--accent-orange)] rounded-full"></div>
                            <h2 className="text-lg font-semibold tracking-wide">PARAMETERS</h2>
                        </div>
                        <ScanForm onScan={handleScan} isScanning={isScanning} />
                    </section>
                </div>

                {/* Right Main Area */}
                <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
                    
                    {/* Top Stats Dashboard */}
                    <div className="grid grid-cols-2 gap-6 shrink-0">
                        <div className="bg-[var(--bg-secondary)] border border-[#333] rounded-xl p-6 shadow-lg flex flex-col justify-center">
                            <div className="text-[var(--text-secondary)] text-sm font-semibold mb-2 uppercase tracking-wider">Status</div>
                            {isScanning ? (
                                <div className="text-2xl font-bold text-[var(--accent-orange)] flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-orange)] border-t-transparent animate-spin"></div>
                                    Scanning...
                                </div>
                            ) : hasScanned ? (
                                <div className="text-2xl font-bold text-[#0aff0a] flex items-center gap-2">
                                    <ShieldAlert className="w-6 h-6" /> Completed
                                </div>
                            ) : (
                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-[#888]" /> Idle
                                </div>
                            )}
                            {error && <div className="text-sm text-[var(--accent-red)] mt-2 font-mono truncate selectable-text">{error}</div>}
                        </div>
                        
                        <div className="bg-[var(--bg-secondary)] border border-[#333] rounded-xl p-6 shadow-lg flex flex-col justify-center">
                            <div className="text-[var(--text-secondary)] text-sm font-semibold mb-2 uppercase tracking-wider">Open Ports Found</div>
                            <div className="text-4xl font-bold text-white">
                                {hasScanned && !isScanning ? results.length : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Scan Results Area */}
                    <section className="bg-[var(--bg-secondary)] border border-[#333] rounded-xl p-4 md:p-6 shadow-lg flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#333]">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-[#666] rounded-full"></div>
                                <h2 className="text-lg font-semibold tracking-wide">RESULTS: <span className="text-[var(--text-secondary)] font-normal selectable-text">{scanStats.target || 'None'}</span></h2>
                            </div>
                            {!isScanning && hasScanned && results.length > 0 && (
                                <button onClick={handleDownloadPdf} className="flex items-center gap-2 text-sm text-black bg-white px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            )}
                        </div>

                        {/* 1. Loading State */}
                        {isScanning && (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-[var(--accent-orange)] border-t-transparent rounded-full animate-spin mb-6"></div>
                                <p className="font-mono text-[var(--accent-orange)] animate-pulse tracking-widest mb-4">
                                    ANALYZING {scanStats.range}...
                                </p>
                                <div className="w-1/2 max-w-md bg-[#333] rounded-full h-4 overflow-hidden border border-[#555]">
                                    <div className="bg-[var(--accent-orange)] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-white mt-2 text-sm">{progress}% Complete</p>
                                <button 
                                    onClick={handleCancel}
                                    className="mt-8 px-6 py-2 bg-transparent border border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-white rounded font-bold transition-colors cursor-pointer"
                                >
                                    CANCEL SCAN
                                </button>
                            </div>
                        )}

                        {/* 2. Results State */}
                        {!isScanning && hasScanned && results.length > 0 && (
                            <div className="flex-1 overflow-auto">
                                <ResultsTable results={results} />
                            </div>
                        )}

                        {/* 3. Empty Results State */}
                        {!isScanning && hasScanned && results.length === 0 && !error && (
                            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-80">
                                <ShieldAlert className="w-20 h-20 mb-6 text-[#555]" />
                                <p className="font-bold tracking-widest text-lg">SCAN COMPLETE</p>
                                <p className="text-sm mt-2">NO OPEN PORTS DETECTED</p>
                            </div>
                        )}

                        {/* 4. Initial "Waiting" State */}
                        {!isScanning && !hasScanned && (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#444]">
                                <Terminal className="w-20 h-20 mb-6" />
                                <p className="tracking-widest font-medium">AWAITING TARGET CONFIGURATION</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
            </div>
        </div>
    );
}

export default App;