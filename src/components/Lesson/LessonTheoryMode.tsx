import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle2 } from 'lucide-react';

export const LessonTheoryMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'theory' | 'sandbox'>('theory');
  const [code, setCode] = useState('// Enter bash or terminal exploit payload\nnslookup -type=TXT _aether_beacon.sectorzero.net');
  const [output, setOutput] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRunCode = () => {
    if (code.includes('nslookup') || code.includes('dns')) {
      setOutput('Server: 127.0.0.1\nAddress: 127.0.0.1#53\n\n_aether_beacon.sectorzero.net text = "aether_key=0x99A8F_DECRYPT_OK"');
      setIsSuccess(true);
    } else {
      setOutput('Error: Command not recognized or insufficient privileges.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0e14]/95 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <BookOpen size={20} className="text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-cyan-300 tracking-wider">OPERATION THEORY // LESSON LAB</h2>
            <p className="text-[11px] text-gray-400">DNS RECONNAISSANCE & MESH ANALYSIS</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1 rounded transition uppercase font-bold ${
              activeTab === 'theory'
                ? 'bg-cyan-500 text-black'
                : 'bg-black/40 text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            THEORY DOCS
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1 rounded transition uppercase font-bold ${
              activeTab === 'sandbox'
                ? 'bg-cyan-500 text-black'
                : 'bg-black/40 text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            CODE SANDBOX
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto my-3 pr-2 text-xs space-y-4">
        {activeTab === 'theory' ? (
          <div className="space-y-4">
            <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-2">
              <h3 className="text-cyan-300 font-bold text-xs">MODULE 03: DOMAIN NAME SYSTEM RECONNAISSANCE</h3>
              <p className="text-gray-400 leading-relaxed">
                The Domain Name System (DNS) translates human-readable domain names to numerical IP addresses. In cyber operations, inspecting DNS TXT and MX records allows operatives to map hidden infrastructure without triggering aggressive firewalls.
              </p>
            </div>

            <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-2">
              <h3 className="text-cyan-300 font-bold text-xs">KEY COMMAND SYNTAX</h3>
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded font-mono text-teal-300">
                nslookup -type=TXT target_domain.net
              </div>
              <p className="text-gray-400 text-[11px]">Queries TXT records containing cryptographic keys or verification tokens.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex-1 bg-black/90 border border-cyan-500/30 rounded-lg p-3 font-mono text-xs flex flex-col">
              <span className="text-gray-500 border-b border-cyan-500/20 pb-1 mb-2">SANDBOX EDITOR</span>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full flex-1 bg-transparent text-cyan-200 focus:outline-none resize-none font-mono"
                rows={6}
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleRunCode}
                className="px-4 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition flex items-center space-x-2"
              >
                <Play size={14} />
                <span>EXECUTE SANDBOX PAYLOAD</span>
              </button>

              {isSuccess && (
                <span className="text-teal-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> EXPLOIT VALIDATED
                </span>
              )}
            </div>

            {output && (
              <div className="p-3 bg-black/80 border border-cyan-500/30 rounded font-mono text-cyan-300 whitespace-pre-wrap">
                {output}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[11px] text-gray-500 border-t border-cyan-500/20 pt-2">
        <span>CYBER ACADEMY THEORY ENGINE</span>
        <span className="text-cyan-400">MODULE STATUS: ACTIVE</span>
      </div>
    </div>
  );
};
