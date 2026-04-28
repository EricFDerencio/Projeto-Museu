param(
  [string]$Url = 'http://localhost:4200/'
)

$ErrorActionPreference = 'Stop'

function Test-PortOpen {
  param(
    [int]$Port,
    [string]$Host = '127.0.0.1'
  )

  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $async = $client.BeginConnect($Host, $Port, $null, $null)
    $connected = $async.AsyncWaitHandle.WaitOne(700)

    if ($connected -and $client.Connected) {
      $client.EndConnect($async)
      $client.Close()
      return $true
    }

    $client.Close()
    return $false
  }
  catch {
    return $false
  }
}

function Open-App {
  param([string]$TargetUrl)
  Start-Process $TargetUrl | Out-Null
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir '..\\..')
Set-Location $projectRoot

if (-not (Test-Path 'package.json')) {
  Write-Host 'package.json nao encontrado. Execute este script dentro do projeto.' -ForegroundColor Red
  exit 1
}

if (-not (Get-Command 'npm.cmd' -ErrorAction SilentlyContinue)) {
  Write-Host 'npm nao encontrado no PATH. Instale o Node.js para continuar.' -ForegroundColor Red
  exit 1
}

$frontendUp = Test-PortOpen -Port 4200
$apiUp = Test-PortOpen -Port 3000

if ($frontendUp -and $apiUp) {
  Write-Host 'Aplicacao ja esta em execucao. Abrindo navegador...'
  Open-App -TargetUrl $Url
  exit 0
}

Write-Host 'Iniciando API + frontend...'
Start-Process -FilePath 'npm.cmd' -ArgumentList 'run', 'dev' -WorkingDirectory $projectRoot | Out-Null

$maxWaitSeconds = 90
for ($i = 0; $i -lt $maxWaitSeconds; $i++) {
  if (Test-PortOpen -Port 4200) {
    Write-Host 'Frontend pronto. Abrindo navegador...'
    Open-App -TargetUrl $Url
    exit 0
  }

  Start-Sleep -Seconds 1
}

Write-Host 'A aplicacao iniciou, mas o frontend nao respondeu em 90s. Verifique o terminal do npm.' -ForegroundColor Yellow
exit 2