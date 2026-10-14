// Legacy client API base: prefer the same origin on Vercel and local Vite proxy.
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export default API;
