import { useEffect } from 'react';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function useCinematicMotion(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanup = () => {};

    const setup = () => {
      cleanup();
      if (preference.matches || !('IntersectionObserver' in window)) return;
      const hero = root.querySelector('.ph-hero');
      const story = root.querySelector('.ph-story');
      let frame = 0;
      let hoveredCard = null;
      let sceneX = 0;
      let sceneY = 0;
      const paint = () => {
        frame = 0;
        const heroRect = hero.getBoundingClientRect();
        const progress = clamp(-heroRect.top / heroRect.height);
        hero.style.setProperty('--hero-progress', progress.toFixed(3));
        hero.style.setProperty('--scene-progress', progress.toFixed(3));
        hero.style.setProperty('--scene-x', sceneX.toFixed(3));
        hero.style.setProperty('--scene-y', sceneY.toFixed(3));
        if (story) {
          const rect = story.getBoundingClientRect();
          const storyProgress = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
          story.style.setProperty('--story-progress', storyProgress.toFixed(3));
          story.style.setProperty('--scene-progress', storyProgress.toFixed(3));
          story.dataset.step = String(Math.min(2, Math.floor(storyProgress * 3)));
        }
      };
      const requestPaint = () => { if (!frame) frame = requestAnimationFrame(paint); };
      const resetCard = () => {
        if (hoveredCard) {
          hoveredCard.style.setProperty('--card-x', '0deg');
          hoveredCard.style.setProperty('--card-y', '0deg');
          hoveredCard = null;
        }
      };
      const onPointer = (event) => {
        if (event.pointerType === 'touch') return;
        const rect = hero.getBoundingClientRect();
        sceneX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
        sceneY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
        const card = event.target.closest('.ph-card');
        if (card !== hoveredCard) resetCard();
        if (card) {
          hoveredCard = card;
          const bounds = card.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          card.style.setProperty('--card-x', `${((.5 - y) * 5).toFixed(2)}deg`);
          card.style.setProperty('--card-y', `${((x - .5) * 5).toFixed(2)}deg`);
          card.style.setProperty('--pointer-x', `${x * 100}%`);
          card.style.setProperty('--pointer-y', `${y * 100}%`);
        }
        requestPaint();
      };
      const onLeave = () => { sceneX = 0; sceneY = 0; resetCard(); requestPaint(); };
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }, { threshold: .08 });
      const observeReveals = () => root.querySelectorAll('.ph-reveal:not(.is-revealed)').forEach((el) => observer.observe(el));
      observeReveals();
      const additions = new MutationObserver(observeReveals);
      additions.observe(root, { childList: true, subtree: true });
      root.classList.add('motion-ready');
      window.addEventListener('scroll', requestPaint, { passive: true });
      window.addEventListener('resize', requestPaint, { passive: true });
      root.addEventListener('pointermove', onPointer, { passive: true });
      root.addEventListener('pointerleave', onLeave);
      paint();
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        additions.disconnect();
        root.classList.remove('motion-ready');
        hero.style.removeProperty('--hero-progress');
        hero.style.removeProperty('--scene-progress');
        hero.style.removeProperty('--scene-x');
        hero.style.removeProperty('--scene-y');
        if (story) {
          story.style.removeProperty('--story-progress');
          story.style.removeProperty('--scene-progress');
          delete story.dataset.step;
        }
        resetCard();
        window.removeEventListener('scroll', requestPaint);
        window.removeEventListener('resize', requestPaint);
        root.removeEventListener('pointermove', onPointer);
        root.removeEventListener('pointerleave', onLeave);
      };
    };
    setup();
    preference.addEventListener('change', setup);
    return () => { cleanup(); preference.removeEventListener('change', setup); };
  }, [rootRef]);
}
