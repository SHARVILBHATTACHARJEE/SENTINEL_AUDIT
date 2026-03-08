import { AlertTriangle, CheckCircle, Server } from 'lucide-react';

const ResultsTable = ({ results }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-800 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                        <th className="p-4">Port</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Banner / Info</th>
                        <th className="p-4">Vulnerability Assessment</th>
                    </tr>
                </thead>
                <tbody className="font-mono text-sm">
                    {results.map((res, idx) => (
                        <tr key={idx} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                            <td className="p-4 text-[var(--accent-cyan)] font-bold">{res.port}</td>
                            <td className="p-4"><span className="flex items-center gap-2 text-[var(--accent-green)]"><CheckCircle className="w-4 h-4" /> Open</span></td>
                            <td className="p-4 flex items-center gap-2"><Server className="w-4 h-4 text-gray-500" /> {res.service}</td>
                            <td className="p-4 text-gray-400">{res.banner || '-'}</td>
                            <td className="p-4">
                                <div className="space-y-1">
                                    <div className="text-white font-semibold">{res.attack_vector}</div>
                                    <div className="text-xs text-gray-500 flex items-start gap-1">
                                        <AlertTriangle className="w-3 h-3 text-[var(--accent-red)] mt-0.5" />
                                        {res.vulnerability_check}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultsTable;