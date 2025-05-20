import { calculateJwkThumbprint, exportJWK, generateKeyPair } from 'jose';

const ALG = 'RS256';
const KEY_ID_ALG = 'sha256';

void (async () => {
  const { publicKey, privateKey } = await generateKeyPair(ALG, { modulusLength: 2048 });
  const pub_jwk = await exportJWK(publicKey);
  const pri_jwk = await exportJWK(privateKey);
  const kid = await calculateJwkThumbprint(pub_jwk, KEY_ID_ALG);
  console.log('----- publicKeyID -----', `\n${kid}`);
  console.log('----- publicKey -----', `\n${JSON.stringify({ alg: ALG, kid, ...pub_jwk })}`);
  console.log('----- privateKey -----', `\n${JSON.stringify({ alg: ALG, kid, ...pri_jwk })}`);
})();
