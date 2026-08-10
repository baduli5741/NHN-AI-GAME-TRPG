import React, { useState } from 'react';
import Header from './components/Header';
import CharacterSheet from './components/CharacterSheet';
import StoryView from './components/StoryView';
import CombatConsole from './components/CombatConsole';
import NodeMapModal from './components/NodeMapModal';
import DiceModal from './components/DiceModal';
import ApiSettingsModal from './components/ApiSettingsModal';
import CharacterSelectModal from './components/CharacterSelectModal';
import GameOverModal from './components/GameOverModal';
import TownView from './components/TownView';

import nodesData from './data/nodes.json';
import rulebookData from './data/rulebook.json';
import { evaluateCombatAction } from './services/geminiApi';
import { advanceGaugeUntilTurn, getNextActor, consumeActionGauge } from './services/turnEngine';
import './App.css';

export default function App() {
  const [character, setCharacter] = useState(null);
  const [isInTown, setIsInTown] = useState(true); // Town Hub vs Dungeon mode
  const [dungeonFloor, setDungeonFloor] = useState(1);
  const [explorationGauge, setExplorationGauge] = useState(0); // 0 ~ 100%
  const [unlockedAnchors, setUnlockedAnchors] = useState([1]);

  const [currentNodeId, setCurrentNodeId] = useState('node_1');
  const [completedNodeIds, setCompletedNodeIds] = useState([]);
  
  const currentNode = nodesData.find(n => n.id === currentNodeId) || nodesData[0];
  const [enemy, setEnemy] = useState(currentNode.eventScript.enemy ? { ...currentNode.eventScript.enemy } : null);

  const [storyHistory, setStoryHistory] = useState([
    {
      id: 'init_1',
      type: 'system_event',
      text: `[여정의 시작] 오프렌 왕국의 던전 탐색이 시작되었습니다.`
    }
  ]);

  const [choices, setChoices] = useState(currentNode.eventScript.choices || []);
  const [isCombat, setIsCombat] = useState(!!currentNode.eventScript.isCombat);
  const [isLoading, setIsLoading] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const [diceAnimOn, setDiceAnimOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  const setApiKey = (newKey) => {
    setApiKeyState(newKey);
    localStorage.setItem('gemini_api_key', newKey);
  };
  const [proxyUrl, setProxyUrl] = useState('');

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [pendingActionResult, setPendingActionResult] = useState(null);

  // Character Select Handler (Start in Town Hub)
  const handleCharacterSelect = (newChar) => {
    setCharacter(newChar);
    setIsInTown(true);
  };

  // Enter Dungeon Floor from Town Portal Anchor
  const handleEnterDungeonFloor = (floorNum) => {
    setDungeonFloor(floorNum);
    setIsInTown(false);
    setExplorationGauge(0);
    
    let targetNodeId = 'node_1';
    if (floorNum === 5) targetNodeId = 'node_4';
    if (floorNum === 10) targetNodeId = 'node_5';
    if (floorNum === 20) targetNodeId = 'node_boss';

    handleSelectNode(targetNodeId);
  };

  const [enemies, setEnemies] = useState(() => {
    return currentNode.eventScript.enemies
      ? currentNode.eventScript.enemies.map(e => ({ ...e }))
      : currentNode.eventScript.enemy ? [{ ...currentNode.eventScript.enemy, id: 'enemy_1' }] : [];
  });
  const [selectedTargetId, setSelectedTargetId] = useState(() => {
    return currentNode.eventScript.enemies?.[0]?.id || 'enemy_1';
  });

  // Node Selection Handler
  const handleSelectNode = (nodeId) => {
    const targetNode = nodesData.find(n => n.id === nodeId);
    if (!targetNode) return;

    setCurrentNodeId(nodeId);
    setIsCombat(!!targetNode.eventScript.isCombat);
    setChoices(targetNode.eventScript.choices || []);

    if (targetNode.eventScript.isCombat) {
      const initialEnemies = targetNode.eventScript.enemies
        ? targetNode.eventScript.enemies.map(e => ({ ...e }))
        : targetNode.eventScript.enemy ? [{ ...targetNode.eventScript.enemy, id: 'enemy_1' }] : [];

      setEnemies(initialEnemies);
      setEnemy(initialEnemies[0] || null);
      setSelectedTargetId(initialEnemies[0]?.id || null);
    } else {
      setEnemies([]);
      setEnemy(null);
      setSelectedTargetId(null);
    }

    const now = Date.now();
    setStoryHistory(prev => [
      ...prev,
      {
        id: `node_${now}_1`,
        type: 'system_event',
        text: `[던전 진입] ${targetNode.name} (${dungeonFloor}층)에 들어섰습니다. 탐색도: ${explorationGauge}%`
      },
      {
        id: `node_${now}_2`,
        type: 'narration',
        text: targetNode.eventScript.text
      }
    ]);
  };

  // Dungeon Exploration (+20% Gauge per click)
  const handleDungeonExploreClick = () => {
    const newGauge = Math.min(100, explorationGauge + 20);
    setExplorationGauge(newGauge);

    const now = Date.now();
    if (newGauge >= 100) {
      // 5F Boss anchor unlock
      if (dungeonFloor === 5 && !unlockedAnchors.includes(5)) {
        setUnlockedAnchors(prev => [...prev, 5]);
      }
      setStoryHistory(prev => [
        ...prev,
        {
          id: `explore_${now}`,
          type: 'system_event',
          text: `[탐색도 100% 달성!] 현재 층의 탐색을 마쳤습니다. 다음 층으로 이동하거나 보스전에 도전하세요!`
        }
      ]);
    } else {
      // Trigger random event
      const randVal = Math.random();
      if (randVal < 0.6) {
        // Combat event
        const randomEnemies = [
          { name: "던전 고블린 파수꾼", hp: 22, maxHp: 22, atk: 5, image: "monster-goblin-scout.png" },
          { name: "어둠의 룬 기사", hp: 35, maxHp: 35, atk: 8, image: "monster-goblin-chief.png" }
        ];
        const chosenEnemy = randomEnemies[Math.floor(Math.random() * randomEnemies.length)];
        setEnemy({ ...chosenEnemy });
        setIsCombat(true);
        setStoryHistory(prev => [
          ...prev,
          {
            id: `explore_${now}`,
            type: 'system_event',
            text: `[던전 탐색 +20%] 탐색도 ${newGauge}% | 무작위 적 ${chosenEnemy.name} 조우!`
          }
        ]);
      } else {
        // Rest event
        const healAmt = Math.floor(character.maxHp * 0.3);
        setCharacter(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }));
        setStoryHistory(prev => [
          ...prev,
          {
            id: `explore_${now}`,
            type: 'system_event',
            text: `[던전 탐색 +20%] 탐색도 ${newGauge}% | 임시 휴식처를 발견하여 HP +${healAmt} 회복!`
          }
        ]);
      }
    }
  };

  // Return to Village Hub
  const handleReturnToTown = () => {
    setIsInTown(true);
    setIsCombat(false);
    setCharacter(prev => ({ ...prev, hp: prev.maxHp })); // Heal HP/MP fully upon returning to town
    setStoryHistory(prev => [
      ...prev,
      {
        id: `town_${Date.now()}`,
        type: 'system_event',
        text: `[마을 복귀] 오프렌 왕국 마을로 안심하고 귀환하였습니다. (HP/MP 100% 회복)`
      }
    ]);
  };

  // Non-combat Choice Handler
  const handleChoiceSelect = (choice) => {
    const now = Date.now();
    let sysText = '';
    let narrText = '';

    if (choice.action === 'BUY_POTION') {
      if (character.gold >= 50) {
        const newGold = character.gold - 50;
        const newHp = Math.min(character.maxHp, character.hp + 10);
        setCharacter(prev => ({ ...prev, hp: newHp, gold: newGold }));
        sysText = `[아이템 구매] 체력 물약 복용! HP +10 회복 (-50G | 남은 골드: ${newGold}G)`;
        narrText = '상인이 만족스러운 미소를 지으며 포션을 건냅니다.';
      } else {
        sysText = '[구매 실패] 골드가 부족합니다!';
        narrText = '상인이 고개를 저으며 포션을 거두어들입니다.';
      }
    } else {
      sysText = '[탐색 완료] 해당 구역을 무사히 통과했습니다.';
      narrText = '주변의 위협을 살피며 발걸음을 옮깁니다.';
    }

    setStoryHistory(prev => [
      ...prev,
      { id: `choice_${now}_sys`, type: 'system_event', text: sysText },
      { id: `choice_${now}_narr`, type: 'narration', text: narrText }
    ]);
  };

  const [lastPlayerAction, setLastPlayerAction] = useState('');

  // Combat Free Text Action Handler
  const handleExecuteCombatAction = async (inputText) => {
    setIsLoading(true);

    let effectiveInput = inputText;
    const lowerInput = inputText.trim().toLowerCase();
    const isRepeatRequest = lowerInput.includes('한번 더') || lowerInput.includes('한번더') || lowerInput.includes('한 번 더') || lowerInput.includes('다시') || lowerInput.includes('똑같이') || lowerInput.includes('연속');

    if (isRepeatRequest && lastPlayerAction) {
      effectiveInput = `${lastPlayerAction} (연속 시전!)`;
    } else if (!isRepeatRequest) {
      setLastPlayerAction(inputText);
    }

    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const statBonus = Math.floor((character.stats.str - 10) / 2) || 0;

    const targetEnemy = enemies.find(e => e.id === selectedTargetId) || enemies.find(e => e.hp > 0) || enemy;

    const recentHistoryText = storyHistory
      .slice(-6)
      .map(h => h.text)
      .join('\n');

    const result = await evaluateCombatAction({
      playerInput: effectiveInput,
      character,
      enemy: targetEnemy,
      diceRoll,
      statBonus,
      recentHistory: recentHistoryText,
      apiKey,
      proxyUrl
    });

    result.rawDiceRoll = diceRoll;
    result.statBonus = statBonus;
    result.targetEnemyId = targetEnemy?.id;

    setPendingActionResult(result);
    setIsLoading(false);

    if (diceAnimOn) {
      setIsDiceModalOpen(true);
    } else {
      applyActionResult(result);
    }
  };

  // Apply Action Results
  const applyActionResult = (res) => {
    const now = Date.now();
    const newLogs = [
      { id: `combat_${now}_p_log`, type: 'system_player', text: res.systemLog },
      { id: `combat_${now}_p_narr`, type: 'narration', text: res.playerNarration || res.narrationText }
    ];

    if (res.enemySystemLog) {
      newLogs.push({ id: `combat_${now}_e_log`, type: 'system_enemy', text: res.enemySystemLog });
    }

    if (res.enemyNarration) {
      newLogs.push({ id: `combat_${now}_e_narr`, type: 'narration', text: res.enemyNarration });
    }

    // Handle Individual or Multi-Target AoE Damage & Defeat
    if (res.damageDealt > 0 && enemies.length > 0) {
      const targetId = res.targetEnemyId || selectedTargetId;
      const isMulti = res.isMultiTarget;
      let allDead = false;

      setEnemies(prev => {
        const nextList = prev.map(e => {
          if (isMulti || e.id === targetId) {
            const nextHp = Math.max(0, e.hp - res.damageDealt);
            return { ...e, hp: nextHp };
          }
          return e;
        });

        allDead = nextList.every(e => e.hp <= 0);
        return nextList;
      });

      if (isMulti) {
        enemies.forEach(e => {
          if (e.hp > 0 && (e.hp - res.damageDealt) <= 0) {
            newLogs.push({
              id: `combat_${now}_kill_${e.id}`,
              type: 'system_event',
              text: `[적 처치! ⚔️] ${e.name}을(를) 광역 공격으로 완벽히 쓰러뜨렸습니다!`
            });
          }
        });
      } else {
        const updatedTarget = enemies.find(e => e.id === targetId);
        if (updatedTarget && (updatedTarget.hp - res.damageDealt) <= 0) {
          newLogs.push({
            id: `combat_${now}_kill_target`,
            type: 'system_event',
            text: `[적 처치! ⚔️] ${updatedTarget.name}을(를) 완벽히 쓰러뜨렸습니다!`
          });

          const nextLiving = enemies.find(e => e.id !== targetId && e.hp > 0);
          if (nextLiving) {
            setSelectedTargetId(nextLiving.id);
          }
        }
      }

      if (allDead) {
        const rewardGold = 40;
        const newGold = character.gold + rewardGold;
        setCharacter(prev => ({ ...prev, gold: newGold }));
        setIsCombat(false);

        newLogs.push({
          id: `combat_${now}_win`,
          type: 'system_event',
          text: `[전투 승리! 🎉] 모든 적 무리를 처치했습니다! (+${rewardGold}G 획득 | 총: ${newGold}G)`
        });
      }
    }

    // Handle Player Damage & Death Penalty (Return to Town, Lose 10% Gold)
    if (res.playerHpChange !== 0) {
      const newPlayerHp = Math.max(0, Math.min(character.maxHp, character.hp + res.playerHpChange));
      setCharacter(prev => ({ ...prev, hp: newPlayerHp }));

      if (newPlayerHp <= 0) {
        setIsGameOver(true);
      }
    }

    setStoryHistory(prev => [...prev, ...newLogs]);
  };

  // Death Penalty: Return to Town with 10% Gold Loss
  const handleRetryFromCheckpoint = () => {
    setIsGameOver(false);
    const goldLoss = Math.floor(character.gold * 0.1);
    const newGold = Math.max(0, character.gold - goldLoss);

    setCharacter(prev => ({ ...prev, hp: prev.maxHp, gold: newGold }));
    setIsInTown(true);
    setIsCombat(false);

    setStoryHistory(prev => [
      ...prev,
      {
        id: `death_${Date.now()}`,
        type: 'system_event',
        text: `[사망 페널티] 체력이 0이 되어 오프렌 마을로 강제 복귀되었습니다. (-${goldLoss}G 손실)`
      }
    ]);
  };

  const handleDiceComplete = () => {
    setIsDiceModalOpen(false);
    if (pendingActionResult) {
      applyActionResult(pendingActionResult);
    }
  };

  const currentRaceObj = character ? rulebookData.races.find(r => r.id === character.race) : null;
  const innateSkillObj = currentRaceObj?.innateSkill ? rulebookData.skills[currentRaceObj.innateSkill] : null;

  return (
    <div className="dark-trpg-app">
      {!character && (
        <CharacterSelectModal
          isOpen={true}
          onSelectCharacter={handleCharacterSelect}
        />
      )}

      {character && (
        <>
          <Header
            diceAnimOn={diceAnimOn}
            setDiceAnimOn={setDiceAnimOn}
            soundOn={soundOn}
            setSoundOn={setSoundOn}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            currentNodeName={isInTown ? '오프렌 마을' : `${currentNode.name} (${dungeonFloor}층)`}
          />

          <div className="app-main-layout">
            <CharacterSheet
              character={character}
              onQuickSkillSelect={(skillName) => {
                const combatInput = document.querySelector('.action-input');
                if (combatInput) {
                  combatInput.value = `${skillName} 기술을 사용하여 정면 공격한다!`;
                  combatInput.focus();
                }
              }}
            />

            {/* Render Town View or Dungeon Story View */}
            {isInTown ? (
              <TownView
                character={character}
                setCharacter={setCharacter}
                unlockedAnchors={unlockedAnchors}
                onEnterDungeonFloor={handleEnterDungeonFloor}
              />
            ) : (
              <StoryView
                currentNode={currentNode}
                enemy={enemy}
                enemies={enemies}
                selectedTargetId={selectedTargetId}
                onSelectTarget={(targetId) => setSelectedTargetId(targetId)}
                storyHistory={storyHistory}
                choices={choices}
                onChoiceSelect={handleChoiceSelect}
                onOpenMap={() => setIsMapOpen(true)}
                onExploreCurrentNode={handleDungeonExploreClick}
                isCombat={isCombat}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Return to Village Button Bar when in Dungeon */}
          {!isInTown && (
            <div className="dungeon-bottom-bar">
              <button className="btn-return-town" onClick={handleReturnToTown}>
                🏰 오프렌 마을로 안전 귀환 (HP 100% 회복)
              </button>
            </div>
          )}

          {isCombat && enemy && enemy.hp > 0 && !isInTown && (
            <CombatConsole
              onExecuteAction={handleExecuteCombatAction}
              disabled={isLoading}
              character={character}
              characterSkillName={innateSkillObj?.name}
            />
          )}

          <NodeMapModal
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            currentNodeId={currentNodeId}
            completedNodeIds={completedNodeIds}
            onSelectNode={handleSelectNode}
          />

          {pendingActionResult && (
            <DiceModal
              isOpen={isDiceModalOpen}
              diceRoll={pendingActionResult.rawDiceRoll || 10}
              statBonus={pendingActionResult.statBonus || 0}
              statUsed={pendingActionResult.statUsed || 'STR'}
              dc={pendingActionResult.dc}
              isSuccess={pendingActionResult.isSuccess}
              isTrolling={pendingActionResult.isTrolling}
              onComplete={handleDiceComplete}
            />
          )}

          <ApiSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            apiKey={apiKey}
            setApiKey={setApiKey}
            proxyUrl={proxyUrl}
            setProxyUrl={setProxyUrl}
          />

          <GameOverModal
            isOpen={isGameOver}
            onRetry={handleRetryFromCheckpoint}
          />
        </>
      )}
    </div>
  );
}
