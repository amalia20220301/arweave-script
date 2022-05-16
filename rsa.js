const forge = require("node-forge");

const seed1 = "a996dc4726424c0e368c898da1a77dba58596340ae3dd222f39ec4625eb1a960"
const seed2 = "a9a6b63507dc2dedfac4afa8a2074c1d58fa97cc04901e9844ab937212567fa5"

async function getDeterministicRsaKey(seed) {
    const rsa = forge.pki.rsa;
    const prng = forge.random.createInstance();
    prng.seedFileSync = () => seed;
    const { privateKey } = await rsa.generateKeyPair({ bits: 4096, workers: 2, prng });
    console.log("seed: ", seed);
    console.log("p: ", privateKey.p);
    console.log("q: ", privateKey.q);
    console.log("-----")
}

// getDeterministicRsaKey(seed1).then(console.log)
// getDeterministicRsaKey(seed2).then(console.log)


const DRBG = require('hmac-drbg');
const hash = require('hash.js');

const d = new DRBG({
    hash: hash.sha256,
    entropy: '0203ed654f7d7fbbb177d467dbfb83c16cd28242e0c75bf609dd6b12c1aec4e487098f68e4c22609a8a4f440397ba17f735ba6c9178dcb6f4e5d31592880646d',
    nonce: null,
    pers: null
});

// console.log(d.generate(256, 'hex'))
// console.log(d.generate(256, 'hex'))


const jose = require('node-jose');
const fs = require('fs');

const args = process.argv.slice(2);

const key = fs.readFileSync(args[0]);
const keystore = jose.JWK.createKeyStore();

var DUMP_PRIVATE_KEY = ('true' == args[1]);

keystore
    .add(key, 'pem')
    .then(function(_) {
        const jwks = keystore.toJSON(DUMP_PRIVATE_KEY);
        console.log(JSON.stringify(jwks, null, 4));
    });