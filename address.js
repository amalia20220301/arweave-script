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
  console.log(Buffer.from(b64UrlToBuffer(owner)).toString('hex'), 'owner buffer');
  // return bufferTob64Url(
  //   // await crypto.createHash(b64UrlToBuffer(owner))
  //   await crypto
  //     .createHash('sha256')
  //     .update(b64UrlToBuffer(owner))
  //     .digest()
  // );
}

// f0db15b7fe61e1b5068997bd1d742098b74533a014b361b4e8721b2e5cda5307991f24ba622c091f801c1e89283bb7639945c8a3d3fbfcdcde9c7943d1dbb94cf415e19c41b5aa69e9e662358020311a04eb5c60b3057869d9e2c9e846b2185ea39c00a71ef9be3ef7800543bac447bd04a8bd5d3dfda93a6a29bf259307b2b1a852ad539ec5ab2751b63b98ac43954c9fa38402fee61890100eb93fdb74bc623fcae938172d74e172c7e82a696e6614cf4ff863b98e5a4a70434e9ef1d2d797890e06cdd3d09841de01d5f02f59c86288b23bcf7298c87adab1c42afdeef5c964b2cf9687653b8862dafcd499090731dec31c41f8d7dece60d68665aac8a745


console.log('------p---------')
console.log(ownerToAddress(key.p))
console.log('---------------')
// b890ebda82257de0e2489e043937d9da806d1c108e52e32166ccaae08d089c179e56adc29affc7d9456b462fab8baed31504811b5975c7f1738836abd3f753fd6b2a60938b4d73003426f681e61af040699eb47fd496cc7545a4c1866077ae6f5a559ad6e4da93fcf952d33c2a002e49f7e00437fea19c6ad38e03059b9dcc58b789b274cc8c5c47d5bb6c9f9cbd96f2d3c0db48005a07857132eacdc448f2a7282fb6d8895af3d1f9b8aab43f19da57b21de48688f2538a71553a73cb49cdbfafeedcdc7db1c21d3fc1a42eadb6909fd6975e904e246b8e2dbd132a01c632e74c3513dfdb3f795287cb9d6e6a4982e505b6512674bd70c2df655cc5931588bd
console.log('------q---------')
console.log(ownerToAddress(key.q))
console.log('---------------')

async function generateAddress() {
  /***
   * 
  */
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
// ownerToAddress(key.p).then(console.log)
// ownerToAddress(key.q).then(console.log)
module.exports={
  b64UrlToBuffer
}