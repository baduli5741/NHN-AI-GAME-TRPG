import React, { useState, useEffect } from 'react';
import { Dices, AlertTriangle, ShieldAlert, Sword, X } from 'lucide-react';
import { verifyActionWithRAG } from '../services/geminiApi';

export default function CombatConsole({
  onExecuteAction,
  disabled,
  character,
  characterSkillName
}) {
  const [inputText, setInputText] = useState('');
  const [pendingText, setPendingText] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // ESC Key Listener for warning modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showWarningModal) {
        setShowWarningModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWarningModal]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || disabled) return;

    const trimmed = inputText.trim();
    // Check if this action is an unregistered custom skill
    const verification = verifyActionWithRAG(trimmed, character || { race: 'human' });

    if (verification.isCustomUnregistered) {
      setPendingText(trimmed);
      setShowWarningModal(true);
    } else {
      executeAction(trimmed);
    }
  };

  const executeAction = (textToExecute) => {
    onExecuteAction(textToExecute);
    setInputText('');
    setPendingText(null);
    setShowWarningModal(false);
  };

  const handlePresetSelect = (presetText) => {
    setInputText(presetText);
  };

  return (
    <footer className="combat-console">
      {/* Unregistered Skill AI Failure Warning Modal */}
      {showWarningModal && (
        <div className="modal-overlay">
          <div className="settings-modal-card warn-modal-card">
            <div className="modal-header">
              <div className="header-left">
                <AlertTriangle size={24} className="text-gold" />
                <h3>미등록 커스텀 행동 경고</h3>
              </div>
              <button className="btn-close-icon" onClick={() => setShowWarningModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="info-box warn">
              <ShieldAlert size={20} className="text-gold" />
              <p>
                입력하신 <strong>"{pendingText}"</strong> 행동은 표준 룰북 스킬/행동 키워드 목록에 미등록된 변칙 커스텀 행동입니다!
              </p>
            </div>

            <p className="warn-text-desc">
              AI 던전 마스터가 판정을 왜곡하거나 고장 반응을 일으킬 가능성이 있습니다. 그래도 위험을 감수하고 실행하시겠습니까? (ESC로 취소)
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowWarningModal(false)}
              >
                취소 및 수정 (ESC)
              </button>
              <button
                type="button"
                className="btn-confirm-action"
                onClick={() => executeAction(pendingText)}
              >
                ⚠️ 위험 감수하고 실행
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Preset Tags */}
      <div className="preset-tags">
        <span className="preset-label">빠른 행동 템플릿:</span>
        <button
          type="button"
          className="tag-btn"
          onClick={() => handlePresetSelect('검으로 묵직하게 내려친다')}
          disabled={disabled}
        >
          ⚔️ 검 내리치기
        </button>
        <button
          type="button"
          className="tag-btn"
          onClick={() => handlePresetSelect('눈에 흙을 뿌리고 측면으로 회피한다')}
          disabled={disabled}
        >
          👟 흙뿌리고 회피
        </button>

        {characterSkillName && (
          <button
            type="button"
            className="tag-btn highlight"
            onClick={() => handlePresetSelect(`${characterSkillName} 기술을 발동한다!`)}
            disabled={disabled}
          >
            ✨ {characterSkillName}
          </button>
        )}

        <button
          type="button"
          className="tag-btn troll"
          onClick={() => handlePresetSelect('내가 초능력을 써서 즉사시켰다')}
          disabled={disabled}
        >
          🤪 [테스트] 억지 즉사 입력
        </button>
      </div>

      {/* Free Text Input Form */}
      <form className="console-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <Sword size={18} className="input-icon" />
          <input
            type="text"
            className="action-input"
            placeholder="전투 행동을 입력하세요 (예: 몬스터의 다리를 걸어 넘어뜨린다)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={disabled}
          />
        </div>

        <button
          type="submit"
          className="btn-execute"
          disabled={!inputText.trim() || disabled}
        >
          <Dices size={20} />
          <span>행동 실행 & 주사위 롤</span>
        </button>
      </form>
    </footer>
  );
}
