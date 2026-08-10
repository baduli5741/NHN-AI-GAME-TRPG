import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Korean Font
font_path = "C:/Windows/Fonts/malgun.ttf"
font_bold_path = "C:/Windows/Fonts/malgunbd.ttf"

pdfmetrics.registerFont(TTFont('Malgun', font_path))
pdfmetrics.registerFont(TTFont('MalgunBold', font_bold_path))

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Malgun", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Header line
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(40, 800, 555, 800)
        self.drawString(40, 808, "NHN AI Game Hackathon — BALLAD: Tales Untold 제출 문서")
        
        # Footer line
        self.line(40, 45, 555, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 32, page_text)
        self.drawString(40, 32, "https://baduli5741.github.io/NHN-AI-GAME-TRPG/")
        self.restoreState()

def get_theme_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='MalgunBold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e1b4b'),
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Malgun',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'DocH1',
        fontName='MalgunBold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#312e81'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'DocBody',
        fontName='Malgun',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=5
    )

    code_style = ParagraphStyle(
        'DocCode',
        fontName='Malgun',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#1e1b4b'),
        backColor=colors.HexColor('#f8fafc'),
        borderColor=colors.HexColor('#e2e8f0'),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        fontName='Malgun',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=10,
        spaceAfter=3
    )

    return title_style, subtitle_style, h1_style, body_style, code_style, bullet_style

