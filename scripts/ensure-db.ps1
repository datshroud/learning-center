$ErrorActionPreference = "Stop"

$containerName = "learning-center-sqlserver"
$saPassword = "LearningCenter123_"
$databaseName = "learning_center"
$dockerDesktop = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
$sqlServerImage = "mcr.microsoft.com/mssql/server:2022-latest"

function Test-DockerReady {
  docker info *> $null
  return $LASTEXITCODE -eq 0
}

function Invoke-SqlServerQuery {
  param([string]$Query)

  $tools = @("/opt/mssql-tools18/bin/sqlcmd", "/opt/mssql-tools/bin/sqlcmd")
  foreach ($tool in $tools) {
    docker exec $containerName $tool -S localhost -U sa -P $saPassword -C -Q $Query *> $null
    if ($LASTEXITCODE -eq 0) {
      return $true
    }

    docker exec $containerName $tool -S localhost -U sa -P $saPassword -Q $Query *> $null
    if ($LASTEXITCODE -eq 0) {
      return $true
    }
  }

  return $false
}

if (-not (Test-DockerReady)) {
  if (-not (Test-Path $dockerDesktop)) {
    throw "Docker Desktop not found at: $dockerDesktop"
  }

  Write-Host "Docker Desktop is not running. Starting Docker Desktop..."
  Start-Process -FilePath $dockerDesktop -WindowStyle Hidden

  $dockerReady = $false
  for ($i = 0; $i -lt 90; $i++) {
    Start-Sleep -Seconds 2
    if (Test-DockerReady) {
      $dockerReady = $true
      break
    }
  }

  if (-not $dockerReady) {
    throw "Docker daemon did not become ready in time. Open Docker Desktop manually, then run npm run db:start again."
  }
}

$containerExists = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $containerName }

if (-not $containerExists) {
  Write-Host "Creating SQL Server container: $containerName"
  docker run -d `
    --name $containerName `
    -e ACCEPT_EULA=Y `
    -e MSSQL_SA_PASSWORD=$saPassword `
    -e MSSQL_PID=Developer `
    -p 11433:1433 `
    $sqlServerImage | Out-Null
} else {
  Write-Host "Starting SQL Server container: $containerName"
  docker start $containerName | Out-Null
}

$sqlServerReady = $false
for ($i = 0; $i -lt 120; $i++) {
  Start-Sleep -Seconds 2
  if (Invoke-SqlServerQuery -Query "SELECT 1") {
    $sqlServerReady = $true
    break
  }
}

if (-not $sqlServerReady) {
  throw "SQL Server container did not become ready in time."
}

Invoke-SqlServerQuery -Query "IF DB_ID(N'$databaseName') IS NULL BEGIN CREATE DATABASE [$databaseName]; END" | Out-Null

Write-Host "SQL Server is ready at localhost:11433"
Write-Host "Database '$databaseName' is available."
docker ps --filter "name=$containerName" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
