import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './experience.css';

const revealTargets = [
  '[data-reveal]', '.ph-contact-heading', '.ph-contact-highlight', '.ph-contact-form-card',
  '.auth-aside', '.auth-card', '.verify-card', '.simple-card',
  '.account-welcome', '.account-stat-card', '.account-sidebar', '.account-settings',
  '.account-list-heading', '.account-shop-empty', '.account-cart-row', '.account-cart-summary',
  '.account-favorite-card', '.checkout-heading', '.checkout-section', '.checkout-summary',
  '.checkout-result-card', '.checkout-order-card', '.shop-empty-state',
  '.adm-page-intro', '.adm-metric', '.adm-card', '.adm-inventory-card', '.adm-toolbar',
].join(',');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function SiteExperience({ children }) {
  const { pathname, hash } = useLocation();
  const rootRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Hash targets are handled by the page after its asynchronous content loads.
  }, [pathname]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)');
    const seen = new Set();
    let observer;
    let frame = 0;
    let pointer;
    let activeTilt;
    let needsProgress = true;
    let disposed = false;

    const resetTilt = (element) => {
      if (!element) return;
      ['--site-rx', '--site-ry', '--site-mx', '--site-my'].forEach((name) => element.style.removeProperty(name));
    };
    const reveal = (element) => {
      element.classList.add('is-in-view');
      observer?.unobserve(element);
    };
    const register = () => {
      root.querySelectorAll(revealTargets).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        element.classList.add('site-reveal');
        if (observer) observer.observe(element);
        else reveal(element);
      });
      seen.forEach((element) => {
        if (!root.contains(element)) { observer?.unobserve(element); seen.delete(element); }
      });
    };
    const paint = () => {
      frame = 0;
      if (disposed) return;
      if (needsProgress) {
        needsProgress = false;
        const available = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current?.style.setProperty('--site-progress', String(available > 0 ? clamp(window.scrollY / available, 0, 1) : 0));
      }
      if (pointer && !preference.matches && root.contains(pointer.element)) {
        const { element, x, y } = pointer;
        const bounds = element.getBoundingClientRect();
        const mx = clamp((x - bounds.left) / (bounds.width || 1), 0, 1);
        const my = clamp((y - bounds.top) / (bounds.height || 1), 0, 1);
        element.style.setProperty('--site-rx', `${((.5 - my) * 7).toFixed(2)}deg`);
        element.style.setProperty('--site-ry', `${((mx - .5) * 7).toFixed(2)}deg`);
        element.style.setProperty('--site-mx', `${(mx * 100).toFixed(2)}%`);
        element.style.setProperty('--site-my', `${(my * 100).toFixed(2)}%`);
      }
      pointer = undefined;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const clearPointer = () => { resetTilt(activeTilt); activeTilt = undefined; pointer = undefined; };
    const onPointer = (event) => {
      if (preference.matches || !pointerPreference.matches || event.pointerType === 'touch') { clearPointer(); return; }
      const target = event.target.closest?.('[data-tilt]');
      if (target !== activeTilt) {
        clearPointer();
        activeTilt = target && root.contains(target) ? target : undefined;
      }
      if (activeTilt) { pointer = { element: activeTilt, x: event.clientX, y: event.clientY }; schedule(); }
    };
    const onScroll = () => { needsProgress = true; schedule(); };
    const onFocus = (event) => {
      let target = event.target.closest?.('.site-reveal');
      while (target && root.contains(target)) { reveal(target); target = target.parentElement?.closest('.site-reveal'); }
    };
    const configure = () => {
      clearPointer();
      root.querySelectorAll('[data-tilt]').forEach(resetTilt);
      observer?.disconnect();
      observer = undefined;
      root.classList.remove('site-motion-ready');
      root.dataset.siteMotion = preference.matches ? 'off' : 'on';
      if (!preference.matches && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => { if (entry.isIntersecting) reveal(entry.target); });
        }, { threshold: .06, rootMargin: '0px 0px -16px 0px' });
        root.classList.add('site-motion-ready');
      }
      seen.clear();
      register();
      onScroll();
    };

    configure();
    const additions = new MutationObserver(register);
    additions.observe(root, { subtree: true, childList: true });
    root.addEventListener('pointermove', onPointer, { passive: true });
    root.addEventListener('pointerleave', clearPointer);
    root.addEventListener('pointercancel', clearPointer);
    root.addEventListener('focusin', onFocus);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    preference.addEventListener('change', configure);
    pointerPreference.addEventListener('change', clearPointer);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearPointer();
      observer?.disconnect();
      additions.disconnect();
      root.classList.remove('site-motion-ready');
      delete root.dataset.siteMotion;
      root.removeEventListener('pointermove', onPointer);
      root.removeEventListener('pointerleave', clearPointer);
      root.removeEventListener('pointercancel', clearPointer);
      root.removeEventListener('focusin', onFocus);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      preference.removeEventListener('change', configure);
      pointerPreference.removeEventListener('change', clearPointer);
    };
  }, [pathname]);

  return <div className="site-experience" ref={rootRef}>
    <div className="site-scroll-progress" ref={progressRef} aria-hidden="true"/>
    <div className="site-route-stage" key={pathname}>{children}</div>
  </div>;
}
