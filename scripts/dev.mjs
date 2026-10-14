import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const shell = process.platform === 'win32';
const children = [
  spawn(npm, ['run', 'dev', '-w', 'Server'], { stdio: 'inherit', shell }),
  spawn(npm, ['run', 'dev', '-w', 'Client'], { stdio: 'inherit', shell }),
];
function shutdown() { for (const child of children) if (!child.killed) child.kill(); }
for (const child of children) {
  child.on('error', (error) => { console.error(error); shutdown(); process.exitCode = 1; });
  child.on('exit', (code) => { if (code && !process.exitCode) process.exitCode = code; shutdown(); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
