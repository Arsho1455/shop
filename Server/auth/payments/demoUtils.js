// Demo checkout never accepts or persists payment credentials.
// Keep the browser's sample card fields completely separate from API requests.
export function isSafeDemoCheckoutPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  return Object.keys(payload).every((key) => ['checkoutKey', 'shipping'].includes(key));
}
