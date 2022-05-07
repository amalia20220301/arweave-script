require('dotenv').config()
const { getKeyFromMnemonic } = require('arweave-mnemonic-keys');
const Blockweave = require('blockweave').default;
const blockweave = new Blockweave({ url: 'https://arweave.net' });
const key = require('./key.kidney.json');
const crypto = require('crypto');
const B64js = require('base64-js')



function stringToBuffer(string) {
  return new TextEncoder().encode(string);
}

function b64UrlDecode(b64UrlString) {
  b64UrlString = b64UrlString.replace(/\-/g, "+").replace(/\_/g, "/");
  let padding;
  b64UrlString.length % 4 == 0
    ? (padding = 0)
    : (padding = 4 - (b64UrlString.length % 4));
  return b64UrlString.concat("=".repeat(padding));
}

function bufferTob64(buffer) {
  return B64js.fromByteArray(new Uint8Array(buffer));
}

function b64UrlEncode(b64UrlString) {
  return b64UrlString
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/\=/g, "");
}

function bufferTob64Url(buffer) {
  return b64UrlEncode(bufferTob64(buffer));
}

function b64UrlToBuffer(b64UrlString) {
  return new Uint8Array(B64js.toByteArray(b64UrlDecode(b64UrlString)));
}


/***
 * https://github.com/ArweaveTeam/arweave-js/blob/3dcf421bfb7d4b69eb2e7714c33db6c1adcad4f3/src/common/lib/crypto/node-driver.ts
 */
async function ownerToAddress(owner) {
  return bufferTob64Url(
    // await crypto.createHash(b64UrlToBuffer(owner))
    await crypto
      .createHash('sha256')
      .update(b64UrlToBuffer(owner))
      .digest()
  );
}

async function generateAddress() {
  const key = await getKeyFromMnemonic(process.env.WORDS)
  console.log("🚀 ~ file: index.js ~ line 10 ~ generateAddress ~ key", key)
  return blockweave.wallets.jwkToAddress(key);
}

async function getBalance() {
  const address = await blockweave.wallets.jwkToAddress(key);
  console.log('---address-------'); console.log('address', address); console.log('-----address-----');
  let winston = await blockweave.wallets.getBalance(address);
  console.log('---winston-------'); console.log('winston', winston); console.log('-----winston-----');
  let ar = blockweave.ar.winstonToAr(winston);
  console.log('---ar-------'); console.log('ar', ar); console.log('-----ar-----');
}
/**
 * kidney gHp3awVQpd6_r7pSzWiobU6hjIJFNEWghiFzl3mcTCU
*/
// generateAddress().then(console.log)

/**
 * kidney gHp3awVQpd6_r7pSzWiobU6hjIJFNEWghiFzl3mcTCU, 与调用generateAddress生成的地址一致
*/
ownerToAddress(key.n).then(console.log)
