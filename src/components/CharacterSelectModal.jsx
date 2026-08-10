import React, { useState } from 'react';
import { BookOpen, UserCheck, Plus, Minus, AlertCircle, Sparkles, ChevronRight, ChevronLeft, Shield, Sword, Brain, Footprints } from 'lucide-react';
import rulebookData from '../data/rulebook.json';

export default function CharacterSelectModal({ isOpen, onSelectCharacter }) {
  const [step, setStep] = useState(1); // Step 1 ~ 6 Wizard
  const [charName, setCharName] = useState('야스킹 호준');
  const [selectedRace, setSelectedRace] = useState('human');
  const [selectedBg, setSelectedBg] = useState('explorer');
  const [selectedTrait, setSelectedTrait] = useState('sword_talent');
  const [selectedClass, setSelectedClass] = useState('warrior');

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

  const handleNextStep = () => {
    if (step < 6) setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
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
      <div className="wizard-modal-card">
        {/* Top Progress Bar Step Indicators */}
        <div className="wizard-progress-bar">
          <div className={`step-pill ${step >= 1 ? 'active' : ''}`}>1. 이름</div>
          <div className={`step-pill ${step >= 2 ? 'active' : ''}`}>2. 종족</div>
          <div className={`step-pill ${step >= 3 ? 'active' : ''}`}>3. 배경</div>
          <div className={`step-pill ${step >= 4 ? 'active' : ''}`}>4. 특성</div>
          <div className={`step-pill ${step >= 5 ? 'active' : ''}`}>5. 직업</div>
          <div className={`step-pill ${step >= 6 ? 'active' : ''}`}>6. 스탯</div>
        </div>

        {/* Step Content Frames */}
        <div className="wizard-step-content">
          {/* STEP 1: Hero Name & Bard Intro */}
          {step === 1 && (
            <div className="wizard-pane fade-in">
              <div className="bard-intro-box">
                <div className="bard-header">
                  <BookOpen size={24} className="text-gold" />
                  <h2>BALLAD: Tales Untold — 전설의 시작</h2>
                </div>
                <p className="bard-story-p">
                  "역사는 서기관의 양피지에 기록되지만, 전설은 음유시인의 노래로 남겨집니다."<br />
                  선술집에 모인 술꾼들이 오프렌 왕국의 침몰한 500년 던전 전설을 청해 듣습니다.<br />
                  당신이 오늘 밤 노래할 이야기의 영웅은 누구입니까?
                </p>
              </div>

              <div className="form-group step-input-group">
                <label className="form-label">이야기 속 영웅의 이름</label>
                <input
                  type="text"
                  className="form-input hero-name-input"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="영웅의 이름을 입력하세요 (예: 야스킹 호준)"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Race Selection */}
          {step === 2 && (
            <div className="wizard-pane fade-in">
              <h3 className="wizard-step-title">🧬 영웅의 종족을 선택하세요</h3>
              <div className="card-grid col-2">
                {rulebookData.races.map((race) => (
                  <div
                    key={race.id}
                    className={`select-option-card wizard-card ${selectedRace === race.id ? 'active' : ''}`}
                    onClick={() => setSelectedRace(race.id)}
                  >
                    <div className="option-title">
                      <span className="card-title-text">{race.name}</span>
                    </div>
                    <p className="option-desc">{race.description}</p>
                    <div className="card-stat-pill">기본 속도: <strong>Speed {race.speed}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Background Selection */}
          {step === 3 && (
            <div className="wizard-pane fade-in">
              <h3 className="wizard-step-title">📜 출신 배경을 선택하세요</h3>
              <div className="card-grid col-2">
                {rulebookData.backgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    className={`select-option-card wizard-card ${selectedBg === bg.id ? 'active' : ''}`}
                    onClick={() => setSelectedBg(bg.id)}
                  >
                    <div className="option-title">
                      <span className="card-title-text">{bg.name}</span>
                    </div>
                    <p className="option-desc">{bg.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Starting Trait Selection */}
          {step === 4 && (
            <div className="wizard-pane fade-in">
              <h3 className="wizard-step-title">✨ 시작 특성을 선택하세요</h3>
              <div className="card-grid col-3">
                {rulebookData.startingTraits.map((tr) => (
                  <div
                    key={tr.id}
                    className={`select-option-card wizard-card ${selectedTrait === tr.id ? 'active' : ''}`}
                    onClick={() => setSelectedTrait(tr.id)}
                  >
                    <div className="option-title">
                      <Sparkles size={18} className="text-gold" />
                      <span className="card-title-text">{tr.name}</span>
                    </div>
                    <p className="option-desc">{tr.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Class Selection */}
          {step === 5 && (
            <div className="wizard-pane fade-in">
              <h3 className="wizard-step-title">⚔️ 전무 직업을 선택하세요</h3>
              <div className="card-grid col-3">
                {rulebookData.classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`select-option-card wizard-card ${selectedClass === cls.id ? 'active' : ''}`}
                    onClick={() => setSelectedClass(cls.id)}
                  >
                    <div className="option-title">
                      <span className="card-title-text">{cls.name}</span>
                    </div>
                    <p className="option-desc">{cls.description}</p>
                    <small className="weapon-tag">시작 무기: {cls.startingWeapon}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Stat Points Allocation & Summary */}
          {step === 6 && (
            <div className="wizard-pane fade-in">
              {showConfirm && (
                <div className="warn-confirm-box">
                  <div className="warn-title">
                    <AlertCircle size={20} className="text-gold" />
                    <span>남은 능력치 포인트 경고</span>
                  </div>
                  <p>
                    배분하지 않은 포인트가 <strong>{bonusPoints} PT</strong> 남아있습니다! 이대로 모험을 시작하시겠습니까?
                  </p>
                  <div className="warn-actions">
                    <button className="btn-sub-action" onClick={() => setShowConfirm(false)}>
                      스탯 배분하기
                    </button>
                    <button className="btn-confirm-action" onClick={executeStart}>
                      이대로 시작
                    </button>
                  </div>
                </div>
              )}

              <div className="summary-preview-card">
                <h4>👤 영웅 프로필 최종 확정</h4>
                <p>
                  <strong>{charName}</strong> • {raceObj.name} • {bgObj.name} • {classObj.name} ({traitObj.name})
                </p>
              </div>

              <div className="stat-allocation-box">
                <div className="stat-alloc-header">
                  <h3>능력치 포인트 배분 (남은 포인트: <strong>{bonusPoints} PT</strong>)</h3>
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
            </div>
          )}
        </div>

        {/* Wizard Bottom Navigation Buttons */}
        <div className="wizard-nav-footer">
          {step > 1 ? (
            <button className="btn-wizard-nav prev" onClick={handlePrevStep}>
              <ChevronLeft size={18} />
              <span>이전 단계</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button className="btn-wizard-nav next" onClick={handleNextStep}>
              <span>다음 단계</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn-start-game" onClick={handleStartAttempt}>
              <UserCheck size={20} />
              <span>전설 이야기 시작하기 (오프렌 왕국 마을 입장)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
