import React, { useState, useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';

interface EvidenceNode {
  id: string;
  title: string;
  type: 'actor' | 'document' | 'server';
  description: string;
  x: number;
  y: number;
  unlocked: boolean;
  requiredLesson?: string;
}

interface ConspiracyBoardProps {
  completedLessons: Set<string>;
}

export const ConspiracyBoard: React.FC<ConspiracyBoardProps> = ({ completedLessons }) => {
  const { playUiClick } = useAudioStore();
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Conspiracy board notes coordinate states
  const [nodes, setNodes] = useState<EvidenceNode[]>([
    {
      id: 'aurelia',
      title: 'Aurelia Daemon',
      type: 'actor',
      description: 'Tactical OS AI construct. Linked memory blocks suggest she was built by Arthur Hesper before the crash.',
      x: 40,
      y: 50,
      unlocked: true,
    },
    {
      id: 'intruder',
      title: 'Packet Intercepts',
      type: 'document',
      description: 'Secured pcap logs from Sector Zero network interfaces showing trace routes to a Syndicate shell server.',
      x: 320,
      y: 40,
      unlocked: false,
      requiredLesson: 'B01',
    },
    {
      id: 'aethercorp',
      title: 'AetherCorp Buffers',
      type: 'server',
      description: 'Decrypted memory grids containing executive records detailing Neural Veil development contracts.',
      x: 40,
      y: 240,
      unlocked: false,
      requiredLesson: 'B05',
    },
    {
      id: 'hesper',
      title: 'Dr. Arthur Hesper',
      type: 'actor',
      description: 'Chief Scientist of Neural Veil project. Reported dead in the reactor explosion, but terminal keys remain active.',
      x: 320,
      y: 250,
      unlocked: false,
      requiredLesson: 'B08',
    },
  ]);

  // Connection definitions (red threads)
  const connections = [
    { from: 'aurelia', to: 'hesper' },
    { from: 'intruder', to: 'aurelia' },
    { from: 'aethercorp', to: 'hesper' },
    { from: 'intruder', to: 'aethercorp' },
  ];

  // Dynamically unlock nodes when lessons are completed
  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.requiredLesson && completedLessons.has(node.requiredLesson)) {
          return { ...node, unlocked: true };
        }
        return node;
      })
    );
  }, [completedLessons]);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === id);
    if (!node || !node.unlocked) return;

    playUiClick();
    setActiveDragId(id);

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (boardRect) {
      dragOffsetRef.current = {
        x: e.clientX - boardRect.left - node.x,
        y: e.clientY - boardRect.top - node.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!activeDragId || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(boardRect.width - 210, e.clientX - boardRect.left - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(boardRect.height - 130, e.clientY - boardRect.top - dragOffsetRef.current.y));

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === activeDragId ? { ...node, x: newX, y: newY } : node
      )
    );
  };

  const handleMouseUp = () => {
    if (activeDragId) {
      setActiveDragId(null);
    }
  };

  useEffect(() => {
    if (activeDragId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragId, nodes]);

  // Find node coordinates helper for connection rendering
  const getNodeCenter = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0 };
    // Node dimensions are 190x110
    return { x: node.x + 95, y: node.y + 55 };
  };

  return (
    <div 
      ref={boardRef}
      className="w-full h-full min-h-[380px] bg-[#0c0c11] rounded border border-primary/10 relative overflow-hidden select-none font-mono"
      style={{
        backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      {/* SVG Canvas overlay for the connecting red strings */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
        <defs>
          <filter id="neon-glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {connections.map((conn, idx) => {
          const fromNode = nodes.find((n) => n.id === conn.from);
          const toNode = nodes.find((n) => n.id === conn.to);
          
          // Only draw connection if both nodes are unlocked
          if (!fromNode?.unlocked || !toNode?.unlocked) return null;

          const p1 = getNodeCenter(conn.from);
          const p2 = getNodeCenter(conn.to);

          return (
            <g key={idx}>
              {/* Pulsing glow line */}
              <line 
                x1={p1.x} 
                y1={p1.y} 
                x2={p2.x} 
                y2={p2.y} 
                stroke="#ff0055" 
                strokeWidth="1.5" 
                strokeDasharray="4, 4"
                filter="url(#neon-glow-red)"
                className="animate-pulse"
                opacity="0.85"
              />
              {/* Pin anchors */}
              <circle cx={p1.x} cy={p1.y} r="3" fill="#ff00ff" />
              <circle cx={p2.x} cy={p2.y} r="3" fill="#ff00ff" />
            </g>
          );
        })}
      </svg>

      {/* Render Draggable Evidence Nodes */}
      {nodes.map((node) => {
        const isDragging = activeDragId === node.id;
        
        return (
          <div
            key={node.id}
            onMouseDown={(e) => handleMouseDown(node.id, e)}
            style={{
              position: 'absolute',
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: '190px',
              height: '110px',
              cursor: node.unlocked ? (isDragging ? 'grabbing' : 'grab') : 'not-allowed',
            }}
            className={`z-20 p-2.5 rounded border flex flex-col justify-between transition-shadow duration-200 select-none ${
              node.unlocked
                ? isDragging
                  ? 'border-secondary bg-[#1a0e1b]/95 shadow-[0_0_12px_rgba(255,0,255,0.4)] z-30'
                  : 'border-primary/30 bg-[#0d0d12]/90 hover:border-primary shadow-inner hover:shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                : 'border-white/5 bg-white/[0.02] opacity-25'
            }`}
          >
            {node.unlocked ? (
              <>
                <div className="flex justify-between items-start border-b border-primary/20 pb-1 mb-1 shrink-0">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    node.type === 'actor' ? 'text-secondary' : node.type === 'server' ? 'text-warning' : 'text-success'
                  }`}>
                    {node.type === 'actor' ? '👤 ' : node.type === 'server' ? '💾 ' : '📄 '}
                    {node.title}
                  </span>
                  <span className="text-[7.5px] text-textMuted uppercase font-bold">PINNED</span>
                </div>
                <p className="text-[8px] text-textMain leading-relaxed font-sans select-none overflow-y-auto max-h-[64px] scrollbar pr-0.5">
                  {node.description}
                </p>
              </>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center text-center gap-1.5 p-1 select-none">
                <span className="text-sm">🔒</span>
                <span className="text-[7px] text-textMuted font-bold uppercase tracking-widest">
                  LOCKED // LOAD {node.requiredLesson}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Visual Instruction Grid Overlay */}
      <div className="absolute bottom-2 right-3 text-[7.5px] font-bold text-textMuted uppercase select-none opacity-50 z-20">
        Intel Sniff Grid: ACT_I_RECON
      </div>
    </div>
  );
};
export default ConspiracyBoard;
