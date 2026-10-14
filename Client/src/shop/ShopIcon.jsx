import React from 'react';

const shapes = {
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />,
  bag: <><path d="M4 8h16l-1 13H5L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
  arrowRight: <><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></>,
  arrowLeft: <><path d="M20 12H4"/><path d="m10 18-6-6 6-6"/></>,
  menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
  close: <><path d="M5 5 19 19M19 5 5 19"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  trash: <><path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v6M14 11v6"/></>,
  star: <path d="m12 2 3.2 6.5 7.1 1-5.2 5 1.2 7L12 18.2l-6.3 3.3 1.2-7-5.2-5 7.1-1L12 2Z"/>,
  check: <path d="m4 12 5 5L20 6"/>,
  truck: <><path d="M3 6h12v11H3zM15 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  shield: <><path d="M12 2 4 5v6c0 5.2 3.2 8.6 8 11 4.8-2.4 8-5.8 8-11V5l-8-3Z"/><path d="m8.5 12 2.4 2.4 4.8-5"/></>,
  return: <><path d="M4 11a8 8 0 1 1 2 6"/><path d="M4 4v7h7"/></>,
  bolt: <path d="m13.5 2-9 12h7L10.5 22l9-12h-7L13.5 2Z"/>,
  sparkle: <><path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z"/></>,
  filter: <><path d="M3 6h18M6 12h12M9 18h6"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  location: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
};

export default function ShopIcon({ name, size = 20, fill = 'none', className = '', strokeWidth = 1.8 }) {
  return <svg aria-hidden="true" className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{shapes[name] || shapes.sparkle}</svg>;
}
