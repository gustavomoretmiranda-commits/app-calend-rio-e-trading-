import bcrypt from "bcryptjs";

export async function verifyCredentials(username, password) {
  const expectedUser = process.env.AUTH_USERNAME;
  const hashB64 = process.env.AUTH_PASSWORD_HASH_B64;

  if (!expectedUser || !hashB64) {
    throw new Error(
      "AUTH_USERNAME / AUTH_PASSWORD_HASH_B64 não configurados. Veja o README para gerar suas credenciais."
    );
  }

  if (username !== expectedUser) return false;

  const expectedHash = Buffer.from(hashB64, "base64").toString("utf8");
  return bcrypt.compare(password, expectedHash);
}
