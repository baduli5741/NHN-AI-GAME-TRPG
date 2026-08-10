import React, { useState, useEffect, useRef } from 'react';
import { Skull, ShieldAlert, Sparkles, MessageSquare, MapPin, Compass } from 'lucide-react';

export default function StoryView({
  currentNode,
  enemy,
  storyHistory,
  choices,
  onChoiceSelect,
  onOpenMap,
  onExploreCurrentNode,
  isCombat,
  isLoading
}) {
  const [imgError, setImgError] = useState(false);
  const [enemyImgError, setEnemyImgError] = useState(false);
  const scrollRef = useRef(null);
  
  const baseUrl = import.meta.env.BASE_URL || '/';
  const enemyHpPercent = enemy ? Math.max(0, Math.min(100, Math.round((enemy.hp / enemy.maxHp) * 100))) : 0;
  const sceneImagePath = `${baseUrl}images/${currentNode.bg}.png`;
  const enemyImagePath = enemy?.image ? `${baseUrl}images/${enemy.image}` : null;

  // Auto-scroll to bottom when new story logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyHistory, isLoading]);

  return (
    <main className="story-view">
      {/* Prominent Hero Background Scene Frame */}
      <div className={`scene-frame large ${currentNode.bg}`}>
        {!imgError ? (
          <img
            src={sceneImagePath}
            alt={currentNode.name}
            className="scene-bg-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="scene-bg-fallback" />
        )}

        <div className="scene-overlay" />
        
        {/* Prominent Enemy Combat Art Card */}
        {isCombat && enemy && enemy.hp > 0 && (
          <div className="enemy-card large-portrait">
            <div className="enemy-portrait-frame">
              {enemyImagePath && !enemyImgError ? (
                <img
                  src={enemyImagePath}
                  alt={enemy.name}
                  className="enemy-portrait-img"
                  onError={() => setEnemyImgError(true)}
                />
              ) : (
                <Skull size={36} className="enemy-icon" />
              )}
            </div>
            <div className="enemy-info-bar">
              <h4 className="enemy-name">{enemy.name}</h4>
              <div className="bar-track enemy-hp-bar">
                <div className="bar-fill enemy-fill" style={{ width: `${enemyHpPercent}%` }} />
              </div>
              <span className="enemy-hp-text">HP {enemy.hp} / {enemy.maxHp}</span>
            </div>
          </div>
        )}

        {/* Location Badge */}
        <div className="scene-badge">
          <Sparkles size={16} />
          <span>{currentNode.name}</span>
        </div>
      </div>

      {/* Narration & System Log Stream Area */}
      <div className="narration-box" ref={scrollRef}>
        <div className="narration-header">
          <MessageSquare size={18} className="text-purple" />
          <span>AI 던전 마스터 서사 & 판정 로그 스트림</span>
        </div>

        <div className="narration-history-stream">
          {storyHistory.map((item) => {
            if (item.type === 'system_player') {
              return (
                <div key={item.id} className="system-log-banner player-log">
                  <ShieldAlert size={15} className="log-icon" />
                  <span>{item.text}</span>
                </div>
              );
            }
            if (item.type === 'system_enemy') {
              return (
                <div key={item.id} className="system-log-banner enemy-log">
                  <ShieldAlert size={15} className="log-icon text-crimson" />
                  <span>{item.text}</span>
                </div>
              );
            }
            if (item.type === 'system_event') {
              return (
                <div key={item.id} className="system-log-banner event-log">
                  <Sparkles size={15} className="log-icon text-gold" />
                  <span>{item.text}</span>
                </div>
              );
            }
            return (
              <div key={item.id} className="narration-paragraph-card">
                {item.text.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="narration-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            );
          })}

          {isLoading && (
            <div className="loading-spinner-box">
              <div className="spinner" />
              <p className="loading-text">AI 던전 마스터가 다음 서사를 연출하는 중입니다...</p>
            </div>
          )}
        </div>
      </div>

      {/* Exploration & Action Choices Group */}
      <div className="choices-group">
        {!isCombat && choices && choices.length > 0 && (
          choices.map((choice, idx) => (
            <button
              key={idx}
              className="btn-choice"
              onClick={() => onChoiceSelect(choice)}
              disabled={isLoading}
            >
              {choice.label}
            </button>
          ))
        )}

        {/* Post-combat & Node Exploration Options */}
        {(!isCombat || (enemy && enemy.hp <= 0)) && (
          <div className="post-combat-actions">
            <button
              className="btn-choice explore-btn"
              onClick={onExploreCurrentNode}
              disabled={isLoading}
            >
              <Compass size={18} />
              <span>🔍 이 구역 계속 탐험하기 (새로운 전투/이벤트 조우)</span>
            </button>

            <button
              className="btn-choice nav-node-btn"
              onClick={onOpenMap}
              disabled={isLoading}
            >
              <MapPin size={18} />
              <span>🗺️ 다른 탐색 지역으로 이동하기 (전체 지도 열기)</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
