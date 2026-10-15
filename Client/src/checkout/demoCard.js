// Never send card input to a server or persist it. Only clearly marked sample cards are accepted.
export const DEMO_CARDS = ['4242424242424242', '5555555555554444'];
export const formatDemoCard = (value = '') => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');
export const formatDemoExpiry = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};
export const demoCardValid = (card) =>
  DEMO_CARDS.includes(String(card.number).replace(/\D/g, '')) &&
  /^[\p{L} .'-]{2,70}$/u.test(String(card.holder).trim()) &&
  card.expiry === '12/30' && card.cvv === '123';
export const SAMPLE_CARD = { holder: 'DEMO CUSTOMER', number: '4242 4242 4242 4242', expiry: '12/30', cvv: '123' };
