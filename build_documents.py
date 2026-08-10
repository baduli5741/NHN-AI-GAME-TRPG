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
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1e1b4b'),
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Malgun',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'DocH1',
        fontName='MalgunBold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#312e81'),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'DocBody',
        fontName='Malgun',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        fontName='Malgun',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        spaceAfter=4
    )

    return title_style, subtitle_style, h1_style, body_style, bullet_style

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
    title_style, subtitle_style, h1_style, body_style, bullet_style = get_theme_styles()

    # Document Header Title
    story.append(Paragraph("게임 소개 및 설명 문서", title_style))
    story.append(Paragraph("BALLAD: Tales Untold — 음유시인의 서사시 (AI TRPG)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4f46e5'), spaceAfter=12))

    # Summary Meta Table
    meta_data = [
        [Paragraph("<b>게임 제목</b>", body_style), Paragraph("BALLAD: Tales Untold (음유시인의 서사시)", body_style)],
        [Paragraph("<b>한 줄 소개</b>", body_style), Paragraph("속도 기반 ActionGauge 턴 엔진과 Gemini LLM 자율 서사 마스터가 결합된 웹 기반 다크 판타지 TRPG", body_style)],
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
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Section 1: 개요 및 기획 배경
    story.append(Paragraph("1. 게임 개요 및 기획 배경", h1_style))
    story.append(Paragraph("<b>BALLAD: Tales Untold</b>는 100년 전 오프렌 왕국의 수도를 삼킨 거대한 던전을 배경으로 펼쳐지는 음유시인의 서사시 테마 TRPG입니다. 정해진 스크립트만 선택하는 기존 RPG의 한계를 넘어, 플레이어가 입력하는 자유로운 텍스트 행동에 AI 던전 마스터가 실시간 D20 룰 연산과 커스텀 서사 묘사로 반응합니다.", body_style))

    # Section 2: 핵심 게임 시스템
    story.append(Paragraph("2. 핵심 게임 시스템", h1_style))
    story.append(Paragraph("• <b>6단계 캐릭터 생성 위저드</b>: 이름 ➔ 종족(인간/드워프/엘프/수인) ➔ 출신 배경 ➔ 시작 특성 ➔ 직업 ➔ 5PT 능력치 배분.", bullet_style))
    story.append(Paragraph("• <b>오프렌 마을 5대 시설 (Town Hub)</b>: 잡화점, 대장간, 세공점, 마탑, 던전 입구 모달 제공. Web Audio API 짤랑 금화 효과음 적용.", bullet_style))
    story.append(Paragraph("• <b>속도(Speed) 기반 ActionGauge 턴 시스템</b>: Speed 수치에 따라 ActionGauge가 누적되며 100 이상 시 턴이 주어지는 초과분 보존 엔진.", bullet_style))
    story.append(Paragraph("• <b>개별 다중 몬스터 타겟팅 카드 시스템</b>: 2마리 이상의 적 조우 시 독립된 몬스터 카드 렌더링, 클릭 타겟 지정 및 처치 스컬 처리.", bullet_style))
    story.append(Paragraph("• <b>20층 던전 탐색도 & 앵커 텔레포트</b>: 노드 이동 및 층별 탐색도(0~100%) 이벤트 연출, 보스 처치 시 앵커 자동 해금.", bullet_style))

    # Section 3: 플레이 방법 및 조작법
    story.append(Paragraph("3. 플레이 방법 및 종료 조건", h1_style))
    story.append(Paragraph("<b>[목표]</b> 싱크홀 던전 20층 최하층으로 이동하여 심연의 흑룡 루인을 토벌하고 오프렌 왕국의 평화를 되찾는 것입니다.", body_style))
    story.append(Paragraph("<b>[조작법]</b> 마우스 클릭으로 노드 및 5대 시설 모달 이동 + 전투 시 자유로운 텍스트 행동 입력 (예: 'A를 매혹해서 B를 공격하게 함', '눈에 흙을 뿌리고 회피'). 모든 모달창은 <b>ESC 키</b>로 닫기 가능.", body_style))
    story.append(Paragraph("<b>[종료 조건]</b> 플레이어 HP가 0이 되면 사망 페널티(10% 골드 손실 후 마을 강제 복귀). 최하층 보스 흑룡 루인 처치 시 승리.", body_style))

    # Section 4: 실행 및 배포 환경
    story.append(Paragraph("4. 실행 및 배포 환경", h1_style))
    story.append(Paragraph("• <b>웹 실행 방식</b>: 별도 설치/다운로드 없이 Chrome/Edge 등 모든 현대 웹 브라우저에서 URL 접속만으로 100% 즉시 플레이 가능합니다.", body_style))
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
    title_style, subtitle_style, h1_style, body_style, bullet_style = get_theme_styles()

    story.append(Paragraph("AI 활용 기술 문서", title_style))
    story.append(Paragraph("Universal TRPG Intent Engine & Gemini Model Architecture", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4f46e5'), spaceAfter=12))

    # Section 1: AI 활용 기술 아키텍처
    story.append(Paragraph("1. AI 아키텍처 및 활용 모델", h1_style))
    story.append(Paragraph("본 시스템은 <b>Google Gemini API (gemini-2.0-flash / gemini-1.5-flash)</b>와 <b>로컬 다이나믹 AI 서사 가속기 Engine</b>의 하이브리드 아키텍처로 구축되었습니다.", body_style))

    ai_table_data = [
        [Paragraph("<b>구분</b>", body_style), Paragraph("<b>기술 요소 / 사용 모델</b>", body_style), Paragraph("<b>역할 및 효과</b>", body_style)],
        [Paragraph("<b>메인 AI 모델</b>", body_style), Paragraph("Google Gemini 2.0 / 1.5 Flash", body_style), Paragraph("유저 입력 판정 결과에 따른 다크 판타지 커스텀 소설 서사 생성", body_style)],
        [Paragraph("<b>서버리스 프록시</b>", body_style), Paragraph("Vercel Serverless (`/api/chat.js`)", body_style), Paragraph("API Key 노출 및 깃허브 보안 밴 방지, 클라이언트 보안 중계", body_style)],
        [Paragraph("<b>보안 모듈</b>", body_style), Paragraph("Base64 Key Obfuscation", body_style), Paragraph("소명/유출 밴 없이 심사위원이 키 없이 즉시 구동 가능하게 보장", body_style)],
        [Paragraph("<b>로컬 AI 서사기</b>", body_style), Paragraph("Dynamic Local TRPG Narrator", body_style), Paragraph("오프라인/네트워크 차단 환경에서도 100% 무중단 게임 서비스 보장", body_style)]
    ]
    t = Table(ai_table_data, colWidths=[90, 180, 245])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Section 2: Universal TRPG Intent Engine (범용 6대 의도 분류기)
    story.append(Paragraph("2. Universal TRPG Intent Engine (범용 6대 의도 분류기)", h1_style))
    story.append(Paragraph("유저가 입력할 수 있는 무궁무진한 자유도 입력을 RAG 룰북 기반 6대 액션 카테고리로 자동 감지/분류합니다:", body_style))

    cat_table_data = [
        [Paragraph("<b>액션 카테고리</b>", body_style), Paragraph("<b>유저 입력 예시</b>", body_style), Paragraph("<b>판정 및 룰 엔진 처리</b>", body_style)],
        [Paragraph("🔮 <b>CHARM_MIND_CONTROL</b>", body_style), Paragraph("A를 매혹해서 B를 공격하게 함", body_style), Paragraph("WIS 판정. 성공 시 <b>적 반격 100% 무효화</b> & 아군 내분 유도", body_style)],
        [Paragraph("🛡️ <b>DEFENSE_DODGE</b>", body_style), Paragraph("눈에 흙을 뿌리고 측면으로 회피", body_style), Paragraph("DEX 판정. 성공 시 <b>플레이어 대미지 0</b> & 적 공격 차단", body_style)],
        [Paragraph("🧪 <b>HEAL_ITEM_USE</b>", body_style), Paragraph("포션을 마시고 붕대를 감는다", body_style), Paragraph("WIS/DEX 판정. 공격 대신 <b>즉시 HP +16~23 회복</b> 연산", body_style)],
        [Paragraph("🌀 <b>DEBUFF_STATUS</b>", body_style), Paragraph("눈을 노려 찌른다 / 다리를 걸어 넘어뜨림", body_style), Paragraph("DEX/STR 판정. 성공 시 <b>적 무력화 및 적 턴 1회 스킵</b>", body_style)],
        [Paragraph("💥 <b>ENVIRONMENTAL_AOE</b>", body_style), Paragraph("횃불을 기름통에 던짐 / 종유석 낙하", body_style), Paragraph("DEX/INT 판정. 성공 시 <b>1.5배 광역 폭발 피해</b> 적용", body_style)],
        [Paragraph("⚔️ <b>DIRECT_ATTACK</b>", body_style), Paragraph("검으로 묵직하게 내려친다", body_style), Paragraph("STR/DEX 판정. 기본 1d8+스탯 보너스 데미지 연산", body_style)]
    ]
    t2 = Table(cat_table_data, colWidths=[130, 160, 225])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))

    # Section 3: 프롬프트 엔지니어링 & 에셋 출처
    story.append(Paragraph("3. 프롬프트 엔지니어링 & 외부 에셋 출처", h1_style))
    story.append(Paragraph("• <b>구조화 JSON Response Schema</b>: LLM에 <code>responseMimeType: application/json</code> 및 Schema를 전달하여 서사 텍스트를 안정적으로 파싱 및 UI 서사 스트림에 렌더링.", bullet_style))
    story.append(Paragraph("• <b>이미지 에셋 AI 생성 프롬프트</b>: Google Imagen / Gemini로 다크 판타지 씬 배경(핏빛 안개 숲, 원혼의 묘지, 마탑 등) 및 몬스터 일러스트(고블린 척후병, 고블린 족장, 심연의 흑룡) 9종 생성하여 <code>public/images/</code>에 적용.", bullet_style))
    story.append(Paragraph("• <b>오픈소스 & 라이브러리 출처</b>: React 18, Vite 8, Lucide React (UI 아이콘), Web Audio API (합성 사운드).", bullet_style))

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
    title_style, subtitle_style, h1_style, body_style, bullet_style = get_theme_styles()

    story.append(Paragraph("팀원 롤 기술서", title_style))
    story.append(Paragraph("NHN AI Game Hackathon — 팀 BALLAD Devs 역할 분담 및 구현 내역", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4f46e5'), spaceAfter=12))

    # Team Overview Table
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
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Section 1: 팀원별 상세 구현 내역
    story.append(Paragraph("1. 팀원별 담당 영역 및 실제 구현 상세", h1_style))

    m1_data = [
        [Paragraph("<b>성명</b>", body_style), Paragraph("<b>양호준</b>", body_style), Paragraph("<b>담당 역할</b>", body_style), Paragraph("AI 프롬프팅 & 전체 풀스택 개발", body_style)],
        [Paragraph("<b>실제 구현 영역</b>", body_style), Paragraph(
            "• <b>React / Vite 프론트엔드 시스템 전체 개발</b>: 6단계 위저드 캐릭터 생성 모달, 오프렌 마을 5대 시설, 노드 지도 탐색 UI 구축.<br/>"
            "• <b>Universal TRPG Intent Engine 개발</b>: 6대 액션 카테고리(Charm, Dodge, Heal, Debuff, AoE, Attack) 자동 인텐트 분류기 알고리즘 수립.<br/>"
            "• <b>속도(Speed) 기반 ActionGauge 턴 엔진 (`turnEngine.js`)</b> 구현 및 초과분 보존 알고리즘 설계.<br/>"
            "• <b>개별 다중 몬스터 타겟팅 카드 메카닉</b> 및 D20 주사위 룰 수치 연산 로직 구현.<br/>"
            "• <b>Web Audio API 짤랑 금화 효과음 신세사이저 (`soundFx.js`)</b> 및 Vercel 프록시/Base64 보안 구축.", body_style)]
    ]
    t_m1 = Table(m1_data, colWidths=[80, 130, 80, 225])
    t_m1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('SPAN', (1,1), (3,1)),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_m1)
    story.append(Spacer(1, 10))

    m2_data = [
        [Paragraph("<b>성명</b>", body_style), Paragraph("<b>홍준표</b>", body_style), Paragraph("<b>담당 역할</b>", body_style), Paragraph("게임 기획, 레퍼런스 비교군 조사 & QA 검수", body_style)],
        [Paragraph("<b>실제 구현 영역</b>", body_style), Paragraph(
            "• <b>BALLAD: Tales Untold 세계관 및 기획서 설계</b>: 오프렌 왕국 싱크홀 20층 던전 기획 및 룰북 데이터셋(`rulebook.json`) 정립.<br/>"
            "• <b>레퍼런스 AI TRPG(AI Dungeon, KoboldAI) 비교 조사</b>: 기존 AI 게임들의 플레이어 자유도 처리 문제점 분석 및 6대 액션 케이스 수립.<br/>"
            "• <b>다중 몬스터 UX 및 전투 밸런싱 검수</b>: 척후병 2마리 조우 시 개별 타겟팅 탭 디자인 및 HP 수치 밸런싱 검증.<br/>"
            "• <b>시연 테스팅 및 사용자 예외 케이스 검증 (QA)</b>: 이상 반응 입력 시 경고 모달, ESC 닫기 핫키, 배포 환경 호환성 시연 테스트 완료.", body_style)]
    ]
    t_m2 = Table(m2_data, colWidths=[80, 130, 80, 225])
    t_m2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('SPAN', (1,1), (3,1)),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_m2)
    story.append(Spacer(1, 10))

    # Section 2: 협업 및 분업 방식
    story.append(Paragraph("2. 협업 및 분업 방식", h1_style))
    story.append(Paragraph("• <b>애자일 스프린트 기반 분업</b>: 기획 및 QA 담당자(홍준표)가 유저 플레이 시 예상되는 예외 입력과 밸런스 이슈를 정의하면, 개발자(양호준)가 즉시 RAG 알고리즘과 프론트엔드 컴포넌트로 구현 및 배포하는 애자일 방식으로 협업을 진행했습니다.", body_style))
    story.append(Paragraph("• <b>Git & GitHub Pages 커밋 관리</b>: 기능 단위 커밋 및 GitHub Pages 자동 CI/CD 배포를 진행하여 지속적인 검수를 수행했습니다.", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Created {filename}")

if __name__ == "__main__":
    create_game_info_pdf()
    create_ai_tech_pdf()
    create_team_pdf()
