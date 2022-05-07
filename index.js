require('dotenv').config()
const { getKeyFromMnemonic } = require('arweave-mnemonic-keys');
const Blockweave = require('blockweave').default;
const blockweave = new Blockweave({ url: 'https://arweave.net' });

const key = require('./key.json');

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
generateAddress().then(console.log)
