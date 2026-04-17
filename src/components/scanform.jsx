import { useState } from 'react';
import { Target, Play, SlidersHorizontal, Zap } from 'lucide-react';

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
            <div className="space-y-3">
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
            <div className="space-y-3 pt-2 border-t border-[#333]">
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
                        required
                        disabled={commonPortsOnly || isScanning}
                    />
                    <input
                        type="number"
                        placeholder="End Port"
                        value={endPort}
                        onChange={(e) => setEndPort(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[var(--accent-orange)] font-mono disabled:opacity-50 transition-colors"
                        required
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

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isScanning}
                className={`w-full py-4 px-4 mt-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${isScanning ? 'bg-[#333] text-[#888] cursor-not-allowed' : 'bg-[var(--accent-orange)] text-black hover:bg-[#ff8533] cursor-pointer'}`}
            >
                {isScanning ? 'SCANNING...' : <><Play className="w-5 h-5 fill-current" /> START SCAN</>}
            </button>
        </form>
    );
};

export default ScanForm;