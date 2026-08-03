import React, { useState } from 'react';
import { Skull, UserCheck, Plus, Minus, AlertCircle } from 'lucide-react';
import rulebookData from '../data/rulebook.json';

export default function CharacterSelectModal({ isOpen, onSelectCharacter }) {
  const [selectedRace, setSelectedRace] = useState('vampire');
  const [selectedClass, setSelectedClass] = useState('warrior');
  const [charName, setCharName] = useState('야스킹 호준');

  const [bonusPoints, setBonusPoints] = useState(5);
  const [allocatedStats, setAllocatedStats] = useState({
    str: 0,
    dex: 0,
    wis: 0
  });

  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const raceObj = rulebookData.races.find(r => r.id === selectedRace);
  const classObj = rulebookData.classes.find(c => c.id === selectedClass);

  const baseStr = 10 + (raceObj?.statBonus.str || 0) + (classObj?.mainStat === 'str' ? 2 : 0);
  const baseDex = 10 + (raceObj?.statBonus.dex || 0) + (classObj?.mainStat === 'dex' ? 2 : 0);
  const baseWis = 10 + (raceObj?.statBonus.wis || 0) + (classObj?.mainStat === 'wis' ? 2 : 0);

  const finalStats = {
    str: baseStr + allocatedStats.str,
    dex: baseDex + allocatedStats.dex,
    wis: baseWis + allocatedStats.wis
  };

  const handleAddPoint = (statKey) => {
    if (bonusPoints > 0) {
      setAllocatedStats(prev => ({ ...prev, [statKey]: prev[statKey] + 1 }));
      setBonusPoints(prev => prev - 1);
    }
  };

  const handleSubPoint = (statKey) => {
    if (allocatedStats[statKey] > 0) {
      setAllocatedStats(prev => ({ ...prev, [statKey]: prev[statKey] - 1 }));
      setBonusPoints(prev => prev + 1);
    }
  };

  const handleStartAttempt = () => {
    if (bonusPoints > 0) {
      setShowConfirm(true);
    } else {
      executeStart();
    }
  };

  const executeStart = () => {
    const maxHp = 30 + (classObj?.hpBonus || 10);

    onSelectCharacter({
      name: charName || '야스킹 호준',
      race: selectedRace,
      raceName: raceObj.name,
      class: selectedClass,
      className: classObj.name,
      stats: finalStats,
      hp: maxHp,
      maxHp: maxHp,
      gold: 50
    });
  };

  return (
    <div className="modal-overlay">
      <div className="char-select-card">
        <div className="modal-header">
          <div className="header-left">
            <Skull size={24} className="text-crimson" />
            <h2>영웅 생성 및 스탯 배분</h2>
          </div>
        </div>

        {/* Unused Stat Points Warning Confirmation Box */}
        {showConfirm && (
          <div className="warn-confirm-box">
            <div className="warn-title">
              <AlertCircle size={20} className="text-gold" />
              <span>남은 스킬포인트 경고</span>
            </div>
            <p>
              아직 배분하지 않은 스킬포인트가 <strong>{bonusPoints} PT</strong> 남아있습니다! 이대로 모험을 시작하시겠습니까?
            </p>
            <div className="warn-actions">
              <button className="btn-sub-action" onClick={() => setShowConfirm(false)}>
                돌아가서 스탯 올리기
              </button>
              <button className="btn-confirm-action" onClick={executeStart}>
                이대로 시작하기
              </button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">영웅 이름</label>
          <input
            type="text"
            className="form-input"
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* Race Selection */}
        <div className="selection-section">
          <h3>1. 종족 선택</h3>
          <div className="card-grid">
            {rulebookData.races.map((race) => (
              <div
                key={race.id}
                className={`select-option-card ${selectedRace === race.id ? 'active' : ''}`}
                onClick={() => setSelectedRace(race.id)}
              >
                <div className="option-title">
                  <span>{race.name}</span>
                  {race.fangs && <span className="tag-fang">송곳니 보유</span>}
                </div>
                <p className="option-desc">{race.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Class Selection */}
        <div className="selection-section">
          <h3>2. 직업 선택</h3>
          <div className="card-grid">
            {rulebookData.classes.map((cls) => (
              <div
                key={cls.id}
                className={`select-option-card ${selectedClass === cls.id ? 'active' : ''}`}
                onClick={() => setSelectedClass(cls.id)}
              >
                <div className="option-title">
                  <span>{cls.name}</span>
                </div>
                <p className="option-desc">{cls.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat Point Distribution */}
        <div className="selection-section stat-allocation-box">
          <div className="stat-alloc-header">
            <h3>3. 능력치 스킬포인트 배분</h3>
            <span className="pts-left-badge">남은 스킬포인트: <strong>{bonusPoints} PT</strong></span>
          </div>

          <div className="alloc-rows">
            <div className="alloc-row">
              <span>⚔️ 힘 (STR): <strong>{finalStats.str}</strong> (기본 {baseStr} + {allocatedStats.str})</span>
              <div className="alloc-btns">
                <button type="button" onClick={() => handleSubPoint('str')} disabled={allocatedStats.str === 0}>
                  <Minus size={14} />
                </button>
                <button type="button" onClick={() => handleAddPoint('str')} disabled={bonusPoints === 0}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="alloc-row">
              <span>👟 민첩 (DEX): <strong>{finalStats.dex}</strong> (기본 {baseDex} + {allocatedStats.dex})</span>
              <div className="alloc-btns">
                <button type="button" onClick={() => handleSubPoint('dex')} disabled={allocatedStats.dex === 0}>
                  <Minus size={14} />
                </button>
                <button type="button" onClick={() => handleAddPoint('dex')} disabled={bonusPoints === 0}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="alloc-row">
              <span>🧠 지혜 (WIS): <strong>{finalStats.wis}</strong> (기본 {baseWis} + {allocatedStats.wis})</span>
              <div className="alloc-btns">
                <button type="button" onClick={() => handleSubPoint('wis')} disabled={allocatedStats.wis === 0}>
                  <Minus size={14} />
                </button>
                <button type="button" onClick={() => handleAddPoint('wis')} disabled={bonusPoints === 0}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <button className="btn-start-game" onClick={handleStartAttempt}>
          <UserCheck size={20} />
          <span>모험 시작하기</span>
        </button>
      </div>
    </div>
  );
}
