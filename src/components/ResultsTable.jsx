import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Server, Info, X } from 'lucide-react';

const ResultsTable = ({ results }) => {
    const [selectedResult, setSelectedResult] = useState(null);

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#333] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold pb-3">Port</th>
                            <th className="p-4 font-semibold pb-3">Status</th>
                            <th className="p-4 font-semibold pb-3">Service</th>
                            <th className="p-4 font-semibold pb-3">Severity</th>
                            <th className="p-4 font-semibold pb-3">Banner / Info</th>
                            <th className="p-4 font-semibold pb-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {results.map((res, idx) => (
                            <tr 
                                key={idx} 
                                onClick={() => setSelectedResult(res)}
                                className="border-b border-[#222] hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <td className="p-4 text-[var(--accent-orange)] font-bold text-base selectable-text">{res.port}</td>
                                <td className="p-4">
                                    <span className="flex items-center gap-2 text-[#0aff0a] bg-[#0aff0a]/10 px-2 py-1 rounded w-fit text-xs font-semibold">
                                        <CheckCircle className="w-3 h-3" /> OPEN
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Server className="w-4 h-4 text-white/50" /> {res.service}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${res.base_severity === 'CRITICAL' ? 'bg-[#ff2a2a]/20 text-[#ff2a2a]' : res.base_severity === 'HIGH' ? 'bg-[#ff8533]/20 text-[#ff8533]' : res.base_severity === 'LOW' ? 'bg-[#0aff0a]/20 text-[#0aff0a]' : 'bg-[#ffd700]/20 text-[#ffd700]'}`}>
                                        {res.base_severity || 'LOW'}
                                    </span>
                                </td>
                                <td className="p-4 text-white/50 truncate max-w-[200px] selectable-text">
                                    {res.banner || '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        className="text-[var(--text-secondary)] group-hover:text-white transition-colors"
                                        title="View Details"
                                    >
                                        <Info className="w-5 h-5 ml-auto" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {selectedResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--bg-secondary)] border border-[#333] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#333] bg-black/40">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] rounded-lg">
                                    <Server className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-white selectable-text">Port {selectedResult.port} Details</h3>
                                    <p className="text-[var(--text-secondary)] text-sm uppercase tracking-wide">{selectedResult.service} Service</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedResult(null)}
                                className="p-2 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            
                            {/* Grid 1: Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 border border-[#333] p-4 rounded-lg">
                                    <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">State</div>
                                    <div className="text-[#0aff0a] font-mono font-bold flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> OPEN
                                    </div>
                                </div>
                                <div className="bg-black/40 border border-[#333] p-4 rounded-lg">
                                    <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Service</div>
                                    <div className="text-white font-mono">{selectedResult.service}</div>
                                </div>
                            </div>

                            {/* Banner Data */}
                            <div className="bg-black/40 border border-[#333] p-4 rounded-lg">
                                <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Banner / Response Information
                                </div>
                                <div className="text-white font-mono text-sm whitespace-pre-wrap break-words bg-black/50 p-3 rounded selectable-text">
                                    {selectedResult.banner || 'No banner retrieved.'}
                                </div>
                            </div>
                            
                            {/* Live NIST NVD CVE Data */}
                            {selectedResult.cve_data !== undefined && (
                                <div className="border border-[var(--accent-orange)]/30 bg-[var(--accent-orange)]/5 p-5 rounded-lg">
                                    <h4 className="flex items-center gap-2 text-[var(--accent-orange)] font-semibold mb-3 border-b border-[var(--accent-orange)]/20 pb-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Live CVE Intelligence (NIST Database)
                                    </h4>
                                    
                                    {selectedResult.cve_data && selectedResult.cve_data.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedResult.cve_data.map((cve, i) => (
                                                <div key={i} className="bg-black/40 border border-[#333] p-3 rounded">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="text-sm font-bold text-[#ff4444] selectable-text">{cve.id}</div>
                                                        <div className="text-xs font-bold px-2 rounded tracking-widest" style={{
                                                            color: cve.severity === 'CRITICAL' ? '#ff2a2a' : cve.severity === 'HIGH' ? '#ff8533' : '#ffd700',
                                                            backgroundColor: cve.severity === 'CRITICAL' ? 'rgba(255,42,42,0.1)' : cve.severity === 'HIGH' ? 'rgba(255,133,51,0.1)' : 'rgba(255,215,0,0.1)'
                                                        }}>
                                                            {cve.severity} {(cve.baseScore > 0) ? `(${cve.baseScore})` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-[var(--text-secondary)] leading-relaxed selectable-text">{cve.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-[var(--text-secondary)] italic">
                                            No verified CVEs found directly matching the grabbed banner software version. Assessment relies on generic architecture vectors below.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Vulnerability Assessment */}
                            <div className="border border-[var(--accent-red)]/30 bg-[var(--accent-red)]/5 p-5 rounded-lg">
                                <h4 className="flex items-center gap-2 text-[var(--accent-red)] font-semibold mb-3 border-b border-[var(--accent-red)]/20 pb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Vulnerability Assessment
                                </h4>
                                
                                <div className="mb-4">
                                    <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Identified Attack Vector</div>
                                    <div className="text-white font-semibold selectable-text">
                                        {selectedResult.attack_vector || 'None identified'}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Security Recommendation</div>
                                    <div className="text-[var(--text-secondary)] text-sm leading-relaxed selectable-text">
                                        {selectedResult.vulnerability_check || 'Perform routine security audits.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#333] bg-black/40 flex justify-end">
                            <button 
                                onClick={() => setSelectedResult(null)}
                                className="px-6 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResultsTable;