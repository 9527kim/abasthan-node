// Start the node: build an xray config from environment variables and run xray.
// Env vars (set in the hosting dashboard, never committed to the repo):
//   PORT     - port to listen on (set by the platform)
//   UUID     - VLESS client UUID (required)
//   WS_PATH  - WebSocket path (optional, default /vless)
// TLS is terminated by the platform at the edge; xray serves plain WebSocket here.
const { spawn } = require('child_process');
const fs = require('fs');

const port = parseInt(process.env.PORT || '3000', 10);
const uuid = process.env.UUID;
const wsPath = process.env.WS_PATH || '/vless';

if (!uuid) {
  console.error('Missing UUID env var');
  process.exit(1);
}

const config = {
  log: { loglevel: 'warning' },
  inbounds: [
    {
      port,
      listen: '0.0.0.0',
      protocol: 'vless',
      settings: { clients: [{ id: uuid }], decryption: 'none' },
      streamSettings: { network: 'ws', wsSettings: { path: wsPath } },
    },
  ],
  outbounds: [{ protocol: 'freedom' }],
};

fs.writeFileSync('config.json', JSON.stringify(config));
console.log(`starting xray: VLESS+WS on 0.0.0.0:${port}${wsPath}`);

const xray = spawn('./xray', ['run', '-c', 'config.json'], { stdio: 'inherit' });

function shutdown(signal) {
  console.log('received', signal, '— stopping xray');
  xray.kill(signal);
  setTimeout(() => process.exit(0), 3000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
xray.on('exit', (code) => {
  console.error('xray exited with code', code);
  process.exit(code || 0);
});
