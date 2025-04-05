@echo off
echo Starting Chatbot Frontend with optimized settings...
echo.

cd /d C:\Users\Administrator\Desktop\chatbot_basic\client

echo Setting performance environment variables...
SET PORT=3001
SET FAST_REFRESH=true
SET GENERATE_SOURCEMAP=false
SET BROWSER=none
SET TSC_COMPILE_ON_ERROR=true
SET ESLINT_NO_DEV_ERRORS=true
SET NODE_OPTIONS=--max-old-space-size=4096

echo Starting React development server...
start cmd /k "npm start"

echo.
echo Frontend should now be starting with optimized settings...
echo You can access it at: http://localhost:3001
echo.
echo Note: The browser won't launch automatically (BROWSER=none setting)
echo To view the app, manually navigate to http://localhost:3001 in your browser 