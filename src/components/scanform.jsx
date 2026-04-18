import { useState } from 'react';
import { Target, Play, SlidersHorizontal, Zap, RadioTower, Globe } from 'lucide-react';

const ScanForm = ({ onScan, onPingSweep, isScanning }) => {
    const [mode, setMode] = useState('port-scan'); // 'port-scan' or 'network-map'

    const [target, setTarget] = useState('127.0.0.1');
    const [startPort, setStartPort] = useState('1');
    const [endPort, setEndPort] = useState('1024');

    const [subnet, setSubnet] = useState('192.168.1.0/24');

    // New state for scan options
    const [scanTcp, setScanTcp] = useState(true);
    const [scanUdp, setScanUdp] = useState(false);
    const [commonPortsOnly, setCommonPortsOnly] = useState(false);
    const [scanTypeWarning, setScanTypeWarning] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (mode === 'network-map') {
            onPingSweep(subnet);
            return;
        }

        if (!scanTcp && !scanUdp) {
            setScanTypeWarning('Please select at least one scan type (TCP or UDP).');
            return;
        }
        setScanTypeWarning('');
        onScan(target, startPort, endPort, scanTcp, scanUdp, commonPortsOnly);
    };

    const handleFullScanClick = () => {
        setStartPort('1');
        setEndPort('65535');
        setCommonPortsOnly(false); // Full scan overrides common ports
    };
    
    // When "Common" is checked, disable port inputs
    const handleCommonPortsChange = (e) => {
        setCommonPortsOnly(e.target.checked);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mode Selection Toggle */}
            <div className="flex bg-[#111] p-1 rounded-lg border border-[#333]">
                <button
                    type="button"
                    onClick={() => setMode('port-scan')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${mode === 'port-scan' ? 'bg-[var(--accent-orange)] text-black' : 'text-[#888] hover:text-white'}`}
                >
                    <Target className="w-4 h-4" /> Port Scan
                </button>
                <button
                    type="button"
                    onClick={() => setMode('network-map')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${mode === 'network-map' ? 'bg-[var(--accent-orange)] text-black' : 'text-[#888] hover:text-white'}`}
                >
                    <RadioTower className="w-4 h-4" /> Network Map
                </button>
            </div>

            {mode === 'port-scan' ? (
                <>
                    {/* Target Input */}
                    <div className="space-y-2 animate-fade-in">
                        <label className="block text-xs font-bold tracking-wider text-[var(--accent-orange)]">TARGET CONFIG</label>
                        <div className="relative group">
                            <Target className="absolute left-3 top-3 w-5 h-5 text-[var(--text-secondary)]" />
                            <input
                                type="text"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="Target IP Address or Hostname"
                                className="w-full bg-[var(--bg-secondary)] border border-[#333] rounded p-3 pl-10 text-white focus:outline-none focus:border-[var(--accent-orange)] font-mono transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Scan Type Selection */}
                    <div className="space-y-3 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`custom-checkbox ${scanTcp ? 'active' : ''}`}>
                                <input type="checkbox" checked={scanTcp} onChange={(e) => setScanTcp(e.target.checked)} />
                                TCP Connect
                            </label>
                            <label className={`custom-checkbox ${scanUdp ? 'active' : ''}`}>
                                <input type="checkbox" checked={scanUdp} onChange={(e) => setScanUdp(e.target.checked)} />
                                UDP Scan
                            </label>
                        </div>
                        {scanTypeWarning && <p className="text-xs text-[var(--accent-red)] mt-1">{scanTypeWarning}</p>}
                    </div>
                    
                    {/* Port Selection */}
                    <div className="space-y-3 pt-2 border-t border-[#333] animate-fade-in">
                        <label className="block text-xs font-bold tracking-wider text-[var(--text-secondary)]">PORT RANGE</label>
                        
                        <label className={`custom-checkbox ${commonPortsOnly ? 'active' : ''}`}>
                            <input type="checkbox" checked={commonPortsOnly} onChange={handleCommonPortsChange} />
                            Common Ports Only
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Start Port"
                                value={startPort}
                                onChange={(e) => setStartPort(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[var(--accent-orange)] font-mono disabled:opacity-50 transition-colors"
                                required={mode === 'port-scan'}
                                disabled={commonPortsOnly || isScanning}
                            />
                            <input
                                type="number"
                                placeholder="End Port"
                                value={endPort}
                                onChange={(e) => setEndPort(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[var(--accent-orange)] font-mono disabled:opacity-50 transition-colors"
                                required={mode === 'port-scan'}
                                disabled={commonPortsOnly || isScanning}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleFullScanClick}
                            disabled={isScanning}
                            className="w-full py-2 px-3 text-sm rounded bg-[#1a1a1a] text-[var(--text-secondary)] hover:bg-[#222] border border-[#333] transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
                        >
                            <Zap className="w-4 h-4" /> Full Scan (1–65535)
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-2 animate-fade-in">
                    <label className="block text-xs font-bold tracking-wider text-[var(--accent-orange)]">SUBNET TO MAP</label>
                    <div className="relative group">
                        <Globe className="absolute left-3 top-3 w-5 h-5 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            value={subnet}
                            onChange={(e) => setSubnet(e.target.value)}
                            placeholder="e.g. 192.168.1.0/24"
                            className="w-full bg-[var(--bg-secondary)] border border-[#333] rounded p-3 pl-10 text-white focus:outline-none focus:border-[var(--accent-orange)] font-mono transition-colors"
                            required
                        />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                        Executes a high-speed ICMP Ping Sweep across the entire subnet to discover actively assigned local IP addresses.
                    </p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isScanning}
                className={`w-full py-4 px-4 mt-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${isScanning ? 'bg-[#333] text-[#888] cursor-not-allowed' : 'bg-[var(--accent-orange)] text-black hover:bg-[#ff8533] cursor-pointer'}`}
            >
                {isScanning 
                    ? 'SCANNING...' 
                    : <><Play className="w-5 h-5 fill-current" /> {mode === 'port-scan' ? 'START SCAN' : 'START DISCOVERY'}</>
                }
            </button>
        </form>
    );
};

export default ScanForm;