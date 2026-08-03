import React from 'react';
import { Skull, Settings, Dices, Volume2, VolumeX, MapPin } from 'lucide-react';

export default function Header({
  diceAnimOn,
  setDiceAnimOn,
  soundOn,
  setSoundOn,
  onOpenMap,
  onOpenSettings,
  currentNodeName
}) {
  return (
    <header className="game-header">
      <div className="header-brand">
        <Skull className="brand-icon" size={28} />
        <div>
          <h1 className="brand-title">DARK TRPG : CHRONICLES OF ABYSS</h1>
          <div className="current-location">
            <MapPin size={14} className="pin-icon" />
            <span>현재 위치: {currentNodeName || '안개 숲'}</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-header"
          onClick={onOpenMap}
          title="노드 지도 열기"
        >
          <MapPin size={18} />
          <span className="btn-label">지도</span>
        </button>

        <button
          className={`btn-header ${diceAnimOn ? 'active' : ''}`}
          onClick={() => setDiceAnimOn(!diceAnimOn)}
          title="주사위 애니메이션 이펙트 ON/OFF"
        >
          <Dices size={18} />
          <span className="btn-label">이펙트 {diceAnimOn ? 'ON' : 'OFF'}</span>
        </button>

        <button
          className="btn-header"
          onClick={() => setSoundOn(!soundOn)}
          title="사운드 이펙트 ON/OFF"
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          className="btn-header"
          onClick={onOpenSettings}
          title="API Key / 프록시 설정"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