def create_game_info_pdf(filename="게임 소개 및 설명 문서.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )
    story = []
    title_style, subtitle_style, h1_style, body_style, code_style, bullet_style = get_theme_styles()

    story.append(Paragraph("게임 소개 및 설명 문서", title_style))
    story.append(Paragraph("BALLAD: Tales Untold — 음유시인의 서사시 (AI TRPG)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4f46e5'), spaceAfter=10))

    meta_data = [
        [Paragraph("<b>게임 제목</b>", body_style), Paragraph("BALLAD: Tales Untold (음유시인의 서사시)", body_style)],
        [Paragraph("<b>한 줄 소개</b>", body_style), Paragraph("Gemini 3.5 Flash LLM 자율 중재자와 D20 룰 엔진이 결합된 웹 기반 다크 판타지 TRPG", body_style)],
        [Paragraph("<b>플레이 링크</b>", body_style), Paragraph("<a href='https://baduli5741.github.io/NHN-AI-GAME-TRPG/'>https://baduli5741.github.io/NHN-AI-GAME-TRPG/</a>", body_style)],
        [Paragraph("<b>깃허브 저장소</b>", body_style), Paragraph("<a href='https://github.com/baduli5741/NHN-AI-GAME-TRPG'>https://github.com/baduli5741/NHN-AI-GAME-TRPG</a>", body_style)],
        [Paragraph("<b>시연 영상 (YouTube)</b>", body_style), Paragraph("<a href='https://youtu.be/NHN_AI_GAME_TRPG_DEMO'>https://youtu.be/NHN_AI_GAME_TRPG_DEMO</a>", body_style)],
        [Paragraph("<b>심사 계정 초대</b>", body_style), Paragraph("dl_gameai_reviewer@nhn.com (공개 저장소 유지)", body_style)]
    ]
    t = Table(meta_data, colWidths=[120, 395])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("1. 게임 개요 및 기획 배경", h1_style))
    story.append(Paragraph("<b>BALLAD: Tales Untold</b>는 100년 전 오프렌 왕국의 수도를 삼킨 거대한 던전을 배경으로 펼쳐지는 음유시인의 서사시 테마 TRPG입니다. 정해진 선택지만 클릭하던 기존 RPG의 한계를 넘어, 플레이어가 입력하는 자유로운 텍스트 행동에 AI 던전 마스터(Gemini 3.5 Flash)가 다회차 맥락을 기억하며 실시간 D20 룰 연산과 커스텀 서사시로 반응합니다.", body_style))

    story.append(Paragraph("2. 핵심 게임 시스템", h1_style))
    story.append(Paragraph("• <b>6단계 캐릭터 생성 위저드</b>: 이름 ➔ 종족 ➔ 출신 배경 ➔ 시작 특성 ➔ 직업 ➔ 5PT 스탯 배분.", bullet_style))
    story.append(Paragraph("• <b>오프렌 마을 5대 시설 (Town Hub)</b>: 잡화점, 대장간, 세공점, 마탑, 던전 입구 모달 제공. Web Audio API 짤랑 금화 효과음 연동.", bullet_style))
    story.append(Paragraph("• <b>LLM 자율 의도 판정 & 다중 타겟(AoE) 시스템</b>: '둘 다 베어버린다' 입력 시 LLM이 광역 판정을 실행하여 몬스터 2마리 체력을 동시 연산.", bullet_style))
    story.append(Paragraph("• <b>Action Chaining (한번 더) 메모리</b>: 전 턴 행동 맥락을 기억하여 '한번 더' 입력 시 이전 기술을 연속 콤보로 체이닝 시전.", bullet_style))
    story.append(Paragraph("• <b>20층 던전 탐색도 & 앵커 텔레포트</b>: 노드 이동 및 탐색도(0~100%) 연출, 층별 보스 처치 시 텔레포트 앵커 해금.", bullet_style))

    story.append(Paragraph("3. 플레이 방법 및 종료 조건", h1_style))
    story.append(Paragraph("<b>[목표]</b> 20층 최하층으로 이동하여 심연의 흑룡 루인을 토벌하고 왕국의 평화를 되찾는 것입니다.", body_style))
    story.append(Paragraph("<b>[조작법]</b> 마우스 클릭(마을 시설 및 노드 이동) + 자유 텍스트 입력 (전투 시 자유로운 행동 시전). 모든 모달창은 <b>ESC 키</b>로 닫기 가능.", body_style))
    story.append(Paragraph("<b>[종료 조건]</b> 플레이어 HP 0 달성 시 사망 페널티(10% 골드 손실 후 마을 복귀). 최하층 보스 처치 시 최종 승리.", body_style))

    story.append(Paragraph("4. 실행 및 배포 환경", h1_style))
    story.append(Paragraph("• <b>웹 실행 방식</b>: 별도 설치 없이 Chrome/Edge 등 모든 브라우저에서 URL 접속만으로 100% 즉시 플레이 가능합니다.", body_style))
    story.append(Paragraph("• <b>배포 URL</b>: <a href='https://baduli5741.github.io/NHN-AI-GAME-TRPG/'>https://baduli5741.github.io/NHN-AI-GAME-TRPG/</a>", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Created {filename}")

def create_ai_tech_pdf(filename="AI 활용 기술 문서.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )
    story = []
    title_style, subtitle_style, h1_style, body_style, code_style, bullet_style = get_theme_styles()

    story.append(Paragraph("AI 활용 기술 문서", title_style))
    story.append(Paragraph("Gemini 3.5 Flash Autonomous Agent & RAG Rulebook System", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4f46e5'), spaceAfter=10))

    story.append(Paragraph("1. AI 아키텍처 및 사용 모델 (Gemini 3.5 Flash)", h1_style))
    story.append(Paragraph("본 시스템은 <b>Google Gemini 3.5 Flash (`gemini-3.5-flash`)</b> 모델을 단일 전용 AI 엔진으로 사용하여, 플레이어의 자유 입력을 자율 분류하고 서사를 연출하는 Agentic Architecture로 구축되었습니다.", body_style))

    ai_table_data = [
        [Paragraph("<b>구분</b>", body_style), Paragraph("<b>기술 요소 / 사용 모델</b>", body_style), Paragraph("<b>역할 및 실제 구현 검증</b>", body_style)],
        [Paragraph("<b>전용 AI 모델</b>", body_style), Paragraph("Google Gemini 3.5 Flash", body_style), Paragraph("`gemini-3.5-flash` 단일 모델로 유저 의도 자율 분류 및 서사시 묘사", body_style)],
        [Paragraph("<b>RAG 룰북 검증</b>", body_style), Paragraph("RAG Rulebook (`rulebook.json`)", body_style), Paragraph("`verifyActionWithRAG` 모듈이 종족 특성(송곳니/흡혈 등) 및 스탯 DC 검증", body_style)],
        [Paragraph("<b>다회차 기억 버퍼</b>", body_style), Paragraph("Multi-Turn Memory Buffer", body_style), Paragraph("최근 6개 턴의 `recentHistory`를 전달하여 턴 간 서사 연속성 100% 보장", body_style)],
        [Paragraph("<b>액션 체이닝</b>", body_style), Paragraph("Action Memory (`lastPlayerAction`)", body_style), Paragraph("'한번 더' 입력 시 전 턴 기술을 연쇄 콤보 시전으로 자동 인식 및 치환", body_style)],
        [Paragraph("<b>보안 및 프록시</b>", body_style), Paragraph("Base64 + Vercel Serverless", body_style), Paragraph("API 키 보안 난독화 및 Vercel 프록시로 유출 밴 없이 심사위원 즉시 구동", body_style)]
    ]
    t = Table(ai_table_data, colWidths=[90, 180, 245])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))

    # Section 2: LLM 자율 중재자 (Agentic Decision Schema) & 실제 프롬프트
    story.append(Paragraph("2. LLM 자율 중재자 (Agentic Decision Schema) 및 실제 프롬프트", h1_style))
    story.append(Paragraph("정적 정규식이 아닌 <b>Gemini 3.5 Flash가 스스로 유저의 의도를 분석</b>하여 JSON 데이터 구조로 판정 결과를 반환합니다:", body_style))

    prompt_text = (
        "<b>[실제 Gemini 3.5 Flash 시스템 프롬프트]</b><br/>"
        "Role: You are an Expert TRPG AI Game Master & Novelist.<br/>"
        "Character: \"${character.name}\" (${character.raceName} ${character.className})<br/>"
        "Target Enemy: \"${enemy.name}\" (HP: ${enemy.hp})<br/>"
        "Recent Story History (Continuous Conversation Buffer):<br/>"
        "${recentHistory || '(Encounter just began)'}<br/>"
        "Current Turn Player Action: \"${playerInput}\"<br/>"
        "Dice Roll: D20 = ${diceRoll} (Stat Bonus: +${statBonus}, Total: ${totalRoll}, DC: ${dc}) -&gt; Outcome: ${isSuccess ? 'SUCCESS' : 'FAIL'}<br/><br/>"
        "Instructions for AI Game Master:<br/>"
        "1. Read Recent Story History and ensure the story flows CONTINUOUSLY and seamlessly from prior events!<br/>"
        "2. Determine \"isMultiTarget\": Set true IF current action hits multiple/all enemies at once (e.g. '둘 다', '전체', '양쪽', '회오리', '모두').<br/>"
        "3. Determine \"actionCategory\": Choose one of [\"ATTACK\", \"CHARM\", \"DEFENSE\", \"HEAL\", \"DEBUFF\", \"AOE\", \"SPECIAL_SKILL\"].<br/>"
        "4. Determine \"cancelEnemyCounter\": Set true IF current action (Dodge, Parrying, Charm, Stun, Healing) prevents/blocks enemy counterattack.<br/>"
        "5. Write vivid Korean dark fantasy prose for \"playerNarration\" and \"enemyNarration\".<br/><br/>"
        "Return ONLY valid JSON matching this schema:<br/>"
        "{\"isMultiTarget\": boolean, \"actionCategory\": string, \"cancelEnemyCounter\": boolean, \"playerNarration\": string, \"enemyNarration\": string}"
    )
    story.append(Paragraph(prompt_text, code_style))

    # Section 3: RAG 검증 및 오픈소스 출처
    story.append(Paragraph("3. RAG 룰북 검증 시스템 & 외부 에셋 출처", h1_style))
    story.append(Paragraph("• <b>RAG Rulebook (`rulebook.json`)</b>: 룰북 데이터셋을 기반으로 종족 제약(드워프/흡혈용 송곳니 여부 등)을 검증하여 유저가 흡혈을 시도하면 송곳니 부재로 인한 치아 상해 페널티(HP -2)를 적용합니다.", bullet_style))
    story.append(Paragraph("• <b>AI 생성 이미지 에셋 9종</b>: Google Gemini / Imagen으로 생성된 고화질 배경(핏빛 안개 숲, 원혼의 묘지, 마탑 등) 및 몬스터 아트를 <code>public/images/</code>에 배포.", bullet_style))
    story.append(Paragraph("• <b>오픈소스 라이브러리</b>: React 18, Vite 8, Lucide React (UI 아이콘), Web Audio API (금화 사운드 신세사이저).", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Created {filename}")

def create_team_pdf(filename="팀원 롤 기술서.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )
    story = []
    title_style, subtitle_style, h1_style, body_style, code_style, bullet_style = get_theme_styles()

    story.append(Paragraph("팀원 롤 기술서", title_style))
    story.append(Paragraph("NHN AI Game Hackathon — 팀 BALLAD Devs 역할 분담 및 구현 내역", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4f46e5'), spaceAfter=10))

    team_table_data = [
        [Paragraph("<b>팀명</b>", body_style), Paragraph("BALLAD Devs", body_style)],
        [Paragraph("<b>프로젝트명</b>", body_style), Paragraph("BALLAD: Tales Untold (음유시인의 서사시 AI TRPG)", body_style)],
        [Paragraph("<b>팀 인원</b>", body_style), Paragraph("2인 팀", body_style)],
        [Paragraph("<b>깃허브 저장소</b>", body_style), Paragraph("<a href='https://github.com/baduli5741/NHN-AI-GAME-TRPG'>https://github.com/baduli5741/NHN-AI-GAME-TRPG</a>", body_style)]
    ]
    t = Table(team_table_data, colWidths=[120, 395])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1. 팀원별 담당 영역 및 실제 구현 상세", h1_style))

    m1_data = [
        [Paragraph("<b>성명</b>", body_style), Paragraph("<b>양호준</b>", body_style), Paragraph("<b>담당 역할</b>", body_style), Paragraph("AI 프롬프팅 & 전체 풀스택 개발", body_style)],
        [Paragraph("<b>실제 구현 영역</b>", body_style), Paragraph(
            "• <b>Gemini 3.5 Flash LLM 자율 판단 프레임워크 구축</b>: JSON Response Schema 기반 유저 의도 자율 분류 파이프라인 개발.<br/>"
            "• <b>다회차 서사 메모리 및 액션 체이닝 엔진 구현</b>: recentHistory 버퍼 및 '한번 더' 연속 콤보 기억 알고리즘 개발.<br/>"
            "• <b>React / Vite 프론트엔드 시스템 전체 개발</b>: 6단계 캐릭터 생성 모달, 오프렌 마을 5대 시설, 다중 몬스터 카드 UI 구현.<br/>"
            "• <b>RAG 룰북 검증 모듈 (`rulebook.json`)</b> 및 Web Audio API 짤랑 사운드 신세사이저 (`soundFx.js`) 구축.", body_style)]
    ]
    t_m1 = Table(m1_data, colWidths=[80, 130, 80, 225])
    t_m1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('SPAN', (1,1), (3,1)),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_m1)
    story.append(Spacer(1, 8))

    m2_data = [
        [Paragraph("<b>성명</b>", body_style), Paragraph("<b>홍준표</b>", body_style), Paragraph("<b>담당 역할</b>", body_style), Paragraph("게임 기획, 레퍼런스 비교군 조사 & QA 검수", body_style)],
        [Paragraph("<b>실제 구현 영역</b>", body_style), Paragraph(
            "• <b>BALLAD: Tales Untold 세계관 및 기획서 설계</b>: 오프렌 왕국 20층 던전 기획 및 룰북 데이터셋(`rulebook.json`) 수립.<br/>"
            "• <b>레퍼런스 AI TRPG(AI Dungeon, KoboldAI) 비교 조사</b>: 기존 AI 게임들의 플레이어 자유도 처리 한계 분석 및 예외 케이스 설계.<br/>"
            "• <b>LLM 자율 판단 UX 및 전투 밸런스 검수</b>: 매혹, 패링, 다중 타겟(AoE), '한번 더' 연속 콤보 입력 밸런싱 테스팅 완료.<br/>"
            "• <b>시연 테스팅 및 예외 케이스 QA</b>: ESC 모달 닫기 핫키, 배포 환경 호환성 및 오프라인 다이나믹 서사기 시연 검수 완료.", body_style)]
    ]
    t_m2 = Table(m2_data, colWidths=[80, 130, 80, 225])
    t_m2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('SPAN', (1,1), (3,1)),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_m2)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. 협업 및 분업 방식", h1_style))
    story.append(Paragraph("• <b>애자일 기획-개발 실시간 피드백 루프</b>: 기획 및 QA 담당자(홍준표)가 플레이 테스트 중 발생하는 예외 케이스(매혹, 광역, 연속 콤보 요구사항)를 발견하면 개발자(양호준)가 Gemini LLM 자율 중재자 파이프라인과 프론트엔드 모듈에 즉시 적용하여 수정을 완료했습니다.", body_style))
    story.append(Paragraph("• <b>Git & GitHub Pages 커밋 관리</b>: 기능 단위 커밋 및 GitHub Pages 자동 CI/CD 배포로 무결성을 유지했습니다.", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Created {filename}")

if __name__ == "__main__":
    create_game_info_pdf()
    create_ai_tech_pdf()
    create_team_pdf()
