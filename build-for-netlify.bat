@echo off
echo Preparing Chatbot SaaS app for Netlify deployment...
echo.

cd /d C:\Users\Administrator\Desktop\chatbot_basic\client

echo Setting production environment variables...
echo REACT_APP_API_URL=https://chatbot-backend-url.com/api > .env.production.local
echo GENERATE_SOURCEMAP=false >> .env.production.local

echo Building React application...
call npm run build

echo.
echo Build completed! The files are ready in the 'build' folder.
echo.
echo To deploy to Netlify:
echo 1. Create a new site on Netlify (https://app.netlify.com/start)
echo 2. Choose "Deploy manually" option
echo 3. Drag and drop the 'build' folder from:
echo    C:\Users\Administrator\Desktop\chatbot_basic\client\build
echo.
echo Note: To use from mobile, you'll need to:
echo 1. Deploy a backend service (to a hosting like Heroku or similar)
echo 2. Update REACT_APP_API_URL in .env.production.local with your backend URL
echo 3. Rebuild and redeploy to Netlify

pause 