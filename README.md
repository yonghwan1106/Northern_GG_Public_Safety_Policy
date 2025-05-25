# 경기북부 지역 특화 순찰 시스템

## 🚔 프로젝트 개요

경기북부 지역의 치안 환경을 혁신적으로 개선하기 위한 AI 기반 지역 특화 순찰 시스템 웹사이트입니다.

## 🎯 프로젝트 목표

- **AI와 빅데이터 활용**: 범죄 패턴 분석 및 예측을 통한 효율적 순찰
- **지역 특화 서비스**: 경기북부 10개 시군의 특성을 반영한 맞춤형 치안
- **주민 참여형 플랫폼**: 실시간 신고 시스템과 커뮤니티 협력

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Fonts**: Noto Sans KR (Google Fonts)

## 📁 프로젝트 구조

```
html/
├── index.html              # 메인 HTML 파일
├── assets/
│   ├── css/
│   │   └── style.css       # 커스텀 CSS 스타일
│   └── js/
│       └── main.js         # 메인 JavaScript 파일
└── README.md               # 이 파일
```

## 🌟 주요 기능

### 1. 반응형 디자인
- 모바일 퍼스트 디자인
- 데스크톱, 태블릿, 모바일 완벽 지원

### 2. 인터랙티브 내비게이션
- 부드러운 스크롤 효과
- 모바일 햄버거 메뉴
- 현재 섹션 하이라이트

### 3. 데이터 시각화
- Chart.js를 활용한 검색어 트렌드 차트
- 애니메이션 효과가 있는 통계 카운터

### 4. 접근성 지원
- 키보드 내비게이션 지원
- 고대비 모드 지원
- 모션 감소 설정 지원

## 🎨 디자인 컨셉

### 색상 팔레트
- **Police Navy**: `#1e3a8a` - 신뢰성과 안정성
- **Police Blue**: `#3b82f6` - 현대적이고 전문적
- **Safety Orange**: `#f97316` - 주의와 경고
- **Success Green**: `#16a34a` - 성공과 안전

### 타이포그래피
- **메인 폰트**: Noto Sans KR
- **제목**: 600-700 weight
- **본문**: 400-500 weight

## 📱 반응형 브레이크포인트

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 사용법

1. **파일 실행**: `index.html` 파일을 웹 브라우저에서 열기
2. **로컬 서버** (권장): 
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   ```
3. **브라우저 접속**: `http://localhost:8000`

## 📊 섹션 구성

### 1. Hero Section
- 프로젝트 제목과 핵심 메시지
- CTA 버튼과 시각적 임팩트

### 2. Overview Section
- 프로젝트 개요와 주요 특징
- 현재 문제점과 해결 방향

### 3. System Section
- 시스템 아키텍처 설명
- 기술 스택과 구성 요소

### 4. Analysis Section
- 데이터 분석 결과
- 인터랙티브 차트

### 5. Effects Section
- 기대효과와 실현가능성
- 정량적 지표

### 6. Roadmap Section
- 단계별 구현 계획
- 예산 및 일정

## 🔧 커스터마이징

### 색상 변경
`tailwind.config` 섹션에서 색상 정의 수정:
```javascript
colors: {
    'police-navy': '#1e3a8a',
    'police-blue': '#3b82f6',
    // ... 기타 색상
}
```

### 차트 데이터 수정
`main.js`의 `initializeTrendChart()` 함수에서 데이터 변경

### 섹션 추가
1. HTML에 새 섹션 추가
2. 내비게이션 메뉴에 링크 추가
3. CSS 스타일 적용

## 🎯 성능 최적화

- **이미지 최적화**: WebP 형식 권장
- **CSS/JS 압축**: 프로덕션 환경에서 minification
- **CDN 활용**: 외부 라이브러리는 CDN 사용
- **레이지 로딩**: 이미지와 컴포넌트 지연 로딩

## 🌐 브라우저 지원

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📈 SEO 최적화

- 의미있는 HTML 구조
- Meta 태그 최적화
- 구조화된 데이터 (Schema.org)
- 사이트맵 및 robots.txt

## 🔒 보안 고려사항

- CSP (Content Security Policy) 헤더
- XSS 방지
- HTTPS 강제 사용
- 민감한 정보 클라이언트 사이드 노출 금지

## 📝 라이선스

이 프로젝트는 2025 경기북부 치안개선 정책 아이디어 공모전 출품작입니다.

## 👥 기여자

- **기획 및 개발**: Claude AI Assistant
- **데이터 분석**: 네이버 데이터랩
- **디자인**: Material Design 기반

## 📞 연락처

프로젝트 관련 문의사항은 경기도북부자치경찰위원회로 연락하시기 바랍니다.

---

**마지막 업데이트**: 2025년 5월 22일