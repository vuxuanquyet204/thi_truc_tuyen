@echo off
REM ============================================================
REM  CodeSpark - All Services Startup Script
REM  Start all microservices with a single command
REM ============================================================

echo ============================================================
echo  CodeSpark - Starting All Services
echo ============================================================

REM Check prerequisites
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found. Please install JDK 17+
    exit /b 1
)

where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Maven not found. Java services may not build.
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    exit /b 1
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker not found. Infrastructure may not start.
)

REM ============================================================
REM  Step 1: Start Infrastructure (Docker)
REM ============================================================
echo.
echo [Step 1] Starting Infrastructure (Docker)...
echo --------------------------------------------------------
cd /d "%~dp0"
docker compose up -d postgres-db redis kafka eureka-server
if %errorlevel% neq 0 (
    echo [WARNING] Docker compose failed. Trying individual containers...
    docker run -d --name postgres-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres postgres:17
    docker run -d --name redis -p 6379:6379 redis:7
    docker run -d --name kafka -p 9092:9092 -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 confluentinc/cp-kafka:latest
)

REM Wait for infrastructure
echo Waiting for PostgreSQL...
timeout /t 10 /nobreak >nul

REM ============================================================
REM  Step 2: Start Java Services (Maven)
REM ============================================================
echo.
echo [Step 2] Starting Java Services...
echo --------------------------------------------------------

REM Start Discovery Service (Eureka)
start /b cmd /c "cd services\discovery-service ^&^& mvn spring-boot:run"
echo [OK] Discovery Service started on port 9999

REM Wait for Eureka
timeout /t 15 /nobreak >nul

REM Start API Gateway
start /b cmd /c "cd services\api-gateway ^&^& mvn spring-boot:run"
echo [OK] API Gateway started on port 8080

REM Wait for Gateway
timeout /t 20 /nobreak >nul

REM Start Java Microservices
start /b cmd /c "cd services\identity-service ^&^& mvn spring-boot:run"
echo [OK] Identity Service started on port 9000

start /b cmd /c "cd services\user-service ^&^& mvn spring-boot:run"
echo [OK] User Service started on port 9010

start /b cmd /c "cd services\profile-service ^&^& mvn spring-boot:run"
echo [OK] Profile Service started on port 9002

start /b cmd /c "cd services\course-service ^&^& mvn spring-boot:run"
echo [OK] Course Service started on port 9001

start /b cmd /c "cd services\exam-service ^&^& mvn spring-boot:run"
echo [OK] Exam Service started on port 9005

start /b cmd /c "cd services\notification-service ^&^& mvn spring-boot:run"
echo [OK] Notification Service started on port 9009

start /b cmd /c "cd services\analytics-service ^&^& mvn spring-boot:run"
echo [OK] Analytics Service started on port 9004

start /b cmd /c "cd services\file-service ^&^& mvn spring-boot:run"
echo [OK] File Service started

REM ============================================================
REM  Step 3: Start Node.js Services
REM ============================================================
echo.
echo [Step 3] Starting Node.js Services...
echo --------------------------------------------------------

cd services

REM Leaderboard Service
start /b cmd /c "cd leaderboard-service ^&^& npm install ^&^& node src/index.js"
echo [OK] Leaderboard Service started on port 9010

REM Token Reward Service
start /b cmd /c "cd token-reward-service ^&^& npm install ^&^& node server.js"
echo [OK] Token Reward Service started on port 3001

REM AI Service
start /b cmd /c "cd ai-service ^&^& npm install ^&^& node src/server.js"
echo [OK] AI Service started on port 3002

REM Multisig Service
start /b cmd /c "cd multisig-service ^&^& npm install ^&^& node src/server.js"
echo [OK] Multisig Service started on port 3003

REM Organization Service
start /b cmd /c "cd organization_service ^&^& npm install ^&^& node server.js"
echo [OK] Organization Service started on port 8008

REM Copyright Service
start /b cmd /c "cd copyright-service ^&^& npm install ^&^& node src/server.js"
echo [OK] Copyright Service started on port 3333

cd ..

REM ============================================================
REM  Step 4: Start Frontend
REM ============================================================
echo.
echo [Step 4] Starting Frontend...
echo --------------------------------------------------------
cd web-frontend
start /b cmd /c "npm install ^&^& npm run dev"
echo [OK] Frontend started on port 4173
cd ..

echo.
echo ============================================================
echo  All services started!
echo ============================================================
echo.
echo  Infrastructure:
echo    - PostgreSQL:     localhost:5432
echo    - Redis:          localhost:6379
echo    - Kafka:          localhost:9092
echo    - Eureka:         localhost:9999
echo.
echo  Java Services:
echo    - API Gateway:    localhost:8080
echo    - Discovery:      localhost:9999
echo    - Identity:      localhost:9000
echo    - User:          localhost:9010
echo    - Profile:        localhost:9002
echo    - Course:         localhost:9001
echo    - Exam:          localhost:9005
echo    - Notification:   localhost:9009
echo    - Analytics:      localhost:9004
echo.
echo  Node.js Services:
echo    - Leaderboard:    localhost:9010
echo    - Token Reward:  localhost:3001
echo    - AI:            localhost:3002
echo    - Multisig:      localhost:3003
echo    - Organization:   localhost:8008
echo    - Copyright:      localhost:3333
echo.
echo  Frontend:
echo    - Web App:        localhost:4173
echo.
echo  Press any key to exit...
pause >nul
