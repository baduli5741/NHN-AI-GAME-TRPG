import rulebookData from '../data/rulebook.json';

const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * RAG Skill & Action Verification
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
        isCustomUnregistered: true,
        isCharmAction: false
      };
    }
  }

  let statToUse = 'STR';
  let baseDc = 10;
  const isCharmAction = inputLower.includes('매혹') || inputLower.includes('유혹') || inputLower.includes('조종') || inputLower.includes('지배') || inputLower.includes('설득') || inputLower.includes('서로') || inputLower.includes('공격하게') || inputLower.includes('싸우게');

  if (isCharmAction) {
    statToUse = 'WIS';
    baseDc = 12;
  } else if (inputLower.includes('도망') || inputLower.includes('회피') || inputLower.includes('숨') || inputLower.includes('기습') || inputLower.includes('다리')) {
    statToUse = 'DEX';
    baseDc = 12;
  } else if (inputLower.includes('마법') || inputLower.includes('주문') || inputLower.includes('분석') || inputLower.includes('속임수') || inputLower.includes('흡수')) {
    statToUse = 'WIS';
    baseDc = 12;
  }

  // Check if this action is a standard combat verb/skill or preset
  const standardActionKeywords = [
    '내려친다', '내리친다', '공격', '베기', '찌르기', '휘두른다', '강타', '타격',
    '사격', '쏘다', '주문', '시전', '방어', '회피', '도망', '세이렌', '발동',
    '스킬', '송곳니', '흡혈', '불굴', '바위', '정령', '룬', '화염', '포션',
    '약물', '막는다', '베어', '차다', '던진다', '검', '활', '마법', '창',
    '매혹', '유혹', '조종', '지배', '설득', '공격하게'
  ];

  const isStandardAction = standardActionKeywords.some(kw => inputLower.includes(kw));
  const isCustomUnregistered = !isStandardAction;

  const isTrolling = inputLower.includes('즉사') || inputLower.includes('초능력') || inputLower.includes('운석') || inputLower.includes('신 소환') || inputLower.includes('세상을 파괴');

  if (isTrolling) {
    return {
      isValidSkill: false,
      isTrolling: true,
      reason: "차원을 비틀어 상대를 즉사시키는 신성 권능은 발동하지 않습니다. 고블린이 당신의 황당한 표정을 보며 비웃습니다!",
      statToUse: 'WIS',
      baseDc: 30,
      isCustomUnregistered: true,
      isCharmAction: false
    };
  }

  return {
    isValidSkill: true,
    statToUse,
    baseDc,
    isCustomUnregistered,
    isCharmAction
  };
}

