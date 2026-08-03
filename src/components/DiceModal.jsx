import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DiceModal({
  isOpen,
  diceRoll,
  statBonus,
  statUsed,
  dc,
  isSuccess,
  isTrolling,
  onComplete
}) {
  const [rollingValue, setRollingValue] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsFinished(false);
      return;
    }

    setIsFinished(false);
    let count = 0;
    const interval = setInterval(() => {
      setRollingValue(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setRollingValue(diceRoll);
        setIsFinished(true);

        if (isSuccess && !isTrolling) {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isOpen, diceRoll, isSuccess, isTrolling]);

  if (!isOpen) return null;

  const total = diceRoll + statBonus;

  return (
    <div className="modal-overlay">
      <div className="dice-modal-card">
        <h3 className="modal-title">🎲 D20 판정 주사위 롤링</h3>

        {/* Dice Visual Sphere */}
        <div className={`dice-sphere ${isFinished ? (isSuccess ? 'success' : 'fail') : 'rolling'}`}>
          <span className="dice-number">{isFinished ? diceRoll : rollingValue}</span>
        </div>

        {/* Calculation Details */}
        {isFinished && (
          <div className="roll-breakdown">
            <div className="math-row">
              <span>주사위: <strong>{diceRoll}</strong></span>
              <span>+</span>
              <span>{statUsed} 보정: <strong>+{statBonus}</strong></span>
              <span>=</span>
              <span className="total-score">합계 <strong>{total}</strong></span>
            </div>

            <div className="dc-badge">
              목표 난이도 (DC): <strong>{dc}</strong>
            </div>

            <div className={`result-banner ${isSuccess ? 'success' : 'fail'}`}>
              {isTrolling ? (
                <>
                  <AlertTriangle size={22} />
                  <span>[BS DETECTOR] 갓모드 차단! 판정 실패</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={22} />
                  <span>판정 성공! ({diceRoll === 20 ? '대성공 CRITICAL!' : 'SUCCESS'})</span>
                </>
              ) : (
                <>
                  <XCircle size={22} />
                  <span>판정 실패! ({diceRoll === 1 ? '대실패 CRITICAL FAIL!' : 'FAIL'})</span>
                </>
              )}
            </div>
          </div>
        )}

        {isFinished && (
          <button className="btn-confirm-dice" onClick={onComplete}>
            결과 확인 & 서사 보기
          </button>
        )}
      </div>
    </div>
  );
}
