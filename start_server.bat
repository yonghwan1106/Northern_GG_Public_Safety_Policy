@echo off
echo ============================================
echo   경기북부 치안개선 데모 서버 시작
echo ============================================
echo.
echo 서버가 시작됩니다...
echo 브라우저에서 http://localhost:8080 으로 접속하세요
echo.
echo 서버를 중지하려면 Ctrl+C 를 누르세요
echo ============================================
echo.

cd /d "%~dp0"

:: Python이 설치되어 있는지 확인
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python 서버를 시작합니다...
    python -m http.server 8080
) else (
    :: Node.js가 설치되어 있는지 확인
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Node.js 서버를 시작합니다...
        npx http-server -p 8080
    ) else (
        echo.
        echo [오류] Python 또는 Node.js가 설치되어 있지 않습니다.
        echo.
        echo 해결방법 1: Python 설치 후 다시 실행
        echo   - https://www.python.org/downloads/ 에서 Python 다운로드
        echo.
        echo 해결방법 2: demo_fixed.html 파일을 사용
        echo   - 네이버 지도 API 없이도 모든 기능이 작동합니다
        echo.
        pause
    )
)
