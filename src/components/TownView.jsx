import React, { useState } from 'react';
import { ShoppingBag, Shield, Sparkles, Flame, Compass, Coins, Heart, Zap } from 'lucide-react';
import rulebookData from '../data/rulebook.json';

export default function TownView({
  character,
  setCharacter,
  unlockedAnchors,
  onEnterDungeonFloor
}) {
  const [activeFacility, setActiveFacility] = useState(null); // 'shop', 'blacksmith', 'jeweler', 'mageTower', 'dungeonPortal'
  const [townLog, setTownLog] = useState('오프렌 왕국의 아늑한 마을에 위치해 있습니다. 어디로 이동하시겠습니까?');

  // Handle Item Purchase in Shop
  const handleBuyItem = (itemType, cost) => {
    if (character.gold >= cost) {
      setCharacter(prev => {
        let newHp = prev.hp;
        let newGold = prev.gold - cost;
        if (itemType === 'potion') {
          newHp = Math.min(prev.maxHp, prev.hp + 20);
        }
        return { ...prev, hp: newHp, gold: newGold };
      });
      setTownLog(`[구매 성공] ${itemType === 'potion' ? '체력 물약(HP +20)' : '아이템'}을 구매하셨습니다! (-${cost}G)`);
    } else {
      setTownLog('[소지금 부족] 골드가 부족하여 아이템을 구매할 수 없습니다.');
    }
  };

  return (
    <main className="town-view">
      <div className="town-banner-frame">
        <div className="town-overlay" />
        <div className="town-badge">
          <Compass size={18} className="text-gold" />
          <span>오프렌 왕국 중앙 마을 (Opren Kingdom Hub)</span>
        </div>
      </div>

      <div className="town-log-box">
        <span>📜 마을 전갈: {townLog}</span>
      </div>

      {/* Town Facility Cards Grid */}
      <div className="town-facility-grid">
        {/* 1. 잡화점 */}
        <div className="facility-card" onClick={() => setActiveFacility('shop')}>
          <div className="facility-icon-wrap shop">
            <ShoppingBag size={28} />
          </div>
          <h4>잡화점 (General Store)</h4>
          <p>체력/마나 포션 및 탐색 소모품 판매</p>
          <button className="btn-facility-action">입장하기</button>
        </div>

        {/* 2. 대장간 */}
        <div className="facility-card" onClick={() => setActiveFacility('blacksmith')}>
          <div className="facility-icon-wrap blacksmith">
            <Shield size={28} />
          </div>
          <h4>대장간 (Blacksmith)</h4>
          <p>무기/방어구 매매 및 장비 강화</p>
          <button className="btn-facility-action">입장하기</button>
        </div>

        {/* 3. 세공점 */}
        <div className="facility-card" onClick={() => setActiveFacility('jeweler')}>
          <div className="facility-icon-wrap jeweler">
            <Sparkles size={28} />
          </div>
          <h4>세공점 (Jewelcrafting)</h4>
          <p>장신구 구매 및 마법 인챈트</p>
          <button className="btn-facility-action">입장하기</button>
        </div>

        {/* 4. 마탑 */}
        <div className="facility-card" onClick={() => setActiveFacility('mageTower')}>
          <div className="facility-icon-wrap mage-tower">
            <Flame size={28} />
          </div>
          <h4>마탑 (Mage Tower)</h4>
          <p>마법 스크롤 습득 및 마법 전수</p>
          <button className="btn-facility-action">입장하기</button>
        </div>

        {/* 5. 던전 입구 */}
        <div className="facility-card dungeon-portal" onClick={() => setActiveFacility('dungeonPortal')}>
          <div className="facility-icon-wrap portal">
            <Compass size={28} />
          </div>
          <h4>500년 던전 입구 (Dungeon Portal)</h4>
          <p>옛 수도 심크홀 탐색 & 층별 앵커 이동</p>
          <button className="btn-facility-action portal-btn">던전 진입</button>
        </div>
      </div>

      {/* Facility Modals */}
      {activeFacility === 'shop' && (
        <div className="modal-overlay">
          <div className="settings-modal-card">
            <h3>🛒 잡화점 (General Store)</h3>
            <p>보유 골드: <strong>{character.gold}G</strong></p>
            <div className="shop-item-list">
              <div className="shop-item-row">
                <span>🧪 체력 물약 (HP +20 회복)</span>
                <button onClick={() => handleBuyItem('potion', 30)}>30G 구매</button>
              </div>
            </div>
            <button className="btn-cancel" onClick={() => setActiveFacility(null)}>마을로 돌아가기</button>
          </div>
        </div>
      )}

      {activeFacility === 'blacksmith' && (
        <div className="modal-overlay">
          <div className="settings-modal-card">
            <h3>🛡️ 대장간 (Blacksmith)</h3>
            <p>보유 골드: <strong>{character.gold}G</strong></p>
            <div className="shop-item-list">
              {rulebookData.weapons.slice(0, 4).map((w, idx) => (
                <div key={idx} className="shop-item-row">
                  <span>⚔️ {w.name} ({w.type} / 데미지 {w.damage})</span>
                  <button onClick={() => handleBuyItem(w.name, 60)}>60G 구매</button>
                </div>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setActiveFacility(null)}>마을로 돌아가기</button>
          </div>
        </div>
      )}

      {activeFacility === 'dungeonPortal' && (
        <div className="modal-overlay">
          <div className="settings-modal-card">
            <h3>🌀 500년 던전 층 선택 (Dungeon Anchors)</h3>
            <p>설치된 앵커(Anchor)가 있는 층으로 즉시 텔레포트할 수 있습니다.</p>
            <div className="anchor-floors-list">
              <button className="btn-anchor-floor" onClick={() => { onEnterDungeonFloor(1); setActiveFacility(null); }}>
                📍 던전 1층 (핏빛 안개 숲)
              </button>

              {unlockedAnchors.includes(5) && (
                <button className="btn-anchor-floor unlocked" onClick={() => { onEnterDungeonFloor(5); setActiveFacility(null); }}>
                  ⚓ 앵커 5층 (고블린 족장 보스 층)
                </button>
              )}

              {unlockedAnchors.includes(10) && (
                <button className="btn-anchor-floor unlocked" onClick={() => { onEnterDungeonFloor(10); setActiveFacility(null); }}>
                  ⚓ 앵커 10층 (원혼의 묘지 층)
                </button>
              )}

              {unlockedAnchors.includes(15) && (
                <button className="btn-anchor-floor unlocked" onClick={() => { onEnterDungeonFloor(15); setActiveFacility(null); }}>
                  ⚓ 앵커 15층 (저주받은 룬 제단 층)
                </button>
              )}

              {unlockedAnchors.includes(20) && (
                <button className="btn-anchor-floor boss-anchor" onClick={() => { onEnterDungeonFloor(20); setActiveFacility(null); }}>
                  👑 앵커 20층 (최하층 흑룡 루인 보스 층)
                </button>
              )}
            </div>
            <button className="btn-cancel" onClick={() => setActiveFacility(null)}>취소</button>
          </div>
        </div>
      )}
    </main>
  );
}
