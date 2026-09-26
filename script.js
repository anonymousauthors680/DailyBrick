const hero = document.querySelector('.hero');
const video = document.querySelector('#demo-video');
const playPrompt = document.querySelector('#play-prompt');
const soundToggle = document.querySelector('#sound-toggle');
const volumeControl = document.querySelector('#volume-control');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

video.muted = true;
video.defaultMuted = true;
function setVolume(value) {
  // Some mobile browsers leave volume control to the device buttons.
  try { video.volume = value; } catch (_) { /* Keep playback available. */ }
}
setVolume(Number(volumeControl.value) / 100);

function updateSoundButton() {
  const on = !video.muted && video.volume > 0;
  soundToggle.textContent = on ? 'Sound on' : 'Sound off';
  soundToggle.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
  soundToggle.setAttribute('aria-pressed', String(on));
}

function muteOnScroll() {
  const scrolled = window.scrollY > 0;
  document.body.classList.toggle('scrolled-away', scrolled);
  if (scrolled && !video.muted) {
    video.muted = true;
    updateSoundButton();
  }
}

function updateHero() {
  document.body.classList.toggle('has-scrolled', window.scrollY > 0);
  muteOnScroll();
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

soundToggle.addEventListener('click', () => {
  if (window.scrollY > 0) return;
  if (video.volume === 0) {
    volumeControl.value = '18';
    setVolume(0.18);
  }
  video.muted = !video.muted;
  updateSoundButton();
  if (!video.muted) video.play().catch(showPlayPrompt);
});

volumeControl.addEventListener('input', () => {
  setVolume(Number(volumeControl.value) / 100);
  if (window.scrollY === 0) video.muted = video.volume === 0;
  updateSoundButton();
  if (!video.muted) video.play().catch(showPlayPrompt);
});

function showPlayPrompt() {
  playPrompt.hidden = false;
}

video.addEventListener('playing', () => { playPrompt.hidden = true; });
video.addEventListener('error', showPlayPrompt);
// A stalled download is buffering, not evidence that autoplay was blocked.
playPrompt.addEventListener('click', () => {
  if (video.error) video.load();
  if (window.scrollY === 0) {
    setVolume(Number(volumeControl.value) / 100 || 0.18);
    video.muted = false;
    updateSoundButton();
  }
  video.play().catch(showPlayPrompt);
});

video.addEventListener('canplay', () => {
  if (video.paused && video.muted) video.play().catch(showPlayPrompt);
});

// Mobile data-saving and battery settings can block autoplay, even when muted.
video.play().catch(showPlayPrompt);
