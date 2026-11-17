// Build-time setup: download the official xray-core Linux binary and make it executable.
// Runs once per clean build (npm run setup). Skips if ./xray already exists.
const fs = require('fs');
const https = require('https');
const path = require('path');
const AdmZip = require('adm-zip');

const VERSION = 'v26.11.9';
const URL = `https://github.com/XTLS/Xray-core/releases/download/${VERSION}/Xray-linux-64.zip`;
const ZIP = path.join(__dirname, 'xray.zip');
const BIN = path.join(__dirname, 'xray');

if (fs.existsSync(BIN)) {
  console.log('xray already present, skipping download');
  process.exit(0);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'abasthan-node-setup' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('download failed, HTTP ' + res.statusCode));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

(async () => {
  console.log('downloading', URL);
  await download(URL, ZIP);
  console.log('extracting xray binary...');
  new AdmZip(ZIP).extractEntryTo('xray', __dirname, false, true);
  fs.chmodSync(BIN, 0o755);
  fs.unlinkSync(ZIP);
  console.log('xray ready:', fs.statSync(BIN).size, 'bytes');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
