import React from 'react';
import { X, Radio, Triangle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { AINotification } from '../../types';
import { sound } from '../../utils/audioSynth';

interface AINotificationsWindowProps {
  notifications: AINotification[];
  onViewAll: () => void;
}

export const AINotificationsWindow: React.FC<AINotificationsWindowProps> = ({
  notifications,
  onViewAll,
}) => {
  return (
    <div className="glass-panel-purple rounded-md flex flex-col select-none shadow-neon-purple/10">
      {/* Header */}
      <div className="panel-header-purple px-3.5 py-1.5 flex justify-between items-center rounded-t-md">
        <span className="text-[#a855f7] font-semibold text-xs tracking-wider font-mono-cyber">
          AI NOTIFICATIONS
        </span>
        <div className="flex gap-2 items-center">
          <span className="bg-[#a855f7] text-[#e2e8f0] text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono-cyber shadow-[0_0_8px_#a855f7]">
            {notifications.length}
          </span>
          <div className="flex gap-2 text-[#a855f7]/60 ml-1">
            <X className="w-3 h-3 cursor-pointer hover:text-[#a855f7]" onClick={() => sound.playClick()} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-3 flex flex-col gap-2.5">
        {notifications.length > 0 ? (
          notifications.slice(0, 3).map((item) => (
            <div key={item.id} className="flex gap-2.5 cyber-border-l-purple pl-2.5 py-0.5">
              <div className="w-7 h-7 rounded bg-[#a855f7]/20 border border-[#a855f7]/50 flex items-center justify-center shrink-0">
                {item.type === 'intel' ? (
                  <Radio className="w-3.5 h-3.5 text-[#a855f7]" />
                ) : item.type === 'mission' ? (
                  <Triangle className="w-3.5 h-3.5 text-[#22d3ee]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[#a855f7] font-semibold text-[11px] mb-0.5 font-mono-cyber leading-tight">
                  {item.title}
                </h4>
                <p className="text-[10px] text-[#e2e8f0]/80 leading-tight font-mono-cyber">
                  {item.description}
                </p>
                <div className="text-right text-[8px] text-[#94a3b8] mt-0.5 font-mono-cyber">{item.timestamp}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-[#94a3b8] font-mono-cyber py-2 text-center">No active notifications.</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#a855f7]/20 flex justify-between items-center text-[10px] font-mono-cyber text-[#a855f7]/80">
        <span
          onClick={() => {
            sound.playClick();
            onViewAll();
          }}
          className="cursor-pointer hover:text-[#a855f7] transition"
        >
          VIEW ALL NOTIFICATIONS
        </span>
        <ArrowRight className="w-3 h-3 cursor-pointer" onClick={onViewAll} />
      </div>
    </div>
  );
};
