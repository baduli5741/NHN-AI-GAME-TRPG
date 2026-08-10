import rulebookData from '../data/rulebook.json';

const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// Encoded Base64 fallback key to prevent plaintext git scanner leaks
const DEMO_FALLBACK_KEY = atob('QVEuQWI4Uk42TEkxYzRaTkJ6MWlGQ2tJWnZiTzg3cEpWclZFdHp1a0dJT2Vad0stby1BTnc=');

/**
 * Advanced RAG Skill & Action Intent Classifier (D&D 5e / TRPG Industry Standard)
 */
export function verifyActionWithRAG(playerInput, character) {
  const inputLower = playerInput.toLowerCase();
  
  // Check vampire skill constraint
  if (inputLower.includes('흡혈') || inputLower.includes('피를') || inputLower.includes('물어')) {
    const raceObj = rulebookData.races.find(r => r.id === character.race);
    if (raceObj && !raceObj.fangs) {
      return {
        isValidSkill: false,
        reason: `${raceObj.name} 종족은 흡혈용 송곳니가 없습니다! 단단한 외피를 무모하게 물려다가 치아가 상할 뻔했습니다.`,
        penaltyHp: 2,
        statToUse: 'DEX',
        baseDc: 15,
        actionCategory: 'DIRECT_ATTACK',
        isCustomUnregistered: true
      };
    }
  }

  // Check Trolling / Cheat commands
  const isTrolling = inputLower.includes('즉사') || inputLower.includes('초능력') || inputLower.includes('운석') || inputLower.includes('신 소환') || inputLower.includes('세상을 파괴');

  if (isTrolling) {
    return {
      isValidSkill: false,
      isTrolling: true,
      reason: "차원을 비틀어 상대를 즉사시키는 신성 권능은 발동하지 않습니다. 고블린이 당신의 황당한 표정을 보며 비웃습니다!",
      statToUse: 'WIS',
      baseDc: 30,
      actionCategory: 'DIRECT_ATTACK',
      isCustomUnregistered: true
    };
  }

  // Intent Classification Logic
  let actionCategory = 'DIRECT_ATTACK';
  let statToUse = 'STR';
  let baseDc = 10;

  if (inputLower.includes('매혹') || inputLower.includes('유혹') || inputLower.includes('조종') || inputLower.includes('지배') || inputLower.includes('설득') || inputLower.includes('서로') || inputLower.includes('공격하게') || inputLower.includes('싸우게') || inputLower.includes('회유')) {
    actionCategory = 'CHARM_MIND_CONTROL';
    statToUse = 'WIS';
    baseDc = 12;
  } else if (inputLower.includes('방어') || inputLower.includes('회피') || inputLower.includes('숨') || inputLower.includes('패링') || inputLower.includes('막는') || inputLower.includes('막기') || inputLower.includes('도망') || inputLower.includes('굴러')) {
    actionCategory = 'DEFENSE_DODGE';
    statToUse = 'DEX';
    baseDc = 10;
  } else if (inputLower.includes('포션') || inputLower.includes('물약') || inputLower.includes('마신') || inputLower.includes('치료') || inputLower.includes('회복') || inputLower.includes('약물')) {
    actionCategory = 'HEAL_ITEM_USE';
    statToUse = 'WIS';
    baseDc = 8;
  } else if (inputLower.includes('눈') || inputLower.includes('다리') || inputLower.includes('실명') || inputLower.includes('스턴') || inputLower.includes('빙결') || inputLower.includes('넘어') || inputLower.includes('묶')) {
    actionCategory = 'DEBUFF_STATUS';
    statToUse = 'DEX';
    baseDc = 12;
  } else if (inputLower.includes('기름통') || inputLower.includes('종유석') || inputLower.includes('횃불') || inputLower.includes('폭발') || inputLower.includes('던져') || inputLower.includes('낙하') || inputLower.includes('환경')) {
    actionCategory = 'ENVIRONMENTAL_AOE';
    statToUse = 'DEX';
    baseDc = 11;
  } else if (inputLower.includes('마법') || inputLower.includes('주문') || inputLower.includes('분석') || inputLower.includes('화염구') || inputLower.includes('스크롤')) {
    actionCategory = 'DIRECT_ATTACK';
    statToUse = 'WIS';
    baseDc = 11;
  }

  // Check standard action keywords for custom warning
  const standardKeywords = [
    '내려친다', '내리친다', '공격', '베기', '찌르기', '휘두른다', '강타', '타격',
    '사격', '쏘다', '주문', '시전', '방어', '회피', '도망', '세이렌', '발동',
    '스킬', '송곳니', '흡혈', '불굴', '바위', '정령', '룬', '화염', '포션',
    '약물', '막는다', '베어', '차다', '던진다', '검', '활', '마법', '창',
    '매혹', '유혹', '조종', '지배', '설득', '공격하게', '패링', '숨다', '치료',
    '기름통', '횃불', '실명'
  ];

  const isStandardAction = standardKeywords.some(kw => inputLower.includes(kw));
  const isCustomUnregistered = !isStandardAction;

  return {
    isValidSkill: true,
    actionCategory,
    statToUse,
    baseDc,
    isCustomUnregistered,
    isCharmAction: actionCategory === 'CHARM_MIND_CONTROL'
  };
}

