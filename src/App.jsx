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

import nodesData from './data/nodes.json';
import rulebookData from './data/rulebook.json';
import { evaluateCombatAction } from './services/geminiApi';
import './App.css';

export default function App() {
  const [character, setCharacter] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState('node_1');
  const [completedNodeIds, setCompletedNodeIds] = useState([]);
  
  const currentNode = nodesData.find(n => n.id === currentNodeId) || nodesData[0];
  const [enemy, setEnemy] = useState(currentNode.eventScript.enemy ? { ...currentNode.eventScript.enemy } : null);

  const [storyHistory, setStoryHistory] = useState([
    {
      id: 'init_1',
      type: 'system_event',
      text: `[여정의 시작] ${currentNode.name}에 도착하였습니다.`
    },
    {
      id: 'init_2',
      type: 'narration',
      text: currentNode.eventScript.text
    }
  ]);

  const [choices, setChoices] = useState(currentNode.eventScript.choices || []);
  const [isCombat, setIsCombat] = useState(!!currentNode.eventScript.isCombat);
  const [isLoading, setIsLoading] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const [diceAnimOn, setDiceAnimOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [apiKey, setApiKey] = useState('AIzaSyBH8e2a2o1Li2cg1JVMZbtwdk4AyDS-Ea0');
  const [proxyUrl, setProxyUrl] = useState('');

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [pendingActionResult, setPendingActionResult] = useState(null);

  // Character Select Handler
  const handleCharacterSelect = (newChar) => {
    setCharacter(newChar);
    setIsMapOpen(true);
  };

  // Node Selection Handler
  const handleSelectNode = (nodeId) => {
    const targetNode = nodesData.find(n => n.id === nodeId);
    if (!targetNode) return;

    setCurrentNodeId(nodeId);
    setIsCombat(!!targetNode.eventScript.isCombat);
    setChoices(targetNode.eventScript.choices || []);

    const newEnemy = targetNode.eventScript.enemy ? { ...targetNode.eventScript.enemy } : null;
    setEnemy(newEnemy);

    const now = Date.now();
    setStoryHistory(prev => [
      ...prev,
      {
        id: `node_${now}_1`,
        type: 'system_event',
        text: `[지역 이동] ${targetNode.name}에 도착하였습니다.`
      },
      {
        id: `node_${now}_2`,
        type: 'narration',
        text: targetNode.eventScript.text
      }
    ]);
  };

  // Explore Current Region Again (Random combat/event respawn)
  const handleExploreCurrentNode = () => {
    const now = Date.now();
    const randomEnemies = [
      { name: "어둠의 숲 고블린 게릴라", hp: 20, maxHp: 20, atk: 5, image: "monster-goblin-scout.png" },
      { name: "통곡의 고블린 척후 장교", hp: 28, maxHp: 28, atk: 7, image: "monster-goblin-chief.png" },
      { name: "심연의 수호 흑룡 환영", hp: 45, maxHp: 45, atk: 10, image: "monster-dragon.png" }
    ];

    const newEnemy = randomEnemies[Math.floor(Math.random() * randomEnemies.length)];
    setEnemy({ ...newEnemy });
    setIsCombat(true);

    setStoryHistory(prev => [
      ...prev,
      {
        id: `reexplore_${now}_1`,
        type: 'system_event',
        text: `[지역 추가 재탐색] ${currentNode.name}의 깊은 안개 속을 더 둘러봅니다.`
      },
      {
        id: `reexplore_${now}_2`,
        type: 'narration',
        text: `주변을 다시 수색하던 중 어둠 속에서 불길한 기운과 함께 ${newEnemy.name}이(가) 나타나 공격태세를 취합니다!`
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
        narrText = '상인이 만족스러운 미소를 지으며 보라색 포션을 건냅니다. 삼키자 온몸의 상처가 아물며 기운이 차오릅니다.';
      } else {
        sysText = '[구매 실패] 골드가 부족합니다!';
        narrText = '상인이 냉담한 표정으로 고개를 저으며 포션을 거두어들입니다.';
      }
    } else if (choice.action === 'SACRIFICE_HP') {
      if (character.hp > 5) {
        const newHp = character.hp - 5;
        setCharacter(prev => ({
          ...prev,
          hp: newHp,
          stats: { ...prev.stats, str: prev.stats.str + 1, dex: prev.stats.dex + 1 }
        }));
        sysText = `[제단 헌식] 검은 제단에 피를 바쳤습니다! STR +1, DEX +1 상승 (-5 HP)`;
        narrText = '제단이 당신의 피를 머금고 푸른 룬 문자를 일렁입니다. 금단의 마력이 신체에 정밀하게 깃듭니다!';
      } else {
        sysText = '[헌식 실패] 체력이 너무 낮아 피를 바칠 수 없습니다.';
        narrText = '의식이 희미해져 제단에 다가갈 수 없습니다.';
      }
    } else if (choice.action === 'OPEN_CHEST') {
      const rewardGold = 40;
      const newGold = character.gold + rewardGold;
      setCharacter(prev => ({ ...prev, gold: newGold }));
      sysText = `[보물 상자] 상자에서 붉은 금화 뭉치를 발견했습니다! (+${rewardGold}G | 총: ${newGold}G)`;
      narrText = '상자를 열자 빛나는 묵직한 가죽 주머니 속에 붉은 금화가 가득 들어 있습니다.';
    } else {
      sysText = '[탐색 완료] 해당 구역을 무사히 통과했습니다.';
      narrText = '주변의 위협을 살피며 조용히 발걸음을 옮깁니다.';
    }

    setStoryHistory(prev => [
      ...prev,
      { id: `choice_${now}_sys`, type: 'system_event', text: sysText },
      { id: `choice_${now}_narr`, type: 'narration', text: narrText }
    ]);

    if (!completedNodeIds.includes(currentNodeId)) {
      setCompletedNodeIds(prev => [...prev, currentNodeId]);
    }
  };

  // Combat Free Text Action Handler
  const handleExecuteCombatAction = async (inputText) => {
    setIsLoading(true);

    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const statBonus = Math.floor((character.stats.str - 10) / 2) || 0;

    const result = await evaluateCombatAction({
      playerInput: inputText,
      character,
      enemy,
      diceRoll,
      statBonus,
      apiKey,
      proxyUrl
    });

    result.rawDiceRoll = diceRoll;
    result.statBonus = statBonus;

    setPendingActionResult(result);
    setIsLoading(false);

    if (diceAnimOn) {
      setIsDiceModalOpen(true);
    } else {
      applyActionResult(result);
    }
  };

  // Apply Action Results to Stream History & Check Player Death
  const applyActionResult = (res) => {
    const now = Date.now();
    const newLogs = [
      { id: `combat_${now}_p`, type: 'system_player', text: res.systemLog }
    ];

    if (res.enemySystemLog) {
      newLogs.push({ id: `combat_${now}_e`, type: 'system_enemy', text: res.enemySystemLog });
    }

    newLogs.push({ id: `combat_${now}_n`, type: 'narration', text: res.narrationText });

    // Handle Enemy Damage & Victory Check
    if (res.damageDealt > 0 && enemy) {
      const newEnemyHp = Math.max(0, enemy.hp - res.damageDealt);
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));

      if (newEnemyHp <= 0) {
        const rewardGold = 30;
        const newGold = character.gold + rewardGold;
        setCharacter(prev => ({ ...prev, gold: newGold }));
        setIsCombat(false);

        newLogs.push({
          id: `combat_${now}_win`,
          type: 'system_event',
          text: `[전투 승리! 🎉] ${enemy.name}을(를) 처치했습니다! (+${rewardGold}G 획득 | 총: ${newGold}G)`
        });

        if (!completedNodeIds.includes(currentNodeId)) {
          setCompletedNodeIds(prev => [...prev, currentNodeId]);
        }
      }
    }

    // Handle Player Damage & Death Check
    if (res.playerHpChange !== 0) {
      const newPlayerHp = Math.max(0, Math.min(character.maxHp, character.hp + res.playerHpChange));
      setCharacter(prev => ({ ...prev, hp: newPlayerHp }));

      if (newPlayerHp <= 0) {
        setIsGameOver(true);
      }
    }

    setStoryHistory(prev => [...prev, ...newLogs]);
  };

  // Retry from Checkpoint
  const handleRetryFromCheckpoint = () => {
    setIsGameOver(false);
    setCharacter(prev => ({ ...prev, hp: prev.maxHp }));
    
    // Reset current node enemy
    if (currentNode.eventScript.enemy) {
      setEnemy({ ...currentNode.eventScript.enemy });
      setIsCombat(true);
    }

    setStoryHistory(prev => [
      ...prev,
      {
        id: `retry_${Date.now()}`,
        type: 'system_event',
        text: `[체크포인트 재시도] 의식을 회복하고 체력 100% 상태로 전투에 재도전합니다!`
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
            currentNodeName={currentNode.name}
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

            <StoryView
              currentNode={currentNode}
              enemy={enemy}
              storyHistory={storyHistory}
              choices={choices}
              onChoiceSelect={handleChoiceSelect}
              onOpenMap={() => setIsMapOpen(true)}
              onExploreCurrentNode={handleExploreCurrentNode}
              isCombat={isCombat}
              isLoading={isLoading}
            />
          </div>

          {isCombat && enemy && enemy.hp > 0 && (
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

          {/* Game Over Retry Modal */}
          <GameOverModal
            isOpen={isGameOver}
            onRetry={handleRetryFromCheckpoint}
          />
        </>
      )}
    </div>
  );
}
