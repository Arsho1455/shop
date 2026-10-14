export function normalizeEmail(input) {
  return typeof input === 'string' ? input.trim().toLowerCase() : '';
}
export function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function validName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 60;
}
export function validPassword(password) {
  return typeof password === 'string' && password.length >= 8 && Buffer.byteLength(password, 'utf8') <= 72;
}
