@echo off
echo ============================================================
echo   JobMitra E2E Test Suite - Playwright
echo   Screenshots + Error Capture + HTML Report
echo ============================================================
echo.

REM Create report directories
if not exist "e2e\reports\screenshots" mkdir "e2e\reports\screenshots"
if not exist "e2e\reports\html-report" mkdir "e2e\reports\html-report"
if not exist "e2e\reports\test-artifacts" mkdir "e2e\reports\test-artifacts"

REM Install Playwright
echo [1/4] Installing Playwright...
call npm install -D @playwright/test
call npx playwright install chromium

REM Check if servers are running
echo.
echo [2/4] Pre-flight checks...
echo   Ensure the following are running:
echo     - Backend:  http://localhost:8000 (python main.py)
echo     - Frontend: http://localhost:4200 (ng serve)
echo.
echo   Press any key to continue or Ctrl+C to abort...
pause > nul

REM Run E2E tests
echo.
echo [3/4] Running E2E tests...
echo.
call npx playwright test --reporter=html,list

REM Show results
echo.
echo [4/4] Test execution complete!
echo.
echo ============================================================
echo   REPORTS GENERATED:
echo ============================================================
echo.
echo   HTML Report:    e2e\reports\html-report\index.html
echo   Screenshots:    e2e\reports\screenshots\
echo   Test Artifacts: e2e\reports\test-artifacts\
echo   JSON Results:   e2e\reports\test-results.json
echo.
echo   To view the HTML report, run:
echo     npx playwright show-report e2e/reports/html-report
echo.
echo ============================================================
pause
