import jose from "node-jose";
import fs from "fs";
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
