const ACCESS_KEY_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generateAccessKey(length = 12): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) => ACCESS_KEY_ALPHABET[value % ACCESS_KEY_ALPHABET.length],
  ).join("");
}
