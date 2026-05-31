import { existsSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';

const containerName = 'learning-center-sqlserver';
const saPassword = 'LearningCenter123_';
const databaseName = 'learning_center';
const dockerDesktop = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
const sqlServerImage = 'mcr.microsoft.com/mssql/server:2022-latest';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe']
  });
}

function isDockerReady() {
  try {
    run('docker', ['info']);
    return true;
  } catch {
    return false;
  }
}

async function waitForDocker() {
  if (isDockerReady()) {
    return;
  }

  if (!existsSync(dockerDesktop)) {
    throw new Error(`Docker Desktop not found at: ${dockerDesktop}`);
  }

  console.log('Docker Desktop is not running. Starting Docker Desktop...');
  const child = spawn(dockerDesktop, {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  for (let i = 0; i < 90; i += 1) {
    await sleep(2000);
    if (isDockerReady()) {
      return;
    }
  }

  throw new Error('Docker daemon did not become ready in time. Open Docker Desktop manually, then run npm run db:start again.');
}

function containerExists() {
  const names = run('docker', ['ps', '-a', '--format', '{{.Names}}']);
  return names.split(/\r?\n/).includes(containerName);
}

function execSql(query) {
  const baseArgs = ['-S', 'localhost', '-U', 'sa', '-P', saPassword, '-Q', query];
  const attempts = [
    ['/opt/mssql-tools18/bin/sqlcmd', ...baseArgs.slice(0, 6), '-C', ...baseArgs.slice(6)],
    ['/opt/mssql-tools/bin/sqlcmd', ...baseArgs]
  ];

  let lastError;
  for (const args of attempts) {
    try {
      return run('docker', ['exec', containerName, ...args]);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function waitForSqlServer() {
  for (let i = 0; i < 120; i += 1) {
    await sleep(2000);
    try {
      execSql('SELECT 1');
      return;
    } catch {
      // SQL Server is still starting.
    }
  }
  throw new Error('SQL Server container did not become ready in time.');
}

await waitForDocker();

if (!containerExists()) {
  console.log(`Creating SQL Server container: ${containerName}`);
  run(
    'docker',
    [
      'run',
      '-d',
      '--name',
      containerName,
      '-e',
      'ACCEPT_EULA=Y',
      '-e',
      `MSSQL_SA_PASSWORD=${saPassword}`,
      '-e',
      'MSSQL_PID=Developer',
      '-p',
      '11433:1433',
      sqlServerImage
    ],
    { stdio: 'inherit' }
  );
} else {
  console.log(`Starting SQL Server container: ${containerName}`);
  try {
    run('docker', ['start', containerName], { stdio: 'inherit' });
  } catch (error) {
    const message = String(error.stderr ?? error.message ?? '');
    if (!message.includes('is already running')) {
      throw error;
    }
  }
}

await waitForSqlServer();

execSql(`IF DB_ID(N'${databaseName}') IS NULL BEGIN CREATE DATABASE [${databaseName}]; END`);

console.log('SQL Server is ready at localhost:11433');
console.log(`Database '${databaseName}' is available.`);
run('docker', ['ps', '--filter', `name=${containerName}`, '--format', 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'], {
  stdio: 'inherit'
});
