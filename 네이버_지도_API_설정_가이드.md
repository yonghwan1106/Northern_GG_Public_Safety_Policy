# 네이버 지도 API 설정 가이드

## 🚨 현재 문제 상황
- 로컬 서버(http://localhost:8080)에서도 인증 실패 발생
- Error: Authentication Failed (200)

## 🔧 해결 방법

### 1단계: 네이버 개발자센터 접속
1. https://developers.naver.com/main/ 접속
2. 로그인 후 "내 애플리케이션" 클릭

### 2단계: Claude-mcp 애플리케이션 수정
1. "Claude-mcp" 애플리케이션 클릭
2. "API 설정" 탭 선택

### 3단계: Web 서비스 URL 설정 확인
**현재 설정:** http://localhost:8080

**추가로 설정해야 할 URL들:**
```
http://localhost:8080
http://127.0.0.1:8080  
http://localhost:8000
http://127.0.0.1:8000
http://localhost:3000
http://127.0.0.1:3000
```

### 4단계: 설정 저장 및 확인
1. "수정하기" 버튼 클릭
2. 변경사항 저장
3. 5-10분 후 다시 테스트

## 📋 체크리스트
- [ ] Web 서비스 URL에 localhost:8080 추가됨
- [ ] Web 서비스 URL에 127.0.0.1:8080 추가됨  
- [ ] 설정 저장 완료
- [ ] 5분 대기 후 테스트
- [ ] 브라우저 캐시 클리어 (Ctrl+Shift+R)

## 🎯 즉시 사용 가능한 대안
문제가 지속되면 **demo_fixed.html** 사용:
- ✅ API 없이도 모든 기능 완벽 작동
- ✅ 네이버 지도 에러 없음
- ✅ 즉시 사용 가능
