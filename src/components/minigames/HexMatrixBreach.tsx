import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, RotateCcw, X, Zap } from 'lucide-react';
import { sound } from '../../utils/audioSynth';

import './HexMatrixBreach.css';

interface HexMatrixBreachProps {
  onSuccess: () => void;
  onClose: () => void;
  targetSequence?: string[];
  timeLimit?: number; // seconds
  hasTraceDamper?: boolean;
}

const HEX_POOL = ['1C', 'E9', '7A', 'FF', 'BD', '55'];
const MATRIX_SIZE = 5;

export const HexMatrixBreach: React.FC<HexMatrixBreachProps> = ({
  onSuccess,
  onClose,
  targetSequence = ['1C', '7A', 'BD'],
  timeLimit = 30,
  hasTraceDamper = false,
}) => {
  const initialTime = hasTraceDamper ? timeLimit + 15 : timeLimit;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [selectedCoords, setSelectedCoords] = useState<Array<{ r: number; c: number }>>([]);
  const [currentBuffer, setCurrentBuffer] = useState<string[]>([]);
  const [activeDirection, setActiveDirection] = useState<'row' | 'col'>('row');
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Initialize Matrix
  useEffect(() => {
    const newMatrix: string[][] = [];
    for (let r = 0; r < MATRIX_SIZE; r++) {
      const row: string[] = [];
      for (let c = 0; c < MATRIX_SIZE; c++) {
        row.push(HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
      }
      newMatrix.push(row);
    }
    // Ensure target sequence is naturally solvable in the matrix
    if (newMatrix[0]) {
      const targetCol = Math.floor(Math.random() * MATRIX_SIZE);
      newMatrix[0][targetCol] = targetSequence[0];
      const nextRow = (1 + Math.floor(Math.random() * (MATRIX_SIZE - 1))) % MATRIX_SIZE;
      newMatrix[nextRow][targetCol] = targetSequence[1] ?? '7A';
      const thirdCol = (targetCol + 1) % MATRIX_SIZE;
      newMatrix[nextRow][thirdCol] = targetSequence[2] ?? 'BD';
    }
    setMatrix(newMatrix);
  }, [targetSequence]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('lost');
          sound.playWarning();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleCellClick = (r: number, c: number) => {
    if (gameState !== 'playing') return;

    // Check if cell is allowed based on active row/col
    if (activeDirection === 'row' && r !== activeLineIndex) return;
    if (activeDirection === 'col' && c !== activeLineIndex) return;

    // Check if cell was already selected
    if (selectedCoords.some((item) => item.r === r && item.c === c)) return;

    sound.playHexSelect();

    const byte = matrix[r][c];
    const newBuffer = [...currentBuffer, byte];
    const newCoords = [...selectedCoords, { r, c }];

    setCurrentBuffer(newBuffer);
    setSelectedCoords(newCoords);

    // Toggle row/col rule
    if (activeDirection === 'row') {
      setActiveDirection('col');
      setActiveLineIndex(c);
    } else {
      setActiveDirection('row');
      setActiveLineIndex(r);
    }

    // Check if target sequence is satisfied
    const isMatched = checkBufferMatch(newBuffer, targetSequence);
    if (isMatched) {
      sound.playBufferMatch();
      sound.playSuccess();
      setGameState('won');
      return;
    }

    // If buffer length reaches max limit (e.g. 5) without match
    if (newBuffer.length >= 6) {
      sound.playWarning();
      setGameState('lost');
    }
  };

  const checkBufferMatch = (buf: string[], target: string[]) => {
    const bufStr = buf.join(',');
    const targetStr = target.join(',');
    return bufStr.includes(targetStr);
  };

  const resetGame = () => {
    setTimeLeft(initialTime);
    setCurrentBuffer([]);
    setSelectedCoords([]);
    setActiveDirection('row');
    setActiveLineIndex(0);
    setGameState('playing');
    sound.playClick();
  };

  return (
    <div className="hex-modal-overlay" role="dialog" aria-modal="true" aria-label="Hex Matrix Breach Protocol">
      <div className="hex-breach-frame glass-panel">
        <header className="hex-header">
          <div className="hex-brand">
            <Zap size={18} className="phosphor-cyan" />
            <div>
              <h2>BREACH PROTOCOL // BUFFER INJECTION</h2>
              <small>BYPASS CIPHER GATEWAY</small>
            </div>
          </div>
          <button className="hex-close" onClick={onClose} aria-label="Close breach"><X size={16} /></button>
        </header>

        <div className="hex-body">
          {/* Top telemetry and sequence */}
          <div className="hex-telemetry">
            <div className="hex-timer-box">
              <span>ACTIVE TRACE DETECTION:</span>
              <b className={timeLeft <= 8 ? 'danger-blink' : ''}>{timeLeft}s</b>
              {hasTraceDamper && <small className="trace-perk">+15S DAMPING PERK ACTIVE</small>}
            </div>

            <div className="hex-sequence-box">
              <span>TARGET CODE SEQUENCE:</span>
              <div className="sequence-slots">
                {targetSequence.map((byte, idx) => {
                  const matched = currentBuffer.join(',').includes(targetSequence.slice(0, idx + 1).join(','));
                  return (
                    <span key={idx} className={`seq-slot ${matched ? 'matched' : ''}`}>
                      {byte}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="hex-buffer-box">
              <span>INJECTION BUFFER ({currentBuffer.length}/6):</span>
              <div className="buffer-slots">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <span key={idx} className={`buf-slot ${currentBuffer[idx] ? 'filled' : ''}`}>
                    {currentBuffer[idx] || '–'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 5x5 Bytecode Matrix */}
          <div className="hex-matrix-wrapper">
            <div className="matrix-direction-indicator">
              ACTIVE SELECTION: <b>{activeDirection.toUpperCase()} {activeLineIndex + 1}</b>
            </div>
            <div className="hex-grid">
              {matrix.map((row, r) => (
                <div
                  key={r}
                  className={`matrix-row ${activeDirection === 'row' && activeLineIndex === r ? 'active-line' : ''}`}
                >
                  {row.map((byte, c) => {
                    const isSelected = selectedCoords.some((item) => item.r === r && item.c === c);
                    const isSelectable =
                      gameState === 'playing' &&
                      !isSelected &&
                      ((activeDirection === 'row' && activeLineIndex === r) ||
                        (activeDirection === 'col' && activeLineIndex === c));

                    return (
                      <button
                        key={`${r}-${c}`}
                        disabled={!isSelectable}
                        onClick={() => handleCellClick(r, c)}
                        className={`hex-cell ${isSelected ? 'selected' : ''} ${isSelectable ? 'selectable' : ''} ${
                          activeDirection === 'col' && activeLineIndex === c ? 'active-col-cell' : ''
                        }`}
                      >
                        {isSelected ? '••' : byte}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Overlays */}
          {gameState === 'won' && (
            <div className="hex-result-banner won">
              <Check size={28} />
              <div>
                <h3>BREACH PROTOCOL VERIFIED</h3>
                <p>Cipher buffer overridden. Substation relay unlocked (+150 XP / +30 Credits).</p>
              </div>
              <button
                className="workspace-cta"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                APPLY EXPLOIT & COMPLETE →
              </button>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="hex-result-banner lost">
              <AlertTriangle size={28} />
              <div>
                <h3>TRACE EXCEEDED // LOCKOUT</h3>
                <p>Buffer injection failed. Substation firewall hardened against attack.</p>
              </div>
              <button className="workspace-cta" onClick={resetGame}>
                <RotateCcw size={14} style={{ display: 'inline', marginRight: '6px' }} /> RETRY BREACH
              </button>
            </div>
          )}
        </div>

        <footer className="hex-footer">
          <span>RULE: ALTERNATE BETWEEN ACTIVE ROW AND COLUMN</span>
          <button className="hex-bypass-btn" onClick={() => { onSuccess(); onClose(); }}>
            TERMINAL OVERRIDE (AUTO-BYPASS) ≫
          </button>
        </footer>
      </div>
    </div>
  );
};
