require('dotenv').config()
const { getKeyFromMnemonic } = require('arweave-mnemonic-keys');
const Blockweave = require('blockweave').default;
const blockweave = new Blockweave({ url: 'https://arweave.net' });

async function generateAddress() {
  const key = await getKeyFromMnemonic(process.env.WORDS)
  return blockweave.wallets.jwkToAddress(key);
}

generateAddress().then(console.log)
