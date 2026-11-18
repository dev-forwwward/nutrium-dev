
// Hero title "reel": the last word of the h1 rolls vertically to another word (see data-reel-words on the h1).
// Index 0 = resting word, 1 = left button hover, 2 = right button hover.
function initTitleReel(section, buttonLeft, buttonRight) {
    const title = section.querySelector('h1[data-reel-words]');
    if (!title || typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = title.dataset.reelWords.split(',').map(w => w.trim()).filter(Boolean);
    const fullText = title.textContent.trim();
    if (words.length < 2 || !fullText.endsWith(words[0])) return;

    // Rebuild the h1: static text + [window > strip > words]
    const lead = fullText.slice(0, fullText.length - words[0].length);
    title.setAttribute('aria-label', fullText);
    title.textContent = '';
    title.append(document.createTextNode(lead));

    const windowEl = document.createElement('span');
    windowEl.className = 'title-reel_window';
    windowEl.setAttribute('aria-hidden', 'true');
    const strip = document.createElement('span');
    strip.className = 'title-reel_strip';
    words.forEach(w => {
        const el = document.createElement('span');
        el.className = 'title-reel_word';
        el.textContent = w;
        strip.append(el);
    });
    windowEl.append(strip);
    title.append(windowEl);

    const wordEls = Array.from(strip.children);
    const measure = el => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return Math.ceil(range.getBoundingClientRect().width) + 2;
    };

    let current = 0;
    const setWidth = (index, animate) => {
        const width = measure(wordEls[index]);
        if (animate) gsap.to(windowEl, { width, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        else gsap.set(windowEl, { width });
    };
    const show = index => {
        current = index;
        gsap.to(strip, { yPercent: -100 * index / words.length, duration: .75, ease: 'power2.inOut', overwrite: 'auto' });
        setWidth(index, true);
    };

    setWidth(0, false);

    // Keep the window width right when fonts load / the viewport changes
    document.fonts?.ready.then(() => setWidth(current, false));
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => setWidth(current, false), 150);
    });

    // Extra listeners only: the existing hover-left/right reveal logic stays untouched
    [[buttonLeft, 1], [buttonRight, 2]].forEach(([button, index]) => {
        if (!button || index >= words.length) return;
        button.addEventListener('mouseenter', () => show(index));
        button.addEventListener('mouseleave', () => show(0));
    });
}

export function revealsInit() {

    // Simple Hero 'on-but-hover' Reveal
    const simpleHeroSection = document.querySelector('.hero-content-reveal-section');
    if(simpleHeroSection) {
        const buttonLeft = simpleHeroSection.querySelector('.hero-content-reveal-btn-left');
        const buttonRight = simpleHeroSection.querySelector('.hero-content-reveal-btn-right');

        if(buttonLeft) {
            buttonLeft.addEventListener('mouseenter', () => {
                simpleHeroSection.classList.add('hover-left-reveal');
            });
            buttonLeft.addEventListener('mouseleave', () => {
                simpleHeroSection.classList.remove('hover-left-reveal');
            });
        }
        if(buttonRight) {
            buttonRight.addEventListener('mouseenter', () => {
                simpleHeroSection.classList.add('hover-right-reveal');
            });
            buttonRight.addEventListener('mouseleave', () => {
                simpleHeroSection.classList.remove('hover-right-reveal');
            });
        }

        initTitleReel(simpleHeroSection, buttonLeft, buttonRight);
    }
}