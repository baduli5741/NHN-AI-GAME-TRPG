import React from 'react';
import { User, Shield, Heart, Zap, Award, Sparkles, Wand2 } from 'lucide-react';
import rulebookData from '../data/rulebook.json';

export default function CharacterSheet({ character, onQuickSkillSelect }) {
  if (!character) return null;

  const currentRaceObj = rulebookData.races.find(r => r.id === character.race);
  const innateSkillObj = currentRaceObj?.innateSkill ? rulebookData.skills[currentRaceObj.innateSkill] : null;

  return (
    <aside className="character-sheet">
      <div className="char-header-card">
        <div className="avatar-frame">
          <span>{character.race === 'human' ? '⚔️' : character.race === 'dwarf' ? '🔨' : character.race === 'elf' ? '🏹' : '🐺'}</span>
        </div>
        <div>
          <h3 className="char-name">{character.name}</h3>
          <div className="char-tag">
            {character.raceName} • {character.className}
          </div>
          <small className="char-bg-sub">{character.backgroundName} ({character.startingTraitName})</small>
        </div>
      </div>

      <div className="stat-bar-group">
        <div className="bar-header">
          <span className="bar-label">
            <Heart size={14} className="text-crimson" /> 체력 (HP)
          </span>
          <span className="bar-val">{character.hp} / {character.maxHp}</span>
        </div>
        <div className="bar-track">
          <div
            className="bar-fill hp-fill"
            style={{ width: `${Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100))}%` }}
          />
        </div>
      </div>

      <div className="resource-pill">
        <Award size={16} className="text-gold" />
        <span>소지금: <strong>{character.gold}G</strong></span>
      </div>

      <div className="resource-pill speed-pill">
        <Zap size={16} className="text-cyan" />
        <span>행동 속도: <strong>Speed {character.speed || 10}</strong></span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-name">⚔️ 근력</span>
          <strong className="stat-num">{character.stats.str}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-name">👟 민첩</span>
          <strong className="stat-num">{character.stats.dex}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-name">🧠 지능</span>
          <strong className="stat-num">{character.stats.int}</strong>
        </div>
      </div>

      {innateSkillObj && (
        <div className="skill-card">
          <div className="skill-title">
            <Wand2 size={16} className="text-purple" />
            <span>종족 고유 기술: {innateSkillObj.name}</span>
          </div>
          <p className="skill-desc">{innateSkillObj.flavor}</p>
          <button className="btn-use-skill" onClick={() => onQuickSkillSelect(innateSkillObj.name)}>
            ⚡ 커맨드 입력창에 빠른 세팅
          </button>
        </div>
      )}
    </aside>
  );
}
