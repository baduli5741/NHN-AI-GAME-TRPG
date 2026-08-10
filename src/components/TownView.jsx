import React, { useState, useEffect } from 'react';
import { ShoppingBag, Shield, Sparkles, Flame, Compass, Coins, Heart, Zap, X, ChevronRight, Anchor } from 'lucide-react';
import rulebookData from '../data/rulebook.json';
import { soundFx } from '../services/soundFx';

export default function TownView({
  character,
  setCharacter,
  unlockedAnchors,
  onEnterDungeonFloor
}) {
  const [activeFacility, setActiveFacility] = useState(null); // 'shop', 'blacksmith', 'jeweler', 'mageTower', 'dungeonPortal'
  const [townLog, setTownLog] = useState('오프렌 왕국의 아늑한 마을에 위치해 있습니다. 무엇을 준비하시겠습니까?');

  // Listen for ESC key to close open facility modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeFacility) {
        setActiveFacility(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFacility]);

  // Handle Item Purchase in Shop with Coin Sound FX
  const handleBuyItem = (itemName, cost, hpHeal = 0) => {
    if (character.gold >= cost) {
      soundFx.playCoinSound(); // 🪙 짤랑 코인 소리 발동!
      setCharacter(prev => {
        let newHp = prev.hp;
        let newGold = prev.gold - cost;
        if (hpHeal > 0) {
          newHp = Math.min(prev.maxHp, prev.hp + hpHeal);
        }
        return { ...prev, hp: newHp, gold: newGold };
      });
      setTownLog(`[구매 성공 🪙] ${itemName}을(를) 구매하셨습니다! (-${cost}G | 남은 골드: ${character.gold - cost}G)`);
    } else {
      setTownLog('[소지금 부족 ⚠️] 골드가 부족하여 아이템을 구매할 수 없습니다!');
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
          <p>체력/마나 포션 및 던전 생존 소모품 판매</p>
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
          <p>마법 스크롤 습득 및 고급 원소 마법 전수</p>
          <button className="btn-facility-action">입장하기</button>
        </div>

        {/* 5. 던전 입구 */}
        <div className="facility-card dungeon-portal" onClick={() => setActiveFacility('dungeonPortal')}>
          <div className="facility-icon-wrap portal">
            <Compass size={28} />
          </div>
          <h4>500년 던전 입구 (Dungeon Portal)</h4>
          <p>옛 수도 싱크홀 탐색도 100% 도전 & 층별 앵커 텔레포트</p>
          <button className="btn-facility-action portal-btn">던전 진입</button>
        </div>
      </div>

      {/* Facility Modals */}
      {/* 1. 잡화점 모달 */}
      {activeFacility === 'shop' && (
        <div className="modal-overlay">
          <div className="facility-modal-card">
            <div className="facility-modal-header">
              <div className="modal-title-group">
                <ShoppingBag size={22} className="text-gold" />
                <h3>🛒 잡화점 (General Store)</h3>
              </div>
              <button className="btn-close-icon" onClick={() => setActiveFacility(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="gold-status-pill">
              <Coins size={16} className="text-gold" />
              <span>보유 골드: <strong>{character.gold}G</strong></span>
            </div>

            <div className="shop-item-list">
              <div className="shop-item-row">
                <div className="item-info">
                  <span className="item-name">🧪 소형 체력 물약</span>
                  <span className="item-desc">체력 +20 즉시 회복</span>
                </div>
                <button className="btn-buy-item" onClick={() => handleBuyItem('소형 체력 물약', 30, 20)}>
                  30G 구매
                </button>
              </div>

              <div className="shop-item-row">
                <div className="item-info">
                  <span className="item-name">🧪 대형 영약 포션</span>
                  <span className="item-desc">체력 +50 회복 & 상태이상 해제</span>
                </div>
                <button className="btn-buy-item" onClick={() => handleBuyItem('대형 영약 포션', 70, 50)}>
                  70G 구매
                </button>
              </div>
            </div>

            <button className="btn-modal-close" onClick={() => setActiveFacility(null)}>
              마을로 돌아가기 (ESC)
            </button>
          </div>
        </div>
      )}

      {/* 2. 대장간 모달 */}
      {activeFacility === 'blacksmith' && (
        <div className="modal-overlay">
          <div className="facility-modal-card">
            <div className="facility-modal-header">
              <div className="modal-title-group">
                <Shield size={22} className="text-gold" />
                <h3>🛡️ 대장간 (Blacksmith)</h3>
              </div>
              <button className="btn-close-icon" onClick={() => setActiveFacility(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="gold-status-pill">
              <Coins size={16} className="text-gold" />
              <span>보유 골드: <strong>{character.gold}G</strong></span>
            </div>

            <div className="shop-item-list">
              {rulebookData.weapons.slice(0, 5).map((w, idx) => (
                <div key={idx} className="shop-item-row">
                  <div className="item-info">
                    <span className="item-name">⚔️ {w.name} ({w.type} / {w.hands})</span>
                    <span className="item-desc">피해량 {w.damage} | {w.dmgType} | 명중 {w.hit > 0 ? `+${w.hit}` : w.hit}</span>
                  </div>
                  <button className="btn-buy-item" onClick={() => handleBuyItem(w.name, 60)}>
                    60G 구매
                  </button>
                </div>
              ))}
            </div>

            <button className="btn-modal-close" onClick={() => setActiveFacility(null)}>
              마을로 돌아가기 (ESC)
            </button>
          </div>
        </div>
      )}

      {/* 3. 세공점 모달 */}
      {activeFacility === 'jeweler' && (
        <div className="modal-overlay">
          <div className="facility-modal-card">
            <div className="facility-modal-header">
              <div className="modal-title-group">
                <Sparkles size={22} className="text-gold" />
                <h3>✨ 세공점 (Jewelcrafting)</h3>
              </div>
              <button className="btn-close-icon" onClick={() => setActiveFacility(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="gold-status-pill">
              <Coins size={16} className="text-gold" />
              <span>보유 골드: <strong>{character.gold}G</strong></span>
            </div>

            <div className="shop-item-list">
              <div className="shop-item-row">
                <div className="item-info">
                  <span className="item-name">💍 루비 은반지</span>
                  <span className="item-desc">근력(STR) +1 보너스</span>
                </div>
                <button className="btn-buy-item" onClick={() => handleBuyItem('루비 은반지', 80)}>
                  80G 구매
                </button>
              </div>

              <div className="shop-item-row">
                <div className="item-info">
                  <span className="item-name">📿 사파이어 목걸이</span>
                  <span className="item-desc">마법 명중률 +2 보너스</span>
                </div>
                <button className="btn-buy-item" onClick={() => handleBuyItem('사파이어 목걸이', 90)}>
                  90G 구매
                </button>
              </div>
            </div>

            <button className="btn-modal-close" onClick={() => setActiveFacility(null)}>
              마을로 돌아가기 (ESC)
            </button>
          </div>
        </div>
      )}

      {/* 4. 마탑 모달 */}
      {activeFacility === 'mageTower' && (
        <div className="modal-overlay">
          <div className="facility-modal-card">
            <div className="facility-modal-header">
              <div className="modal-title-group">
                <Flame size={22} className="text-gold" />
                <h3>🔥 마탑 (Mage Tower)</h3>
              </div>
              <button className="btn-close-icon" onClick={() => setActiveFacility(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="gold-status-pill">
              <Coins size={16} className="text-gold" />
              <span>보유 골드: <strong>{character.gold}G</strong></span>
            </div>

            <div className="shop-item-list">
              <div className="shop-item-row">
                <div className="item-info">
                  <span className="item-name">📜 화염구 (Fireball) 스크롤</span>
                  <span className="item-desc">화염 데미지 1d10 & 화상 효과</span>
                </div>
                <button className="btn-buy-item" onClick={() => handleBuyItem('화염구 스크롤', 100)}>
                  100G 구매
                </button>
              </div>
            </div>

            <button className="btn-modal-close" onClick={() => setActiveFacility(null)}>
              마을로 돌아가기 (ESC)
            </button>
          </div>
        </div>
      )}

      {/* 5. 던전 입구 모달 */}
      {activeFacility === 'dungeonPortal' && (
        <div className="modal-overlay">
          <div className="facility-modal-card">
            <div className="facility-modal-header">
              <div className="modal-title-group">
                <Compass size={22} className="text-gold" />
                <h3>🌀 500년 던전 층 선택 (Dungeon Anchors)</h3>
              </div>
              <button className="btn-close-icon" onClick={() => setActiveFacility(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub-p">보스를 처치하여 해금한 층별 앵커(Anchor) 위치로 즉시 텔레포트할 수 있습니다.</p>

            <div className="anchor-floors-list">
              <button className="btn-anchor-floor" onClick={() => { onEnterDungeonFloor(1); setActiveFacility(null); }}>
                <div className="anchor-btn-info">
                  <Compass size={18} className="text-gold" />
                  <span>📍 던전 1층 (핏빛 안개 숲)</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {unlockedAnchors.includes(5) && (
                <button className="btn-anchor-floor unlocked" onClick={() => { onEnterDungeonFloor(5); setActiveFacility(null); }}>
                  <div className="anchor-btn-info">
                    <Anchor size={18} />
                    <span>⚓ 앵커 5층 (고블린 족장 보스 층)</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              )}

              {unlockedAnchors.includes(10) && (
                <button className="btn-anchor-floor unlocked" onClick={() => { onEnterDungeonFloor(10); setActiveFacility(null); }}>
                  <div className="anchor-btn-info">
                    <Anchor size={18} />
                    <span>⚓ 앵커 10층 (원혼의 묘지 층)</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              )}

              {unlockedAnchors.includes(15) && (
                <button className="btn-anchor-floor unlocked" onClick={() => { onEnterDungeonFloor(15); setActiveFacility(null); }}>
                  <div className="anchor-btn-info">
                    <Anchor size={18} />
                    <span>⚓ 앵커 15층 (저주받은 룬 제단 층)</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              )}

              {unlockedAnchors.includes(20) && (
                <button className="btn-anchor-floor boss-anchor" onClick={() => { onEnterDungeonFloor(20); setActiveFacility(null); }}>
                  <div className="anchor-btn-info">
                    <Anchor size={18} />
                    <span>👑 앵커 20층 (최하층 흑룡 루인 보스 층)</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            <button className="btn-modal-close" onClick={() => setActiveFacility(null)}>
              취소 (ESC)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
