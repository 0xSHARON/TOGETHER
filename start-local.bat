@echo off
setlocal enabledelayedexpansion

title TOGETHER Bot Launcher
echo ===================================================
echo             TOGETHER BOT - LOCAL LAUNCHER
echo ===================================================
echo.

:: 1. Detect Java 17+
set "JAVA_CMD=java"
if exist "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot\bin\java.exe" (
    set "JAVA_CMD=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot\bin\java.exe"
) else if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
) else (
    for /d %%I in ("C:\Program Files\Microsoft\jdk-21*" "C:\Program Files\Eclipse Adoptium\jdk-21*" "C:\Program Files\Java\jdk-21*" "C:\Program Files\Java\jdk-17*") do (
        if exist "%%~I\bin\java.exe" (
            set "JAVA_CMD=%%~I\bin\java.exe"
            goto :java_found
        )
    )
)
:java_found

echo [INFO] Using Java: "!JAVA_CMD!"
"!JAVA_CMD!" -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not working!
    echo Please install Java 17 or Java 21:
    echo https://adoptium.net/temurin/releases/?version=21
    pause
    exit /b 1
)

:: 2. Check Lavalink.jar
set "LAVALINK_JAR="
if exist "%~dp0lavalink\lavalink.jar" set "LAVALINK_JAR=%~dp0lavalink\lavalink.jar"
if exist "%~dp0lavalink\Lavalink.jar" set "LAVALINK_JAR=%~dp0lavalink\Lavalink.jar"

if not defined LAVALINK_JAR (
    echo [ERROR] lavalink.jar not found in the 'lavalink' folder!
    echo Please download Lavalink.jar from:
    echo https://github.com/lavalink-devs/Lavalink/releases/latest
    echo and place it inside: %~dp0lavalink\
    pause
    exit /b 1
)

:: 3. Ensure application.yml is in lavalink folder
if exist "%~dp0application.yml" (
    copy /y "%~dp0application.yml" "%~dp0lavalink\application.yml" >nul
)

:: 4. Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js 20+ from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [1/2] Starting Lavalink server...
start "Lavalink Server" cmd /k "cd /d "%~dp0lavalink" && "!JAVA_CMD!" -jar "!LAVALINK_JAR!""

echo [INFO] Waiting 25 seconds for Lavalink to initialize plugins and connect...
timeout /t 25 /nobreak

echo.
echo [2/2] Starting Discord Music Bot...
start "TOGETHER Bot" cmd /k "cd /d "%~dp0" && node devrock.js"

echo.
echo ===================================================
echo   Both processes are running in separate windows!
echo   Close those windows whenever you wish to stop.
echo ===================================================
echo.
pause
