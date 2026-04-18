import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, Laptop, Server, Router } from 'lucide-react';

const NetworkGraph = ({ hosts, subnet }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const graphRef = useRef();

    useEffect(() => {
        if (!hosts || hosts.length === 0) return;

        // Determine base gateway (e.g. 192.168.1.1 usually or just representing the subnet switch)
        const gatewayIP = hosts.length > 0 ? hosts[0].split('.').slice(0, 3).join('.') + '.1' : subnet;

        const nodes = [];
        const links = [];

        // Center Switch Hub Node
        nodes.push({
            id: 'gateway',
            ip: gatewayIP,
            name: 'Local Gateway / Switch',
            group: 0,
            val: 8 
        });

        // Add Active Hosts
        hosts.forEach((ip, idx) => {
            if (ip === gatewayIP && nodes.length > 1) return; // Skip if already added as gateway

            nodes.push({
                id: ip,
                ip: ip,
                name: `Host Node`,
                group: 1,
                val: 5
            });

            links.push({
                source: 'gateway',
                target: ip,
                distance: 50
            });
        });

        setGraphData({ nodes, links });
    }, [hosts, subnet]);

    return (
        <div className="w-full h-[500px] bg-[#0c0c0c] border border-[#333] rounded-xl overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
                <div className="bg-black/80 border border-[var(--accent-orange)] text-[var(--accent-orange)] px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold tracking-widest backdrop-blur-sm">
                    <Network className="w-4 h-4" /> LIVE TOPOLOGY
                </div>
                <div className="text-[#888] text-[10px] uppercase pl-1 mt-1">Scroll to Zoom • Drag to Move Nodes</div>
            </div>

            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeAutoColorBy="group"
                backgroundColor="#0c0c0c"
                linkColor={() => '#444'}
                linkOpacity={0.5}
                linkWidth={2}
                onEngineStop={() => {
                    // This fires when the physics engine settles, centering the nodes perfectly on screen!
                    if (graphRef.current) {
                        graphRef.current.zoomToFit(800, 100);
                    }
                }}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.ip;
                    const fontSize = 14/globalScale;
                    ctx.font = `600 ${fontSize}px "Courier New"`;
                    
                    // Node dot
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.group === 0 ? '#ff8533' : '#0aff0a'; 
                    ctx.fill();
                    
                    ctx.shadowColor = node.group === 0 ? '#ff8533' : '#0aff0a';
                    ctx.shadowBlur = 15;

                    // IP Text
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#fff';
                    ctx.shadowBlur = 0;
                    ctx.fillText(label, node.x, node.y + node.val + 8);
                }}
            />
        </div>
    );
};

export default NetworkGraph;
