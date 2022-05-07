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
(async function () {
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

  const privateCryptoKey = await subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-PSS',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  )

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
  const seed = Buffer.from(process.env.SEED, 'hex')
  console.log("🚀 ~ file: key.js ~ line 51 ~ seed", seed)

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

  subtle.importKey(
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
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ["verify"] //"verify" for public key import, "sign" for private key imports
  )
    .then(function (privateKey) {
      console.log(parseForgePrivateKey(privateKey));
    })
    .catch(function (err) {
      console.error(err);
    });


})()

