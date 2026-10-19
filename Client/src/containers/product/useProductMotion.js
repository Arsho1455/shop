import { useEffect } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function useProductMotion(rootRef, productId, ready = true) {
  useEffect(() => {
    const root = rootRef.current;
    if (!ready || !root || typeof window === 'undefined') return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)');
    const canObserve = typeof window.IntersectionObserver === 'function'
      && typeof window.MutationObserver === 'function';
    const observed = new Set();
    let revealObserver;
    let frame = 0;
    let activeTilt = null;
    let pointer = null;
    let updateScroll = false;
    let disposed = false;

    const resetTilt = (element) => {
      if (!element) return;
      ['--pd-rx', '--pd-ry', '--pd-mx', '--pd-my'].forEach((name) => {
        element.style.removeProperty(name);
      });
    };

    const clearMotion = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      updateScroll = false;
      resetTilt(activeTilt);
      activeTilt = null;
      root.querySelectorAll('.pd-tilt').forEach(resetTilt);
      root.style.removeProperty('--pd-scroll');
    };

    const reveal = (element) => {
      element.classList.add('is-visible');
      revealObserver?.unobserve(element);
    };

    const registerReveals = () => {
      root.querySelectorAll('.pd-reveal').forEach((element) => {
        if (reducedMotion?.matches || !revealObserver) {
          reveal(element);
        } else if (!observed.has(element)) {
          observed.add(element);
          if (!element.classList.contains('is-visible')) revealObserver.observe(element);
        }
      });
      // Reviews and related products may be replaced after an async request.
      observed.forEach((element) => {
        if (!root.contains(element)) {
          revealObserver?.unobserve(element);
          observed.delete(element);
        }
      });
    };

    const flush = () => {
      frame = 0;
      if (disposed || reducedMotion?.matches) return;

      if (pointer) {
        const { element, clientX, clientY } = pointer;
        if (root.contains(element)) {
          const rect = element.getBoundingClientRect();
          const x = clamp((clientX - rect.left) / (rect.width || 1), 0, 1);
          const y = clamp((clientY - rect.top) / (rect.height || 1), 0, 1);
          element.style.setProperty('--pd-rx', `${((0.5 - y) * 12).toFixed(2)}deg`);
          element.style.setProperty('--pd-ry', `${((x - 0.5) * 12).toFixed(2)}deg`);
          element.style.setProperty('--pd-mx', `${(x * 100).toFixed(2)}%`);
          element.style.setProperty('--pd-my', `${(y * 100).toFixed(2)}%`);
        } else {
          resetTilt(element);
          activeTilt = null;
        }
        pointer = null;
      }

      if (updateScroll) {
        updateScroll = false;
        const hero = root.querySelector('.shop-product-panel');
        if (hero) {
          const rect = hero.getBoundingClientRect();
          root.style.setProperty('--pd-scroll', clamp(-rect.top / (rect.height || 1), 0, 1).toFixed(4));
        }
      }
    };

    const schedule = () => {
      if (!frame && !disposed && !reducedMotion?.matches) frame = window.requestAnimationFrame(flush);
    };

    const onPointerLeave = () => {
      pointer = null;
      resetTilt(activeTilt);
      activeTilt = null;
    };

    const onPointerMove = (event) => {
      if (reducedMotion?.matches || event.pointerType === 'touch' || finePointer?.matches === false) {
        onPointerLeave();
        return;
      }
      const element = event.target.closest?.('.pd-tilt');
      if (element !== activeTilt) {
        resetTilt(activeTilt);
        activeTilt = element && root.contains(element) ? element : null;
      }
      pointer = activeTilt ? { element: activeTilt, clientX: event.clientX, clientY: event.clientY } : null;
      if (pointer) schedule();
    };

    const onScroll = () => {
      if (reducedMotion?.matches) return;
      updateScroll = true;
      schedule();
    };

    const onFocus = (event) => {
      let element = event.target.closest?.('.pd-reveal');
      while (element && root.contains(element)) {
        reveal(element);
        element = element.parentElement?.closest('.pd-reveal');
      }
    };

    const configureMotion = () => {
      clearMotion();
      revealObserver?.disconnect();
      revealObserver = undefined;
      observed.clear();
      root.classList.remove('pd-motion-ready');

      if (!reducedMotion?.matches) {
        if (canObserve) {
          revealObserver = new window.IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) reveal(entry.target);
            });
          }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
          root.classList.add('pd-motion-ready');
        }
        onScroll();
      }
      registerReveals();
    };

    configureMotion();
    const mutationObserver = typeof window.MutationObserver === 'function'
      ? new window.MutationObserver(registerReveals)
      : null;
    mutationObserver?.observe(root, { childList: true, subtree: true });
    root.addEventListener('pointermove', onPointerMove, { passive: true });
    root.addEventListener('pointerleave', onPointerLeave);
    root.addEventListener('pointercancel', onPointerLeave);
    root.addEventListener('focusin', onFocus);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (reducedMotion?.addEventListener) reducedMotion.addEventListener('change', configureMotion);
    else reducedMotion?.addListener?.(configureMotion);
    if (finePointer?.addEventListener) finePointer.addEventListener('change', onPointerLeave);
    else finePointer?.addListener?.(onPointerLeave);

    return () => {
      disposed = true;
      clearMotion();
      root.classList.remove('pd-motion-ready');
      revealObserver?.disconnect();
      mutationObserver?.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('pointercancel', onPointerLeave);
      root.removeEventListener('focusin', onFocus);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (reducedMotion?.removeEventListener) reducedMotion.removeEventListener('change', configureMotion);
      else reducedMotion?.removeListener?.(configureMotion);
      if (finePointer?.removeEventListener) finePointer.removeEventListener('change', onPointerLeave);
      else finePointer?.removeListener?.(onPointerLeave);
    };
  }, [rootRef, productId, ready]);
}
