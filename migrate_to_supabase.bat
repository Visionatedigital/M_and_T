@echo off
setlocal

echo.
echo ===================================================
echo   Starting M^&T Growth Gateway Database Migration
echo ===================================================
echo.

echo Step 1: Exporting local database 'MandT' to local_db_dump.sql...
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" --clean --if-exists --no-owner --no-privileges -d postgres://postgres:Sundaylover12@localhost:5432/MandT -f local_db_dump.sql

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to export the local database. Please check your PostgreSQL installation and password.
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Importing local_db_dump.sql into Supabase...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -d "postgresql://postgres.xdhdcoepxqnyoahzaoie:S7G0JE9zHzJ4XyaT@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require" -f local_db_dump.sql

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to import data into Supabase.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   Migration completed successfully!
echo ===================================================
echo.
pause
