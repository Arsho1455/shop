import React from 'react';

const paths = {
  user: <><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="m3 3 18 18"/><path d="M10.6 6.1c.5-.07.9-.1 1.4-.1 6.5 0 10 6 10 6a16 16 0 0 1-4.1 4.5M6 6.9A16 16 0 0 0 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8"/></>,
  spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m20 19 1 3M18 21h4"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
  edit: <><path d="M12 20h9"/><path d="m16 4 4 4-11 11-5 1 1-5L16 4Z"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  back: <><path d="m12 19-7-7 7-7"/><path d="M5 12h14"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.3-4.8L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.8L20 16"/><path d="M16 16h4v4"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a16 16 0 0 1 0 20M12 2a16 16 0 0 0 0 20"/></>,
};

export default function Icon({ name, size = 20, className = '' }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.spark}</svg>;
}
