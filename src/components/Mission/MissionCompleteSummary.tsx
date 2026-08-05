import React from 'react';
import { Award, CheckCircle, Zap, ArrowRight } from 'lucide-react';

interface MissionCompleteSummaryProps {
  onContinue?: () => void;
  rank?: 'S' | 'A' | 'B';
  expEarned?: number;
  creditsEarned?: number;
}

export const MissionCompleteSummary: React.FC<MissionCompleteSummaryProps> = ({
  onContinue,
  rank = 'S',
  expEarned = 1250,
  creditsEarned = 850
}) => {
  return (
    <div className="w-full h-full bg-[#0a0e14]/95 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <Award size={22} className="text-teal-400" />
          <div>
            <h2 className="text-sm font-bold text-teal-300 tracking-wider">MISSION DEBRIEF // RESULTS SUMMARY</h2>
            <p className="text-[11px] text-gray-400">OPERATION EVALUATION COMPLETE</p>
          </div>
        </div>

        <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-400 px-2 py-0.5 rounded font-bold">
          STATUS: DECOMMISSIONED
        </span>
      </div>

      {/* Main Results Display */}
      <div className="flex-1 overflow-y-auto my-3 space-y-4 pr-2 text-xs">
        {/* Rank & Grade Badge */}
        <div className="bg-black/60 border border-teal-500/30 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-black font-black text-4xl flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.6)]">
              {rank}
            </div>
            <div>
              <h3 className="text-lg font-bold text-teal-300">OPERATIONAL GRADE: {rank} RANK</h3>
              <p className="text-gray-400">Exceptional accuracy and synaptic link stability.</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-cyan-400 font-bold text-sm">ACCURACY: 98.4%</div>
            <div className="text-teal-400 text-xs">EXECUTION TIME: 03m 42s</div>
          </div>
        </div>

        {/* Rewards Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 flex items-center space-x-3">
            <Zap size={24} className="text-cyan-400" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">EXP GAINED</span>
              <p className="text-lg font-black text-cyan-300">+{expEarned} XP</p>
            </div>
          </div>

          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 flex items-center space-x-3">
            <Award size={24} className="text-teal-400" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">CREDITS ALLOCATED</span>
              <p className="text-lg font-black text-teal-300">+{creditsEarned} CR</p>
            </div>
          </div>
        </div>

        {/* Unlocked Reward */}
        <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle size={20} className="text-teal-400" />
          <div>
            <h4 className="font-bold text-cyan-300">CYBERWARE REWARD UNLOCKED</h4>
            <p className="text-gray-400">Synaptic Overclock MK-II added to your Skill Tree Module.</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end border-t border-cyan-500/20 pt-3">
        <button
          onClick={onContinue}
          className="px-6 py-2.5 bg-teal-400 text-black font-bold rounded-lg hover:bg-teal-300 transition flex items-center space-x-2 text-xs"
        >
          <span>CONTINUE TO DASHBOARD</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
