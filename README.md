# abasthan-node

VLESS + WebSocket proxy node, built on xray-core, for deployment on a PaaS
web service (listens on `$PORT`, TLS terminated by the platform).

## How it works

- Build step (`npm install && npm run setup`) downloads the official
  xray-core Linux binary from GitHub Releases (v26.11.9).
- Start step (`npm start`) generates `config.json` from environment
  variables and runs xray as a VLESS + WebSocket inbound.

## Environment variables (set in the hosting dashboard)

- `UUID` — VLESS client UUID (required)
- `WS_PATH` — WebSocket path (optional, default `/vless`)
- `PORT` — set by the platform, do not set manually

## Client settings

- Address: `<app-name>.abasthan.app`
- Port: 443
- Protocol: VLESS, transport: ws, path: as set in `WS_PATH`, TLS: on,
  SNI: `<app-name>.abasthan.app`
