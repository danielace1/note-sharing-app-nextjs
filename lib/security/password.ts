import { hash, verify } from "@node-rs/argon2";

const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(value: string): Promise<string> {
  return hash(value, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hashValue: string,
  value: string,
): Promise<boolean> {
  return verify(hashValue, value);
}
