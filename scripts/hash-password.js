// Gera o valor para colocar em AUTH_PASSWORD_HASH_B64 no .env.local
// Uso: node scripts/hash-password.js "minhaSenhaForte"
//
// Guardamos o hash bcrypt em base64 porque hashes bcrypt contêm "$",
// e o carregador de .env do Next.js interpreta "$ALGO" como referência
// a outra variável de ambiente, corrompendo o hash se ele for salvo cru.
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.js "minhaSenhaForte"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const b64 = Buffer.from(hash, "utf8").toString("base64");
console.log(b64);
