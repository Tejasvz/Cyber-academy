import React, { useState, useEffect } from 'react';

interface BottomStatusBarProps {
  username?: string;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({ username = 'FRAGMENT' }) => {
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(16056);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSecs: number) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <footer className="h-10 w-full fixed bottom-0 left-0 flex justify-between items-center px-4 bg-[#0c1324]/85 backdrop-blur-md border-t border-[#22d3ee]/20 z-30 select-none pointer-events-auto">
      {/* Left Info */}
      <div className="flex gap-4 font-mono-cyber text-[10px] text-[#22d3ee]/70">
        <div>
          ACTIVE USER: <span className="text-[#22d3ee] font-bold">{username.toUpperCase()}</span>
        </div>
        <div className="hidden sm:block">SESSION: 7G23-XQ9P-A1</div>
        <div>UPTIME: {formatUptime(uptimeSeconds)}</div>
      </div>

      {/* Right System Telemetry */}
      <div className="flex gap-4 font-mono-cyber text-[10px] text-[#22d3ee]/70 items-center">
        {/* CPU */}
        <div className="flex items-center gap-1.5">
          <span>CPU 32%</span>
          <div className="flex gap-0.5 h-2.5 items-end">
            <div className="w-1 bg-[#22d3ee] h-full"></div>
            <div className="w-1 bg-[#22d3ee] h-[80%]"></div>
            <div className="w-1 bg-[#22d3ee] h-[60%]"></div>
            <div className="w-1 bg-[#22d3ee] h-[40%]"></div>
            <div className="w-1 bg-[#22d3ee]/30 h-full"></div>
            <div className="w-1 bg-[#22d3ee]/30 h-full"></div>
          </div>
        </div>

        {/* MEM */}
        <div className="flex items-center gap-1.5">
          <span>MEM 61%</span>
          <div className="flex gap-0.5 h-2.5 items-end">
            <div className="w-1 bg-[#a855f7] h-full"></div>
            <div className="w-1 bg-[#a855f7] h-full"></div>
            <div className="w-1 bg-[#a855f7] h-full"></div>
            <div className="w-1 bg-[#a855f7] h-[70%]"></div>
            <div className="w-1 bg-[#a855f7]/30 h-full"></div>
            <div className="w-1 bg-[#a855f7]/30 h-full"></div>
          </div>
        </div>

        {/* NET */}
        <div className="hidden md:flex items-center gap-1.5">
          <span>NET 48ms</span>
          <div className="flex gap-0.5 h-2.5 items-end opacity-70">
            <div className="w-1 bg-[#22d3ee] h-[30%] animate-pulse"></div>
            <div className="w-1 bg-[#22d3ee] h-[50%] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 bg-[#22d3ee] h-[80%] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 bg-[#22d3ee] h-[40%] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1 bg-[#22d3ee] h-[60%] animate-pulse" style={{ animationDelay: '0.15s' }}></div>
          </div>
        </div>
      </div>
    </footer>
  );
};
