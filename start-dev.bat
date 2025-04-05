@echo off
echo Starting Chatbot Basic Project with optimized settings...
echo.
echo Starting Backend (port 3002)...
start cmd /k "cd /d C:\Users\Administrator\Desktop\chatbot_basic\server && SET PORT=3002 && npm start"
echo.
echo Starting Frontend (port 3001) with performance optimizations...
start cmd /k "cd /d C:\Users\Administrator\Desktop\chatbot_basic\client && SET PORT=3001 && SET FAST_REFRESH=true && SET GENERATE_SOURCEMAP=false && SET BROWSER=none && SET TSC_COMPILE_ON_ERROR=true && SET ESLINT_NO_DEV_ERRORS=true && SET NODE_OPTIONS=--max-old-space-size=4096 && npm start"
echo.
echo Both services have been started with optimized settings.
echo Frontend URL: http://localhost:3001
echo Backend URL: http://localhost:3002
echo.
echo Note: Browser will not open automatically - please manually navigate to:
echo http://localhost:3001 