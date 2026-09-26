const hero = document.querySelector('.hero');
const video = document.querySelector('#demo-video');
const playPrompt = document.querySelector('#play-prompt');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateHero() {
  if (reduceMotion.matches) {
    document.documentElement.style.setProperty('--reveal', '1');
    document.documentElement.style.setProperty('--rise', '1');
    document.documentElement.style.setProperty('--slide', '0');
    return;
  }
  const distance = Math.max(1, hero.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance));
  // Raise the project title, reveal the following text, then slide the full-size video away.
  const rise = Math.min(1, progress / 0.38);
  const reveal = Math.min(1, Math.max(0, (progress - 0.12) / 0.22));
  const slide = Math.min(1, Math.max(0, (progress - 0.55) / 0.45));
  document.documentElement.style.setProperty('--reveal', reveal.toFixed(3));
  document.documentElement.style.setProperty('--rise', rise.toFixed(3));
  document.documentElement.style.setProperty('--slide', slide.toFixed(3));
}

let frame = 0;
window.addEventListener('scroll', () => {
  if (!frame) frame = requestAnimationFrame(() => { updateHero(); frame = 0; });
}, { passive:true });
window.addEventListener('resize', updateHero);
reduceMotion.addEventListener('change', updateHero);
updateHero();

function showPlayPrompt() {
  playPrompt.hidden = false;
}

video.addEventListener('playing', () => { playPrompt.hidden = true; });
video.addEventListener('error', showPlayPrompt);
video.addEventListener('stalled', showPlayPrompt);
playPrompt.addEventListener('click', () => {
  video.play().catch(showPlayPrompt);
});

// Mobile data-saving and battery settings can block autoplay, even when muted.
video.play().catch(showPlayPrompt);
