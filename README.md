# BALLAD: Tales Untold — 음유시인의 서사시 (AI TRPG)

> **NHN AI Game Hackathon 제출작**
> Gemini 3.5 Flash LLM 자율 중재자와 D20 룰 연산 엔진이 결합된 웹 기반 다크 판타지 TRPG

---

## 🎮 시연 및 배포 정보

* **🌐 라이브 플레이 사이트**: [https://baduli5741.github.io/NHN-AI-GAME-TRPG/](https://baduli5741.github.io/NHN-AI-GAME-TRPG/)
* **🎥 플레이 시연 영상 (YouTube)**: [https://youtu.be/YY19K64xKcU](https://youtu.be/YY19K64xKcU)
* **📦 깃허브 저장소**: [https://github.com/baduli5741/NHN-AI-GAME-TRPG](https://github.com/baduli5741/NHN-AI-GAME-TRPG)
* **👥 심사 계정 초대**: `dl_gameai_reviewer@nhn.com`

---

## ⚔️ 핵심 기획 및 시스템 특징

1. **Gemini 3.5 Flash LLM 자율 중재자 (Agentic Decision Schema)**:
   - 유저의 자유 텍스트 입력("a를 매혹해서 b를 공격하게 함", "둘 다 베어버린다", "눈에 흙을 뿌리고 회피")을 LLM이 직접 자율 의도 판정하여 JSON 데이터로 게임 엔진에 주입.
2. **다중 타겟(AoE) & 몬스터 동시 체력 연산**:
   - 광역 공격 시 모든 살아있는 몬스터의 HP가 동시에 감산되는 멀티 카드 렌더링.
3. **Action Chaining (한번 더) 연속 콤보 기억**:
   - '한번 더' 입력 시 전 턴의 행동 맥락을 자동으로 치환하고 연쇄 시전 연출.
4. **다회차 서사 기억 버퍼 (Multi-Turn Memory Buffer)**:
   - 최근 6개 턴의 전투 히스토리를 AI에 전달하여 턴 간 서사 연속성 100% 보장.
5. **구조화 룰북 프롬프트 증강 (Structured Rulebook RAG — `rulebook.json`)**:
   - 종족 특성(송곳니/흡혈 유무) 및 스탯 DC 검증 로직 탑재.

---

## 👥 팀원 구성 (BALLAD Devs)

* **양호준**: AI 프롬프팅 & 전체 풀스택 개발 (React/Vite 프론트엔드 전체, LLM 자율 판단 파이프라인, 다회차 메모리/액션 체이닝 엔진, RAG 룰북 모듈 및 Vercel/Base64 보안 인프라 구축)
* **홍준표**: 게임 기획, 레퍼런스 비교군 조사 & QA 검수 (BALLAD 세계관 기획, 레퍼런스 AI TRPG 비교 분석, LLM 자율 판단 UX 및 전투 밸런스 검수, QA 시연 테스트)
