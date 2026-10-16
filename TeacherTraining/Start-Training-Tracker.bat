@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 start-poc.py
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python 3 is required. Install Python 3 and run this launcher again.
  ) else (
    python start-poc.py
  )
)
pause
