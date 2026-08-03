import React from 'react';
import { Heart, Shield, Sword, Footprints, Brain, Coins, Sparkles } from 'lucide-react';
import rulebookData from '../data/rulebook.json';

export default function CharacterSheet({ character, onQuickSkillSelect }) {
  const hpPercent = Math.max(0, Math.min(100, Math.round((character.hp / character.maxHp) * 100)));
  const raceObj = rulebookData.races.find(r => r.id === character.race);
  const innateSkillKey = raceObj?.innateSkill;
  const innateSkillObj = innateSkillKey ? rulebookData.skills[innateSkillKey] : null;

  return (
    <aside className="character-sheet">
      <div className="char-header-card">
        <div className="avatar-frame">
          <span className="avatar-emoji">
            {character.race === 'vampire' ? '🧛‍♂️' : character.race === 'mermaid' ? '🧜‍♀️' : '⚔️'}
          </span>
        </div>
        <div className="char-info">
          <h3 className="char-name">{character.name}</h3>
          <span className="char-tag">{character.raceName} • {character.className}</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="stat-bar-group">
        <div className="bar-header">
          <span className="bar-label">
            <Heart size={15} className="text-red" /> 체력 (HP)
          </span>
          <span className="bar-value">{character.hp} / {character.maxHp}</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill hp-fill" style={{ width: `${hpPercent}%` }} />
        </div>
      </div>

      {/* Gold */}
      <div className="resource-pill">
        <Coins size={16} className="text-gold" />
        <span>골드: <strong>{character.gold}G</strong></span>
      </div>

      {/* Primary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <Sword size={16} className="text-crimson" />
          <span className="stat-name">힘 (STR)</span>
          <strong className="stat-num">{character.stats.str}</strong>
        </div>
        <div className="stat-card">
          <Footprints size={16} className="text-emerald" />
          <span className="stat-name">민첩 (DEX)</span>
          <strong className="stat-num">{character.stats.dex}</strong>
        </div>
        <div className="stat-card">
          <Brain size={16} className="text-cyan" />
          <span className="stat-name">지혜 (WIS)</span>
          <strong className="stat-num">{character.stats.wis}</strong>
        </div>
      </div>

      {/* Innate Skill Card */}
      {innateSkillObj && (
        <div className="skill-card">
          <div className="skill-title">
            <Sparkles size={16} className="text-purple" />
            <span>고유 스킬: <strong>{innateSkillObj.name}</strong></span>
          </div>
          <p className="skill-desc">{innateSkillObj.flavor}</p>
          <button
            className="btn-use-skill"
            onClick={() => onQuickSkillSelect(innateSkillObj.name)}
          >
            스킬 입력에 추가
          </button>
        </div>
      )}
    </aside>
  );
}
