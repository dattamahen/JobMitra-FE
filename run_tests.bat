@echo off
echo ============================================
echo   JobMitra Frontend - Test Suite Runner
echo ============================================
echo.

REM Install test reporter
echo [1/3] Installing test reporter...
call npm install karma-spec-reporter --save-dev -q 2>nul

REM Run tests with coverage
echo.
echo [2/3] Running Angular test suite...
echo.
call ng test --no-watch --code-coverage --browsers=ChromeHeadless

echo.
echo [3/3] Test execution complete!
echo.
echo Reports generated:
echo   - Coverage Report: coverage/index.html
echo   - Terminal output above shows test results
echo.
echo ============================================
pause