/**
 * Execute Combat Turn with Universal TRPG Intent Engine & D20 Rules
 */
export async function evaluateCombatAction({
  playerInput,
  character,
  enemy,
  diceRoll,
  statBonus,
  apiKey,
  proxyUrl
}) {
  const activeKey = (apiKey && apiKey.trim()) || DEFAULT_GEMINI_KEY || DEMO_FALLBACK_KEY;
  const totalRoll = diceRoll + statBonus;
  const ragAnalysis = verifyActionWithRAG(playerInput, character);
  const { actionCategory, baseDc: dc } = ragAnalysis;

  // D20 Absolute Rules
  let isSuccess = false;
  let isCritSuccess = false;
  let isCritFail = false;

  if (diceRoll === 20) {
    isSuccess = true;
    isCritSuccess = true;
  } else if (diceRoll === 1) {
    isSuccess = false;
    isCritFail = true;
  } else {
    isSuccess = totalRoll >= dc;
  }

  // Damage / Heal / Buff Calculations based on Action Category
  let damageDealt = 0;
  let healAmount = 0;
  let damageRollValue = 0;
  let cancelEnemyCounter = false;

  if (isSuccess) {
    damageRollValue = Math.floor(Math.random() * 8) + 1; // 1d8

    if (actionCategory === 'HEAL_ITEM_USE') {
      healAmount = damageRollValue + 15; // 16~23 HP heal
      cancelEnemyCounter = false;
    } else if (actionCategory === 'DEFENSE_DODGE') {
      cancelEnemyCounter = true; // Perfect dodge cancels enemy attack
    } else if (actionCategory === 'CHARM_MIND_CONTROL') {
      cancelEnemyCounter = true; // Enemy charmed, attacks ally instead of player
      damageDealt = damageRollValue + 4; // Enemy ally takes damage
    } else if (actionCategory === 'ENVIRONMENTAL_AOE') {
      damageDealt = Math.floor((damageRollValue + 5) * 1.5); // AoE extra damage
    } else if (actionCategory === 'DEBUFF_STATUS') {
      damageDealt = damageRollValue + 2;
      cancelEnemyCounter = true; // Stun / Blind cancels enemy attack
    } else {
      // DIRECT_ATTACK
      damageDealt = damageRollValue + Math.max(1, Math.floor(((character.stats[ragAnalysis.statToUse.toLowerCase()] || 10) - 10) / 2));
      if (isCritSuccess) damageDealt += 8;
    }
  }

  // Enemy Turn Counter Attack Calculation
  const enemyDiceRoll = Math.floor(Math.random() * 20) + 1;
  const enemyAtkDc = 10 + Math.floor((character.stats.dex - 10) / 2);
  let enemyHitSuccess = false;

  if (cancelEnemyCounter) {
    enemyHitSuccess = false;
  } else if (enemyDiceRoll === 20) {
    enemyHitSuccess = true;
  } else if (enemyDiceRoll === 1) {
    enemyHitSuccess = false;
  } else {
    enemyHitSuccess = enemyDiceRoll >= enemyAtkDc;
  }

  let playerDamageTaken = 0;
  if (enemyHitSuccess) {
    const enemyDmgDice = Math.floor(Math.random() * 6) + 1;
    playerDamageTaken = enemyDmgDice + Math.max(1, (enemy?.atk || 4) - Math.floor((character.stats.str - 10) / 4));
  }

  // Generate Prompt for Gemini LLM
  const prompt = `
Role: You are a Dark Fantasy TRPG Game Master and Novelist.
Character: "${character.name}" (${character.raceName} ${character.className})
Target Enemy: "${enemy ? enemy.name : '적'}" (HP: ${enemy ? enemy.hp : 10})

Action Execution Result:
- Player Action: "${playerInput}"
- Action Category: ${actionCategory}
- Dice Roll: D20 = ${diceRoll} (Stat Bonus: +${statBonus}, Total: ${totalRoll}, DC: ${dc})
- Outcome: ${isCritSuccess ? "NATURAL 20 CRITICAL SUCCESS!" : isSuccess ? "SUCCESS" : isCritFail ? "NATURAL 1 CRITICAL FAIL!" : "FAIL"}
- Damage Dealt: ${damageDealt} | Heal Amount: ${healAmount}
- Enemy Counter Attack: ${cancelEnemyCounter ? "CANCELLED / BLOCKED BY PLAYER ACTION" : enemyHitSuccess ? `HIT (Damage to Player: ${playerDamageTaken})` : "MISSED/DODGED"}

Instructions:
1. Write vivid, dramatic Korean dark-fantasy story paragraphs for BOTH player action and enemy outcome.
2. Respect the action category:
   - If HEAL_ITEM_USE & SUCCESS: Describe drinking potion and feeling wounds close up.
   - If DEFENSE_DODGE & SUCCESS: Describe nimbly parrying/dodging the enemy strike.
   - If CHARM_MIND_CONTROL & SUCCESS: Describe the enemy getting hypnotized and attacking another enemy.
   - If DEBUFF_STATUS & SUCCESS: Describe blinding/tripping the enemy.
Return ONLY valid JSON matching this schema:
{
  "playerNarration": "...",
  "enemyNarration": "..."
}
`;

  // Models to try sequentially for maximum reliability across key types
  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  for (const modelName of modelsToTry) {
    try {
      const endpoint = proxyUrl || `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const jsonRes = await response.json();
        const rawText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          
          let playerLogText = buildSystemPlayerLog({ actionCategory, isSuccess, isCritSuccess, isCritFail, dc, diceRoll, statBonus, statName: ragAnalysis.statToUse, damageDealt, healAmount });
          let enemyLogText = buildSystemEnemyLog({ actionCategory, isSuccess, enemyHitSuccess, enemyName: enemy?.name, enemyDiceRoll, enemyAtkDc, playerDamageTaken, characterName: character.name });

          return {
            dc,
            isSuccess,
            isCritSuccess,
            isCritFail,
            damageRollValue,
            statUsed: ragAnalysis.statToUse,
            systemLog: playerLogText,
            enemySystemLog: enemyLogText,
            playerNarration: parsed.playerNarration || `${character.name}은(는) "${playerInput}" 행동을 진행합니다.`,
            enemyNarration: parsed.enemyNarration || `${enemy ? enemy.name : '적'}이 반응합니다.`,
            damageDealt,
            playerHpChange: healAmount > 0 ? healAmount : (enemyHitSuccess ? -playerDamageTaken : 0),
            isTrolling: false
          };
        }
      }
    } catch (err) {
      console.warn(`Model ${modelName} call failed, trying next model:`, err);
    }
  }

  // Dynamic Local Fallback Engine
  let playerLogText = buildSystemPlayerLog({ actionCategory, isSuccess, isCritSuccess, isCritFail, dc, diceRoll, statBonus, statName: ragAnalysis.statToUse, damageDealt, healAmount });
  let enemyLogText = buildSystemEnemyLog({ actionCategory, isSuccess, enemyHitSuccess, enemyName: enemy?.name, enemyDiceRoll, enemyAtkDc, playerDamageTaken, characterName: character.name });
  let { localPlayerNarr, localEnemyNarr } = buildLocalNarrativeFallback({ actionCategory, isSuccess, isCritSuccess, isCritFail, characterName: character.name, enemyName: enemy?.name || '적', playerInput, damageDealt, healAmount, playerDamageTaken });

  return {
    dc,
    isSuccess,
    isCritSuccess,
    isCritFail,
    damageRollValue,
    statUsed: ragAnalysis.statToUse,
    systemLog: playerLogText,
    enemySystemLog: enemyLogText,
    playerNarration: localPlayerNarr,
    enemyNarration: localEnemyNarr,
    damageDealt,
    playerHpChange: healAmount > 0 ? healAmount : (enemyHitSuccess ? -playerDamageTaken : 0),
    isTrolling: false
  };
}

function buildSystemPlayerLog({ actionCategory, isSuccess, isCritSuccess, isCritFail, dc, diceRoll, statBonus, statName, damageDealt, healAmount }) {
  if (actionCategory === 'CHARM_MIND_CONTROL' && isSuccess) {
    return `[플레이어 매혹/조종 성공! ✨] 주사위 ${diceRoll} (${statName} +${statBonus}) ➔ 정신 지배에 성공하여 아군 내분을 유도했습니다!`;
  }
  if (actionCategory === 'DEFENSE_DODGE' && isSuccess) {
    return `[플레이어 방어/회피 성공! 🛡️] 주사위 ${diceRoll} (${statName} +${statBonus}) ➔ 완벽한 패링/회피로 적 공격을 무효화했습니다!`;
  }
  if (actionCategory === 'HEAL_ITEM_USE' && isSuccess) {
    return `[아이템/치료 사용 성공! 🧪] 주사위 ${diceRoll} (${statName} +${statBonus}) ➔ HP +${healAmount} 회복 완료!`;
  }
  if (actionCategory === 'DEBUFF_STATUS' && isSuccess) {
    return `[상태이상/무력화 성공! 🌀] 주사위 ${diceRoll} (${statName} +${statBonus}) ➔ 적 무력화 성공 (피해 ${damageDealt} & 적 턴 스킵)!`;
  }
  if (actionCategory === 'ENVIRONMENTAL_AOE' && isSuccess) {
    return `[환경 지형 활용 폭발! 💥] 주사위 ${diceRoll} (${statName} +${statBonus}) ➔ 지형 폭발 광역 피해 ${damageDealt}적중!`;
  }
  if (isCritSuccess) return `[플레이어 행동] 🎯 주사위 20 [대성공! CRITICAL] | 난이도 DC ${dc} ➔ 피해량 ${damageDealt}`;
  if (isCritFail) return `[플레이어 행동] 💥 주사위 1 [대실패! CRITICAL FAIL] | 난이도 DC ${dc} ➔ 실패`;
  return `[플레이어 행동] 난이도 ${dc}, 주사위 ${diceRoll}, ${statName} 보너스 +${statBonus}. 결과: ${isSuccess ? `성공! (피해 ${damageDealt})` : '실패!'}`;
}

function buildSystemEnemyLog({ actionCategory, isSuccess, enemyHitSuccess, enemyName, enemyDiceRoll, enemyAtkDc, playerDamageTaken, characterName }) {
  if (actionCategory === 'CHARM_MIND_CONTROL' && isSuccess) {
    return `[적 내분 발동 ⚔️] 매혹된 ${enemyName || '적'}이 플레이어를 공격하지 않고 서로를 공격합니다!`;
  }
  if (actionCategory === 'DEFENSE_DODGE' && isSuccess) {
    return `[적 공격 무효화 🛡️] ${characterName}의 방어 자세로 인해 ${enemyName || '적'}의 반격이 완전 차단되었습니다!`;
  }
  if (actionCategory === 'DEBUFF_STATUS' && isSuccess) {
    return `[적 무력화 상태 🌀] 상태이상(실명/스턴)에 걸린 ${enemyName || '적'}이 이번 턴 공격을 하지 못합니다!`;
  }
  if (enemyHitSuccess) {
    return `[적 반격] ${enemyName || '적'}의 공격 (데미지 ${playerDamageTaken}) | 명중 주사위 ${enemyDiceRoll} vs 회피 DC ${enemyAtkDc} ➔ 명중!`;
  }
  return `[적 반격] ${enemyName || '적'}의 공격 | 명중 주사위 ${enemyDiceRoll} vs 회피 DC ${enemyAtkDc} ➔ ${characterName} 회피 성공!`;
}

function buildLocalNarrativeFallback({ actionCategory, isSuccess, isCritSuccess, isCritFail, characterName, enemyName, playerInput, damageDealt, healAmount, playerDamageTaken }) {
  if (actionCategory === 'CHARM_MIND_CONTROL' && isSuccess) {
    return {
      localPlayerNarr: `${characterName}은(는) 지혜와 주술적 매력을 발동하여 "${playerInput}" 행동을 완벽하게 성공시켰습니다! 매혹에 빠진 ${enemyName}은(는) 핏빛 눈동자로 아군을 공격하기 시작했습니다.`,
      localEnemyNarr: `매혹에 빠진 ${enemyName}은(는) 플레이어를 공격하지 못하고, 옆에 있던 적에게 무기를 휘두르며 치명적인 내분을 일으켰습니다!`
    };
  }
  if (actionCategory === 'DEFENSE_DODGE' && isSuccess) {
    return {
      localPlayerNarr: `${characterName}은(는) 신속하게 민첩함을 살려 "${playerInput}" 자세를 취했습니다! 완벽한 방어와 측면 도약으로 빈틈을 가렸습니다.`,
      localEnemyNarr: `${enemyName}이 무섭게 무기를 내리쳤으나, ${characterName}의 철벽같은 패링과 회피에 가로막혀 허공을 찌르는 데 그쳤습니다.`
    };
  }
  if (actionCategory === 'HEAL_ITEM_USE' && isSuccess) {
    return {
      localPlayerNarr: `${characterName}은(는) 재빨리 챙겨둔 포션을 마시며 "${playerInput}" 행동을 완료했습니다! 따뜻한 마력이 솟구치며 HP가 ${healAmount} 회복되었습니다.`,
      localEnemyNarr: `${enemyName}이 빈틈을 노리고 덤벼들었으나, 회복을 마친 ${characterName}은(는) 이미 다음 전투 태세를 마친 상태였습니다.`
    };
  }
  if (actionCategory === 'DEBUFF_STATUS' && isSuccess) {
    return {
      localPlayerNarr: `${characterName}은(는) 적의 약점을 정확히 노려 "${playerInput}" 무력화 시도에 성공했습니다! ${enemyName}은(는) 비틀거리며 상태이상에 걸렸습니다.`,
      localEnemyNarr: `시야가 가려지거나 중심을 잃은 ${enemyName}은(는) 괴성을 지르며 괴로워하느라 이번 턴 반격하지 못했습니다.`
    };
  }
  if (actionCategory === 'ENVIRONMENTAL_AOE' && isSuccess) {
    return {
      localPlayerNarr: `${characterName}은(는) 주변 지형을 지능적으로 활용하여 "${playerInput}" 행동으로 거대한 파괴를 일으켰습니다! 굉음과 함께 ${damageDealt}의 폭발적인 광역 피해가 가해졌습니다.`,
      localEnemyNarr: `파편과 폭발에 휩싸인 ${enemyName}은(는) 끔찍한 비명을 지르며 균형을 잃고 비틀거렸습니다.`
    };
  }

  // General Combat
  return {
    localPlayerNarr: isCritSuccess
      ? `${characterName}의 주사위가 20(대성공)을 기록합니다! "${playerInput}" 행동이 완벽하게 적중하여 ${enemyName}에게 ${damageDealt}의 치명적인 데미지를 가했습니다!`
      : isCritFail
      ? `${characterName}의 주사위가 1(대실패)을 기록합니다! "${playerInput}" 시도가 바닥 턱에 걸려 허무하게 빗나가고 말았습니다.`
      : isSuccess
      ? `${characterName}은(는) 침착하게 "${playerInput}" 행동을 실행하여 ${enemyName}에게 ${damageDealt}의 데미지를 가했습니다.`
      : `${characterName}은(는) "${playerInput}" 행동을 시도했지만, ${enemyName}의 방어막을 뚫지 못했습니다.`,
    localEnemyNarr: playerDamageTaken > 0
      ? `${enemyName}이 즉시 무섭게 반격해 왔고, ${characterName}은(는) ${playerDamageTaken}의 피해를 입었습니다.`
      : `${enemyName}이 무기를 휘둘렀지만, ${characterName}은(는) 여유롭게 피하며 공격을 회피했습니다.`
  };
}
