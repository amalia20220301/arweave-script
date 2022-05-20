import 'dotenv/config'
import {getKeyPairFromMnemonic} from 'human-crypto-keys';
import Arweave from 'arweave';
import constants from 'constants';
import fs from 'fs';

const publicExponent = new Uint8Array([0x01, 0x00, 0x01]);
const hashAlgorithm = "SHA-256";
const modulusLength = 4096;
const keyFile = fs.readFileSync('./key.kidney.json');
const key = JSON.parse(keyFile);
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});


async function signTransaction() {
    let transaction = await arweave.createTransaction({
        target: '1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY',
        quantity: arweave.ar.arToWinston('10.5')
    }, key);
    console.log('------transaction before sign---------')
    console.log(transaction)
    console.log('---------------')
    await arweave.transactions.sign(transaction, key);
    console.log('-----transaction after sign----------')
    console.log(transaction)
    console.log('---------------')
    let result = await arweave.transactions.verify(transaction);
    console.log('-------transaction verify--------')
    console.log(result)
    console.log('---------------')
}
signTransaction().then(console.log);

async function signMessage() {
    var data = fromHexString("ba279c839f2d27436b43f38eaea748c074c9883b93ff40673f8bf3377c7458e42e6f18c132047b4ebe99064b03d24175");
    var signature = crypto
        .createSign('sha256')
        .update(data)
        .sign({
            key: Arweave.crypto.jwkToPem(key),
            padding: constants.RSA_PKCS1_PSS_PADDING,
            saltLength: undefined,
        })
    console.log('--------signMessage-------')
    console.log(signature)
    console.log(Buffer.from(signature).toString('hex'))
    console.log('---------------')
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

// generateKeyPair().then(console.log)

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

