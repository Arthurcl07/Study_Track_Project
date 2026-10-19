@echo off
chcp 65001 >nul
title StudyTrack
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo.
echo  ==============================================
echo     StudyTrack - iniciar o sistema
echo  ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERRO] Node.js nao encontrado. Instale o Node.js 24 LTS.
  goto fim
)
if not exist ".env" (
  echo  [ERRO] Arquivo .env nao encontrado nesta pasta.
  echo         Crie a partir do .env.example - veja o README.
  goto fim
)
if not exist "node_modules" (
  echo  Primeira vez: instalando dependencias, aguarde...
  call npm install
  if errorlevel 1 goto erro
)

echo  Escolha uma opcao:
echo.
echo    1 - Iniciar  (abre rapido; cada tela demora uns segundos na primeira vez)
echo    2 - Modo apresentacao  (prepara tudo antes, ~2 min; depois as telas abrem na hora)
echo    3 - Restaurar os dados de demonstracao e iniciar
echo.
set "opcao=1"
set /p "opcao=  Opcao [1]: "

echo.
echo  Atualizando o banco de dados...
call npx prisma migrate deploy
if errorlevel 1 (
  echo.
  echo  [ERRO] Nao foi possivel acessar o banco. Confira se o PostgreSQL esta ligado.
  goto fim
)

if "%opcao%"=="3" (
  echo  Restaurando os dados de demonstracao...
  call npm run seed
  if errorlevel 1 goto erro
)

echo.
echo  O navegador vai abrir em http://localhost:3000
echo  Logins e senha: arquivo CONTAS-DE-TESTE.txt
echo  Para DESLIGAR o sistema, feche esta janela.
echo.

if "%opcao%"=="2" (
  echo  Preparando o modo apresentacao, aguarde...
  call npm run build
  if errorlevel 1 goto erro
  start "" cmd /c "timeout /t 6 >nul & start http://localhost:3000"
  call npm run start
) else (
  start "" cmd /c "timeout /t 12 >nul & start http://localhost:3000"
  call npm run dev
)
goto fim

:erro
echo.
echo  [ERRO] Algo deu errado. Veja as mensagens acima.

:fim
echo.
pause
