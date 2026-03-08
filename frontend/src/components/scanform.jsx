import { useState } from 'react';
import { Target, Play, ShieldQuestion, SlidersHorizontal, Zap } from 'lucide-react';

const ScanForm = ({ onScan, isScanning }) => {
    const [target, setTarget] = useState('127.0.0.1');
    const [startPort, setStartPort] = useState('1');
    const [endPort, setEndPort] = useState('1024');

    // New state for scan options
    const [scanTcp, setScanTcp] = useState(true);
    const [scanUdp, setScanUdp] = useState(false);
    const [commonPortsOnly, setCommonPortsOnly] = useState(false);
    const [scanTypeWarning, setScanTypeWarning] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
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
            {/* Target Input */}
            <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider text-[var(--accent-cyan)]">TARGET HOST / IP</label>
                <div className="relative group">
                    <Target className="absolute left-3 top-3 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-gray-800 rounded p-2 pl-10 text-white focus:outline-none focus:border-[var(--accent-cyan)] font-mono"
                        required
                    />
                </div>
            </div>

            {/* Scan Type Selection */}
            <div className="space-y-3">
                <label className="block text-xs font-bold tracking-wider text-[var(--accent-cyan)]">SCAN TYPE</label>
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
                {scanTypeWarning && <p className="text-xs text-red-500 mt-1">{scanTypeWarning}</p>}
            </div>
            
            {/* Port Selection */}
            <div className="space-y-3">
                <label className="block text-xs font-bold tracking-wider text-[var(--accent-purple)]">PORT SELECTION</label>
                
                <label className={`custom-checkbox-purple ${commonPortsOnly ? 'active' : ''}`}>
                    <input type="checkbox" checked={commonPortsOnly} onChange={handleCommonPortsChange} />
                    Common Ports Only
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        placeholder="Start Port"
                        value={startPort}
                        onChange={(e) => setStartPort(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-gray-800 rounded p-2 text-white focus:border-[var(--accent-purple)] font-mono disabled:opacity-50"
                        required
                        disabled={commonPortsOnly || isScanning}
                    />
                    <input
                        type="number"
                        placeholder="End Port"
                        value={endPort}
                        onChange={(e) => setEndPort(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-gray-800 rounded p-2 text-white focus:border-[var(--accent-purple)] font-mono disabled:opacity-50"
                        required
                        disabled={commonPortsOnly || isScanning}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleFullScanClick}
                    disabled={isScanning}
                    className="w-full py-2 px-3 text-sm rounded bg-gray-800/50 text-[var(--text-secondary)] hover:bg-gray-800/80 transition-colors flex items-center justify-center gap-2"
                >
                    <Zap className="w-4 h-4" /> Full Scan (1–65535)
                </button>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isScanning}
                className={`w-full py-3 px-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${isScanning ? 'bg-gray-800 cursor-not-allowed' : 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)]'}`}
            >
                {isScanning ? 'SCANNING...' : <><Play className="w-5 h-5" /> INITIATE SCAN</>}
            </button>
        </form>
    );
};

export default ScanForm;