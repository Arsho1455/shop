import { normalizeEmail, validEmail, validName } from './validate.js';

export function parseContactMessage(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = normalizeEmail(body?.email);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const website = typeof body?.website === 'string' ? body.website.trim() : '';

  if (!validName(name) || /[\r\n]/.test(name)) {
    return { error: 'Անունը պետք է լինի 2–60 նիշ՝ առանց տողադարձերի։' };
  }
  if (!validEmail(email) || /[\r\n]/.test(email)) {
    return { error: 'Մուտքագրիր վավեր էլ. հասցե։' };
  }
  if (message.length < 5 || message.length > 2000) {
    return { error: 'Հաղորդագրությունը պետք է լինի 5–2000 նիշ։' };
  }
  return { name, email, message, website };
}

export function escapeContactHtml(input) {
  return String(input).replace(/[&<>"']/g, (symbol) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[symbol]);
}
