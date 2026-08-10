import React, { useState } from 'react';
import { BookOpen, UserCheck, Plus, Minus, AlertCircle, Sparkles } from 'lucide-react';
import rulebookData from '../data/rulebook.json';

export default function CharacterSelectModal({ isOpen, onSelectCharacter }) {
  const [selectedRace, setSelectedRace] = useState('human');
  const [selectedBg, setSelectedBg] = useState('explorer');
  const [selectedTrait, setSelectedTrait] = useState('sword_talent');
  const [selectedClass, setSelectedClass] = useState('warrior');
  const [charName, setCharName] = useState('야스킹 호준');

  const [bonusPoints, setBonusPoints] = useState(5);
  const [allocatedStats, setAllocatedStats] = useState({
    str: 0,
    dex: 0,
    int: 0
  });

  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const raceObj = rulebookData.races.find(r => r.id === selectedRace);
  const bgObj = rulebookData.backgrounds.find(b => b.id === selectedBg);
  const traitObj = rulebookData.startingTraits.find(t => t.id === selectedTrait);
  const classObj = rulebookData.classes.find(c => c.id === selectedClass);

  const baseStr = 10 + (raceObj?.statBonus.str || 0) + (bgObj?.bonusStat === 'str' ? 1 : 0) + (classObj?.mainStat === 'str' ? 2 : 0);
  const baseDex = 10 + (raceObj?.statBonus.dex || 0) + (bgObj?.bonusStat === 'dex' ? 1 : 0) + (classObj?.mainStat === 'dex' ? 2 : 0);
  const baseInt = 10 + (raceObj?.statBonus.int || 0) + (bgObj?.bonusStat === 'int' ? 1 : 0) + (classObj?.mainStat === 'int' ? 2 : 0);

  const finalStats = {
    str: baseStr + allocatedStats.str,
    dex: baseDex + allocatedStats.dex,
    int: baseInt + allocatedStats.int
  };

  const speed = (raceObj?.speed || 10) + (selectedBg === 'thief' ? 2 : 0);

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
      background: selectedBg,
      backgroundName: bgObj.name,
      startingTrait: selectedTrait,
      startingTraitName: traitObj.name,
      class: selectedClass,
      className: classObj.name,
      stats: finalStats,
      speed: speed,
      hp: maxHp,
      maxHp: maxHp,
      gold: 50 + (bgObj?.bonusGold || 0)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="char-select-card large-select-card">
        {/* Intro Bard Story Header */}
        <div className="bard-intro-box">
          <div className="bard-header">
            <BookOpen size={22} className="text-gold" />
            <span>BALLAD: Tales Untold — 음유시인의 서사시</span>
          </div>
          <p className="bard-story-p">
            "역사는 서기관의 양피지에 기록되지만, 전설은 음유시인의 노래로 남겨집니다."<br />
            시끌벅적한 선술집의 술꾼들이 100년 전 오프렌 왕국의 수도를 삼킨 거대한 던전의 영웅 이야기를 청해 듣습니다. 
            당신이 전해줄 이야기의 주인공은 누구입니까?
          </p>
        </div>

        {/* Unused Stat Points Warning Box */}
        {showConfirm && (
          <div className="warn-confirm-box">
            <div className="warn-title">
              <AlertCircle size={20} className="text-gold" />
              <span>남은 능력치 포인트 경고</span>
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
          <label className="form-label">이야기 속 영웅의 이름</label>
          <input
            type="text"
            className="form-input"
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* 1. Race Selection */}
        <div className="selection-section">
          <h3>1. 종족 선택</h3>
          <div className="card-grid col-4">
            {rulebookData.races.map((race) => (
              <div
                key={race.id}
                className={`select-option-card ${selectedRace === race.id ? 'active' : ''}`}
                onClick={() => setSelectedRace(race.id)}
              >
                <div className="option-title">
                  <span>{race.name}</span>
                </div>
                <p className="option-desc">{race.description}</p>
                <small className="speed-tag">기본 속도: Speed {race.speed}</small>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Background Selection */}
        <div className="selection-section">
          <h3>2. 주인공의 출신 배경 선택</h3>
          <div className="card-grid col-5">
            {rulebookData.backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`select-option-card ${selectedBg === bg.id ? 'active' : ''}`}
                onClick={() => setSelectedBg(bg.id)}
              >
                <div className="option-title">
                  <span>{bg.name}</span>
                </div>
                <p className="option-desc">{bg.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Starting Trait Selection */}
        <div className="selection-section">
          <h3>3. 시작 특성 선택</h3>
          <div className="card-grid col-3">
            {rulebookData.startingTraits.map((tr) => (
              <div
                key={tr.id}
                className={`select-option-card ${selectedTrait === tr.id ? 'active' : ''}`}
                onClick={() => setSelectedTrait(tr.id)}
              >
                <div className="option-title">
                  <Sparkles size={14} className="text-gold" />
                  <span>{tr.name}</span>
                </div>
                <p className="option-desc">{tr.effect}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Class Selection */}
        <div className="selection-section">
          <h3>4. 직업 선택</h3>
          <div className="card-grid col-3">
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

        {/* 5. Stat Allocation */}
        <div className="selection-section stat-allocation-box">
          <div className="stat-alloc-header">
            <h3>5. 능력치 포인트 배분 (근력/민첩/지능)</h3>
            <span className="pts-left-badge">남은 포인트: <strong>{bonusPoints} PT</strong></span>
          </div>

          <div className="alloc-rows">
            <div className="alloc-row">
              <span>⚔️ 근력 (STR): <strong>{finalStats.str}</strong> (기본 {baseStr} + {allocatedStats.str})</span>
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
              <span>🧠 지능 (INT): <strong>{finalStats.int}</strong> (기본 {baseInt} + {allocatedStats.int})</span>
              <div className="alloc-btns">
                <button type="button" onClick={() => handleSubPoint('int')} disabled={allocatedStats.int === 0}>
                  <Minus size={14} />
                </button>
                <button type="button" onClick={() => handleAddPoint('int')} disabled={bonusPoints === 0}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <button className="btn-start-game" onClick={handleStartAttempt}>
          <UserCheck size={20} />
          <span>전설 이야기 시작하기 (오프렌 왕국 마을 입장)</span>
        </button>
      </div>
    </div>
  );
}
