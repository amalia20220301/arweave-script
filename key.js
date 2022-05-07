require('dotenv').config()
const { subtle } = require('node:crypto').webcrypto;
const publicExponent = new Uint8Array([0x01, 0x00, 0x01]);
const hashAlgorithm = "SHA-256";
const modulusLength = 4096;
const forge = require('node-forge')
const HmacDrgb = require('hmac-drbg')
const hash = require('hash.js');
const pify = require('pify');
const key = require('./key.kidney.json');
const crypto = require("libp2p-crypto");
const { getKeyPairFromMnemonic, getKeyPairFromSeed } = require('human-crypto-keys');

async function generateRSAKey() {
  const rsaKey = await subtle.generateKey({
    name: 'RSA-PSS',
    modulusLength,
    publicExponent,
    hash: { name: hashAlgorithm },
  }, true, ['sign', 'verify'])
  const jwk = await subtle.exportKey(
    'jwk',
    rsaKey.privateKey
  )
}
async function generateKeyPair() {
  /**
   * { modulusLength: 4096, publicExponent: 65537, method: 'PRIMEINC' }
   * {modulusLength:e,publicExponent:t,
   * publicKeyEncoding:{type:"spki",format:"pem"},
   * privateKeyEncoding:{type:"pkcs8",format:"pem"}
   *
   * 底层最终调用的是node-forge的
   * pki.rsa.generateKeyPair = function(bits, e, options, callback)
   * bits: 4096
   * e: 65537
   * options:
   */
  let keyPair = await getKeyPairFromMnemonic(
    process.env.WORDS,
    { id: "rsa", modulusLength: 4096 },
    { privateKeyFormat: "pkcs1-pem" }
  );
  console.log("🚀 ~ file: key.js ~ line 82 ~ keyPair", keyPair)
  let importedKey = await crypto.keys.import(keyPair.privateKey, "");
  console.log("🚀 ~ file: key.js ~ line 94 ~ importedKey", importedKey._key)
}

async function generateKeyPairFromSeed() {
  /**
   * pem key pair
  */
  let keyPair = await getKeyPairFromSeed(
    new Uint8Array(Buffer.from(process.env.SEED, 'hex')),
    { id: "rsa", modulusLength: 4096 },
    { privateKeyFormat: "pkcs1-pem" }
  );
  console.log("🚀 ~ file: key.js ~ line 82 ~ keyPair", keyPair)
  let importedKey = await crypto.keys.import(keyPair.privateKey, "");
  console.log("🚀 ~ file: key.js ~ line 94 ~ importedKey", importedKey._key)
}

generateKeyPair().then(console.log)

async function test() {
  const createForgePrng = (seed) => {
    const hmacDrgb = new HmacDrgb({
      hash: hash.sha256,
      entropy: forge.util.binary.hex.encode(seed),
      nonce: null,
      pers: null,
    });

    return {
      getBytesSync: (size) => {
        const bytesArray = hmacDrgb.generate(size);
        const bytes = new Uint8Array(bytesArray);
        return forge.util.binary.raw.encode(bytes);
      },
    };
  };
  // const keypair = await pify(forge.pki.rsa.generateKeyPair)(modulusLength, publicExponent, {
  //   prng: createForgePrng(process.env.SEED)
  // })
  // console.log("🚀 ~ file: key.js ~ line 46 ~ keypair", keypair)

  const parseForgePrivateKey = (privateKey) => {
    const { n, e, d, p, q, dP, dQ, qInv } = privateKey;

    return {
      modulus: new Uint8Array(n.toByteArray()),
      publicExponent: e.intValue(),
      privateExponent: new Uint8Array(d.toByteArray()),
      prime1: new Uint8Array(p.toByteArray()),
      prime2: new Uint8Array(q.toByteArray()),
      exponent1: new Uint8Array(dP.toByteArray()),
      exponent2: new Uint8Array(dQ.toByteArray()),
      coefficient: new Uint8Array(qInv.toByteArray()),
    };
  };

  const privateKey = await subtle.importKey(
    "jwk",
    {
      kty: key.kty,
      e: key.e,
      n: key.n,
      alg: "PS256",
      ext: true,
    },
    {   //these are the algorithm options
      name: "RSA-PSS",
      hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    true,
    ["sign"] //"verify" for public key import, "sign" for private key imports
  ).catch(console.log)
  console.log("🚀 ~ file: key.js ~ line 94 ~ privateKey", privateKey)
  let importedKey = await crypto.keys.import(privateKey, "");
  console.log("🚀 ~ file: key.js ~ line 94 ~ importedKey", importedKey)
}

