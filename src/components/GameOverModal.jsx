import React from 'react';
import { Skull, RefreshCw } from 'lucide-react';

export default function GameOverModal({ isOpen, onRetry }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="game-over-card">
        <div className="game-over-header">
          <Skull size={48} className="text-crimson animate-bounce" />
          <h2 className="game-over-title">사망하셨습니다 (GAME OVER)</h2>
        </div>

        <p className="game-over-desc">
          심연의 어둠 속에서 체력이 0이 되어 의식을 잃었습니다...<br />
          그러나 죽음의 고리는 당신을 쉽게 놓아주지 않습니다.
        </p>

        <button className="btn-retry-game" onClick={onRetry}>
          <RefreshCw size={20} />
          <span>체크포인트에서 재도전 (HP 100% 회복)</span>
        </button>
      </div>
    </div>
  );
}
