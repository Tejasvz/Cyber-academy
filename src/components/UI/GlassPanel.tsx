import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  showCorners?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  showCorners = true,
}) => {
  return (
    <div className={`cyber-glass-panel relative flex flex-col overflow-hidden ${className}`}>
      {showCorners && (
        <>
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />
        </>
      )}
      {children}
    </div>
  );
};

export default GlassPanel;
