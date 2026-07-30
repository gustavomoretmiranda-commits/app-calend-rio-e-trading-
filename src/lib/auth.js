import { verifyUserCredentials } from "@/lib/models/users";

export async function verifyCredentials(username, password) {
  return verifyUserCredentials(username, password);
}
