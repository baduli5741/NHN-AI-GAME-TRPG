/**
 * Speed-based Action Gauge Turn Engine (속도 기반 행동 게이지 턴 시스템)
 */

export function createCombatant(id, name, speed, hp, maxHp, atk, isPlayer = false) {
  return {
    id,
    name,
    speed: speed || 10,
    actionGauge: 0,
    hp,
    maxHp,
    atk,
    isPlayer
  };
}

/**
 * Progress time tick until at least one combatant reaches actionGauge >= 100
 */
export function advanceGaugeUntilTurn(combatants) {
  let updated = combatants.map(c => ({ ...c }));
  let safetyLoop = 0;

  while (safetyLoop < 100) {
    const ready = updated.filter(c => c.hp > 0 && c.actionGauge >= 100);
    if (ready.length > 0) {
      break;
    }

    // Tick gauge by speed
    updated = updated.map(c => {
      if (c.hp <= 0) return c;
      return {
        ...c,
        actionGauge: c.actionGauge + c.speed
      };
    });

    safetyLoop++;
  }

  return updated;
}

/**
 * Determine who acts next based on highest ActionGauge >= 100
 */
export function getNextActor(combatants) {
  const ready = combatants.filter(c => c.hp > 0 && c.actionGauge >= 100);
  if (ready.length === 0) return null;

  // Sort by actionGauge descending
  ready.sort((a, b) => b.actionGauge - a.actionGauge);

  const highestGauge = ready[0].actionGauge;
  const topTied = ready.filter(c => c.actionGauge === highestGauge);

  if (topTied.length > 1) {
    // 50% / Random selection if exact tie
    const randIdx = Math.floor(Math.random() * topTied.length);
    return topTied[randIdx];
  }

  return ready[0];
}

/**
 * Deduct 100 from actionGauge after character acts (retaining overflow)
 */
export function consumeActionGauge(combatant) {
  return {
    ...combatant,
    actionGauge: combatant.actionGauge - 100
  };
}
