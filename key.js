require('dotenv').config()
const {subtle} = require('node:crypto').webcrypto;
const publicExponent = new Uint8Array([0x01, 0x00, 0x01]);
const hashAlgorithm = "SHA-256";
const modulusLength = 4096;
const forge = require('node-forge')
const HmacDrgb = require('hmac-drbg')
const hash = require('hash.js');
const pify = require('pify');
const key = require('./key.kidney.json');
const crypto = require("libp2p-crypto");
const {getKeyPairFromMnemonic} = require('human-crypto-keys');
const B64js = require('base64-js')


function b64UrlDecode(b64UrlString) {
    b64UrlString = b64UrlString.replace(/\-/g, "+").replace(/\_/g, "/");
    let padding;
    b64UrlString.length % 4 == 0
        ? (padding = 0)
        : (padding = 4 - (b64UrlString.length % 4));
    return b64UrlString.concat("=".repeat(padding));
}


function b64UrlToBuffer(b64UrlString) {
    return new Uint8Array(B64js.toByteArray(b64UrlDecode(b64UrlString)));
}

async function generateRSAKey() {
    const rsaKey = await subtle.generateKey({
        name: 'RSA-PSS',
        modulusLength,
        publicExponent,
        hash: {name: hashAlgorithm},
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
        {id: "rsa", modulusLength: 2048},
        {privateKeyFormat: "pkcs8-pem"}
    );
    console.log("🚀 ~ file: key.js ~ line 44 ~ generateKeyPair ~ keyPair", keyPair.privateKey)

}

generateKeyPair().then(console.log)

async function test() {
    // const keypair = await pify(forge.pki.rsa.generateKeyPair)(modulusLength, publicExponent, {
    //   prng: createForgePrng(process.env.SEED)
    // })
    // console.log("🚀 ~ file: key.js ~ line 46 ~ keypair", keypair)

    const parseForgePrivateKey = (privateKey) => {
        const {n, e, d, p, q, dP, dQ, qInv} = privateKey;

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
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        true,
        ["sign"] //"verify" for public key import, "sign" for private key imports
    ).catch(console.log)
    console.log("🚀 ~ file: key.js ~ line 94 ~ privateKey", privateKey)
    let importedKey = await crypto.keys.import(privateKey, "");
    console.log("🚀 ~ file: key.js ~ line 94 ~ importedKey", importedKey)
}

