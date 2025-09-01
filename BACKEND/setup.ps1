<#
Automated setup for the BACKEND on Windows PowerShell.
- Creates a .venv using py -3 or python
- Installs requirements
- Copies .env.example to .env (if missing) and generates random secrets
- Runs database migrations (init/migrate/upgrade)
- Optionally starts the server

Usage:
  # In the BACKEND folder
  # (Optional) allow scripts in this session only
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

  # Dry-run (prints what it will do)
  ./setup.ps1 -WhatIf

  # Full setup without starting server
  ./setup.ps1

  # Full setup and then start the server
  ./setup.ps1 -Start
#>
[CmdletBinding(SupportsShouldProcess=$true)]
param(
  [switch]$Start
)

$ErrorActionPreference = 'Stop'

function Write-Header($text) {
  Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

# Resolve script directory and ensure we run from BACKEND
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$venvDir = Join-Path $ScriptDir '.venv'
$venvPython = Join-Path $venvDir 'Scripts\python.exe'
$requirements = Join-Path $ScriptDir 'requirements.txt'
$envExample = Join-Path $ScriptDir '.env.example'
$envFile = Join-Path $ScriptDir '.env'
$migrationsDir = Join-Path $ScriptDir 'migrations'
$wsgiPath = Join-Path $ScriptDir 'wsgi.py'

function Get-PythonLauncher {
  if (Get-Command py -ErrorAction SilentlyContinue) { return 'py -3' }
  elseif (Get-Command python -ErrorAction SilentlyContinue) { return 'python' }
  else { return $null }
}

# 1) Create venv if missing
Write-Header 'Checking virtual environment (.venv)'
if (-not (Test-Path $venvPython)) {
  $launcher = Get-PythonLauncher
  if (-not $launcher) {
    Write-Error "No Python launcher found. Install Python 3.10+ from https://www.python.org/downloads/ (check 'Add Python to PATH') and re-run this script."
  }
  if ($PSCmdlet.ShouldProcess($venvDir, 'Create virtual environment')) {
    Write-Host "Creating venv via: $launcher -m venv .venv" -ForegroundColor Yellow
    & powershell -NoProfile -Command "$launcher -m venv "$venvDir"" | Out-Null
  }
}
if (-not (Test-Path $venvPython)) {
  throw "Virtual environment not created. Verify Python is installed and try again."
}
Write-Host "Venv Python: $venvPython" -ForegroundColor Green

# 2) Upgrade pip/setuptools/wheel and install requirements
Write-Header 'Installing dependencies'
if ($PSCmdlet.ShouldProcess('pip', 'Upgrade and install requirements')) {
  & "$venvPython" -m pip install --upgrade pip setuptools wheel
  & "$venvPython" -m pip install -r "$requirements"
}

# 3) Ensure .env exists, copy from example if needed
Write-Header 'Ensuring .env exists'
if (-not (Test-Path $envFile)) {
  if (-not (Test-Path $envExample)) { throw ".env.example not found at $envExample" }
  if ($PSCmdlet.ShouldProcess($envFile, 'Create from .env.example')) {
    Copy-Item $envExample $envFile

    # Generate random secrets
    $secret = [Guid]::NewGuid().ToString('N')
    $jwt = [Guid]::NewGuid().ToString('N')

    (Get-Content $envFile) |
      ForEach-Object {
        $_ -replace '^SECRET_KEY=.*$', "SECRET_KEY=$secret" `
           -replace '^JWT_SECRET_KEY=.*$', "JWT_SECRET_KEY=$jwt"
      } | Set-Content $envFile -Encoding UTF8

    Write-Host "Created .env with generated secrets. Edit $envFile to set DATABASE_URL and HF_API_TOKEN as needed." -ForegroundColor Green
  }
}
else {
  Write-Host ".env already exists. Skipping creation." -ForegroundColor DarkYellow
}

# 4) Set Flask environment variables for this session
$env:FLASK_APP = $wsgiPath
$env:FLASK_DEBUG = '1'

# 5) Run database migrations
Write-Header 'Running database migrations'
if (-not (Test-Path $migrationsDir)) {
  if ($PSCmdlet.ShouldProcess('flask db init', 'Initialize migrations')) {
    & "$venvPython" -m flask db init
  }
}
if ($PSCmdlet.ShouldProcess('flask db migrate', 'Generate migration')) {
  & "$venvPython" -m flask db migrate -m "init"
}
if ($PSCmdlet.ShouldProcess('flask db upgrade', 'Apply migration')) {
  & "$venvPython" -m flask db upgrade
}

# 6) Optionally start the server
if ($Start) {
  Write-Header 'Starting development server'
  Write-Host "Open http://127.0.0.1:5000/api/health" -ForegroundColor Green
  & "$venvPython" "$wsgiPath"
}
else {
  Write-Host "Setup complete. To start the server: `n  $(& { "$venvPython" }) $wsgiPath" -ForegroundColor Green
}