/**
 * Execute Combat Turn with D20 Absolute Rules & Smart Charm / Mind Control Action Logic
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
  const activeKey = apiKey || DEFAULT_GEMINI_KEY;
  const totalRoll = diceRoll + statBonus;
  const ragAnalysis = verifyActionWithRAG(playerInput, character);
  const isCharmAction = ragAnalysis.isCharmAction;

  let isSuccess = false;
  let isCritSuccess = false;
  let isCritFail = false;

  const dc = ragAnalysis.baseDc;

  if (diceRoll === 20) {
    isSuccess = true;
    isCritSuccess = true;
  } else if (diceRoll === 1) {
    isSuccess = false;
    isCritFail = true;
  } else {
    isSuccess = totalRoll >= dc;
  }

  // Damage Dice Roll Calculation (e.g. D8 roll 1~8 + stat bonus)
  let damageDealt = 0;
  let damageRollValue = 0;

  if (isSuccess) {
    damageRollValue = Math.floor(Math.random() * 8) + 1; // 1d8
    damageDealt = damageRollValue + Math.max(1, Math.floor(((character.stats[ragAnalysis.statToUse.toLowerCase()] || 10) - 10) / 2));
    if (isCritSuccess) {
      damageDealt += 8; // Double critical bonus
    }
  }

  // Enemy Turn Counter Attack Calculation
  const enemyDiceRoll = Math.floor(Math.random() * 20) + 1;
  const enemyAtkDc = 10 + Math.floor((character.stats.dex - 10) / 2);
  let enemyHitSuccess = false;

  if (isCharmAction && isSuccess) {
    // Charm action succeeds! Enemy is charmed and attacks another enemy, NOT the player!
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
    const enemyDmgDice = Math.floor(Math.random() * 6) + 1; // 1d6
    playerDamageTaken = enemyDmgDice + Math.max(1, (enemy?.atk || 4) - Math.floor((character.stats.str - 10) / 4));
  }

  // Generate Prompt for Gemini LLM
  const prompt = `
Role: You are a Dark Fantasy TRPG Game Master and Novelist.
Character: "${character.name}" (${character.raceName} ${character.className})
Target Enemy: "${enemy ? enemy.name : '적'}" (HP: ${enemy ? enemy.hp : 10})

Action Execution Result:
- Player Action: "${playerInput}" (Stat Used: ${ragAnalysis.statToUse})
- Action Category: ${isCharmAction ? "CHARM / MIND CONTROL / INACTION" : "COMBAT ATTACK"}
- Dice Roll: D20 = ${diceRoll} (Stat Bonus: +${statBonus}, Total: ${totalRoll}, DC: ${dc})
- Roll Outcome: ${isCritSuccess ? "NATURAL 20 CRITICAL SUCCESS!" : isSuccess ? "SUCCESS" : isCritFail ? "NATURAL 1 CRITICAL FAIL!" : "FAIL"}
- Damage Dealt: ${damageDealt}
- Enemy Counter Attack: ${isCharmAction && isSuccess ? "CANCELLED (Enemy is charmed/mind controlled and attacks another enemy instead of player!)" : enemyHitSuccess ? `HIT (Damage to Player: ${playerDamageTaken})` : "MISSED/DODGED"}

Instructions:
1. Write vivid, dramatic, custom Korean dark-fantasy story paragraphs for BOTH player's action and enemy's counter-attack.
2. If Player Action involves Charming/Mind-controlling Enemy A to attack Enemy B ("${playerInput}") and outcome is SUCCESS:
   - Describe Enemy A getting hypnotized/charmed and turning its weapon on another enemy instead of the player!
   - Do NOT describe Enemy A counterattacking the player when the charm action succeeds!
Return ONLY valid JSON matching this schema:
{
  "playerNarration": "...",
  "enemyNarration": "..."
}
`;

  try {
    const modelName = 'gemini-2.0-flash';
    const endpoint = proxyUrl || `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`;
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok && !proxyUrl) {
      const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;
      response = await fetch(fallbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
    }

    if (response.ok) {
      const jsonRes = await response.json();
      const rawText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        
        let playerLogText = isCharmAction && isSuccess
          ? `[플레이어 매혹/조종 성공! ✨] 주사위 ${diceRoll} (WIS 보너스 +${statBonus}) ➔ ${enemy ? enemy.name : '적'}을(를) 정신 지배/매혹하였습니다!`
          : isCritSuccess
          ? `[플레이어 행동] 🎯 주사위 20 [대성공! CRITICAL] | 난이도 DC ${dc} ➔ 피해량 ${damageDealt}`
          : isCritFail
          ? `[플레이어 행동] 💥 주사위 1 [대실패! CRITICAL FAIL] | 난이도 DC ${dc} ➔ 실패`
          : `[플레이어 행동] 난이도 ${dc}, 주사위 ${diceRoll}, ${ragAnalysis.statToUse} 보너스 +${statBonus}. 결과: ${isSuccess ? `성공! (데미지 ${damageDealt})` : '실패!'}`;

        let enemyLogText = isCharmAction && isSuccess
          ? `[적 내분 발동 ⚔️] 매혹된 ${enemy ? enemy.name : '적'}이 플레이어를 공격하지 않고 아군을 공격합니다!`
          : enemyHitSuccess
          ? `[적 반격] ${enemy ? enemy.name : '적'}의 공격 (데미지 ${playerDamageTaken}) | 명중 주사위 ${enemyDiceRoll} vs 회피 DC ${enemyAtkDc} ➔ 명중!`
          : `[적 반격] ${enemy ? enemy.name : '적'}의 공격 | 명중 주사위 ${enemyDiceRoll} vs 회피 DC ${enemyAtkDc} ➔ ${character.name} 회피 성공!`;

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
          enemyNarration: parsed.enemyNarration || `${enemy ? enemy.name : '적'}이 반격을 시도합니다.`,
          damageDealt,
          playerHpChange: enemyHitSuccess ? -playerDamageTaken : 0,
          isTrolling: false
        };
      }
    }
  } catch (err) {
    console.warn("Gemini API call failed, using dynamic local narrator:", err);
  }

  // Dynamic Fallback
  let playerLogText = isCharmAction && isSuccess
    ? `[플레이어 매혹/조종 성공! ✨] 주사위 ${diceRoll} (WIS 보너스 +${statBonus}) ➔ ${enemy ? enemy.name : '적'}을(를) 정신 지배/매혹하였습니다!`
    : isCritSuccess
    ? `[플레이어 행동] 🎯 주사위 20 [대성공! CRITICAL] | 난이도 DC ${dc} ➔ 피해량 ${damageDealt}`
    : isCritFail
    ? `[플레이어 행동] 💥 주사위 1 [대실패! CRITICAL FAIL] | 난이도 DC ${dc} ➔ 실패`
    : `[플레이어 행동] 난이도 ${dc}, 주사위 ${diceRoll}, ${ragAnalysis.statToUse} 보너스 +${statBonus}. 결과: ${isSuccess ? `성공! (데미지 ${damageDealt})` : '실패!'}`;

  let enemyLogText = isCharmAction && isSuccess
    ? `[적 내분 발동 ⚔️] 매혹된 ${enemy ? enemy.name : '적'}이 플레이어를 공격하지 않고 아군을 공격합니다!`
    : enemyHitSuccess
    ? `[적 반격] ${enemy ? enemy.name : '적'}의 공격 (데미지 ${playerDamageTaken}) | 명중 주사위 ${enemyDiceRoll} vs 회피 DC ${enemyAtkDc} ➔ 명중!`
    : `[적 반격] ${enemy ? enemy.name : '적'}의 공격 | 명중 주사위 ${enemyDiceRoll} vs 회피 DC ${enemyAtkDc} ➔ ${character.name} 회피 성공!`;

  let localPlayerNarr = isCharmAction && isSuccess
    ? `${character.name}은(는) 지혜와 주술적 매력을 발동하여 "${playerInput}" 행동을 완벽하게 성공시켰습니다! 매혹에 빠진 ${enemy ? enemy.name : '적'}은 이성을 잃고 핏빛 눈동자로 아군을 공격하기 시작했습니다.`
    : isCritSuccess
    ? `${character.name}의 주사위가 20(대성공)을 기록합니다! "${playerInput}" 행동이 완벽하게 적중하여 ${enemy ? enemy.name : '적'}에게 ${damageDealt}의 치명적인 데미지를 가했습니다!`
    : isCritFail
    ? `${character.name}의 주사위가 1(대실패)을 기록합니다! "${playerInput}" 시도가 바닥 턱에 걸려 허무하게 빗나가고 말았습니다.`
    : isSuccess
    ? `${character.name}은(는) 침착하게 "${playerInput}" 행동을 실행하여 ${enemy ? enemy.name : '적'}에게 ${damageDealt}의 데미지를 가했습니다.`
    : `${character.name}은(는) "${playerInput}" 행동을 시도했지만, ${enemy ? enemy.name : '적'}의 방어막을 뚫지 못했습니다.`;

  let localEnemyNarr = isCharmAction && isSuccess
    ? `매혹에 빠진 ${enemy ? enemy.name : '적'}은 플레이어를 공격하지 못하고, 옆에 있던 적에게 무기를 휘두르며 치명적인 내분을 일으켰습니다!`
    : enemyHitSuccess
    ? `${enemy ? enemy.name : '적'}이 즉시 무섭게 반격해 왔고, ${character.name}은(는) ${playerDamageTaken}의 피해를 입었습니다.`
    : `${enemy ? enemy.name : '적'}이 무기를 휘둘렀지만, ${character.name}은(는) 여유롭게 피하며 공격을 회피했습니다.`;

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
    playerHpChange: enemyHitSuccess ? -playerDamageTaken : 0,
    isTrolling: false
  };
}
