export function mainInit() {

    // PRELOADER
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        gsap.to('.preloader', {
            opacity: 0,
            delay: .1,
            duration: .5,
            ease: "power2.out",
            onComplete: () => {
                document.querySelector('.preloader').remove();
            }
        });
    }

    // MOUSE FOLLOWER
    // One global .mouse-follower (in Global Styles), position: fixed, so it tracks clientX/Y directly.
    // Any element with .mouse-follower-card triggers it; visibility is handled in CSS via :has().
    const follower = document.querySelector('.mouse-follower');
    const followerCards = document.querySelectorAll('.mouse-follower-card');
    if (follower && followerCards.length && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        gsap.set(follower, { xPercent: -50, yPercent: -50 });
        const xTo = gsap.quickTo(follower, 'x', { duration: 0.4, ease: 'power2.out' });
        const yTo = gsap.quickTo(follower, 'y', { duration: 0.4, ease: 'power2.out' });

        followerCards.forEach(card => {
            // Snap to the pointer on entry so it doesn't glide in from its last position
            card.addEventListener('pointerenter', (e) => {
                xTo(e.clientX, e.clientX);
                yTo(e.clientY, e.clientY);
            });
            card.addEventListener('pointermove', (e) => {
                xTo(e.clientX);
                yTo(e.clientY);
            });
        });
    }

    // Copy link share
    const copyShare = document.querySelectorAll(".copy-to-clipboard");
    copyShare?.forEach(shareBtn => {
        shareBtn.addEventListener("click", function (e) {
            e.preventDefault();
            let tooltip = shareBtn.querySelector(".tooltip");
            tooltip?.classList.add("show");
            setTimeout(() => {
                tooltip?.classList.remove("show");
            }, 1500);
            navigator.clipboard.writeText(location.href);
        });
    });




    // Logos Carousel
    // Duration = distance / SPEED, so the visual
    // speed (px/s) stays constant whatever the width of the content
    const LOGO_CAROUSEL_SPEED = 20; // pixels per second

    function initLogoRow(row, direction) {
        // direction: 1 = moves right (left-right), -1 = moves left (right-left)
        const lists = row.querySelectorAll('.logo3_list');
        if (lists.length < 2) return;

        let tween = null;

        const build = () => {
            tween?.kill();
            gsap.set(lists, { x: 0 });

            // Make sure a single list is at least as wide as the row, otherwise
            // blank space would show while looping. Clone items until it is.
            lists.forEach(list => list.querySelectorAll('[data-logo-clone]').forEach(c => c.remove()));
            const items = Array.from(lists[0].children);
            if (!items.length) return;
            const rowWidth = row.getBoundingClientRect().width;
            let guard = 0;
            while (lists[0].scrollWidth < rowWidth && guard++ < 20) {
                lists.forEach(list => {
                    const originals = Array.from(list.children).filter(c => !c.hasAttribute('data-logo-clone'));
                    originals.forEach(item => {
                        const clone = item.cloneNode(true);
                        clone.setAttribute('data-logo-clone', '');
                        clone.setAttribute('aria-hidden', 'true');
                        list.appendChild(clone);
                    });
                });
            }

            // Distance between the start of list 1 and list 2 (includes any gap between them)
            const distance = lists[1].getBoundingClientRect().left - lists[0].getBoundingClientRect().left;
            if (distance <= 0) return;

            tween = gsap.fromTo(lists,
                { x: direction === 1 ? -distance : 0 },
                {
                    x: direction === 1 ? 0 : -distance,
                    duration: distance / LOGO_CAROUSEL_SPEED,
                    ease: 'none',
                    repeat: -1
                }
            );
        };

        build();

        // Rebuild when the row or list size changes (resize, images/fonts loading, content edits)
        let lastSize = lists[0].scrollWidth + '|' + row.clientWidth;
        let timer;
        new ResizeObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const size = lists[0].scrollWidth + '|' + row.clientWidth;
                if (size === lastSize) return;
                lastSize = size;
                build();
            }, 150);
        }).observe(row);
    }

    const logosCarouselContainers = document.querySelectorAll('.section_logo3');
    logosCarouselContainers.forEach(container => {
        const rowTop = container.querySelector('.logo3_component.top');
        const rowBottom = container.querySelector('.logo3_component.bottom');

        // rowTop loop animation (left-right)
        if (rowTop) initLogoRow(rowTop, 1);
        // rowBottom loop animation (right-left)
        if (rowBottom) initLogoRow(rowBottom, -1);
    });



    // Card flip-through
    // Stack of .card-flip-item inside .card-flip-container.
    const FLIP_DEFAULT_STEP_REM = 4.5; // vertical offset between stacked cards (matches Webflow's .two top)
    const FLIP_HOVER_LIFT_REM = 0.5;   // back cards lift slightly on hover
    const FLIP_TILT = 10;              // degrees, alternating sign per card
    const FLIP_SEGMENT_VH = 0.6;       // scroll length (in viewport heights) for each card to arrive
    const FLIP_HOLD_VH = 0.3;          // extra pinned scroll after the last card, to interact with the stack

    function initCardFlip(container) {
        const items = Array.from(container.querySelectorAll(':scope > .card-flip-item'));
        const total = items.length;
        if (total < 2) return;

        const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stepRem = parseFloat(container.dataset.flipStep) || FLIP_DEFAULT_STEP_REM;
        const stepPx = () => stepRem * remPx();

        // order[slot] = index of the item sitting in that slot (0 = back ... total-1 = front)
        const defaultOrder = () => items.map((_, i) => i);
        let order = defaultOrder();
        let interactive = false; // only after the stack is complete

        const slotOf = index => order.indexOf(index);
        const slotY = index => slotOf(index) * stepPx();

        // Single managed tween per item for y (click/hover), so it never fights the scroll timeline
        const moveTo = (item, y, duration, ease) => {
            item._flipTween?.kill();
            item._flipTween = gsap.to(item, { y, duration: reduceMotion ? 0 : duration, ease, overwrite: false });
        };

        // Normalise positioning so any number of items stacks the same way (overrides the per-item
        // combo classes: first item sets the container height, the rest overlay it).
        const layout = () => {
            items.forEach((item, i) => {
                if (i === 0) gsap.set(item, { position: 'relative', top: 0 });
                else gsap.set(item, { position: 'absolute', top: 0, left: 0, width: '100%' });
            });
            gsap.set(container, { paddingBottom: (total - 1) * stepPx(), position: 'relative' });
        };

        // Apply z-index / cursor / a11y for the current order; optionally set y (not while scroll controls it)
        const place = (mode) => { // mode: 'none' | 'set' | 'animate'
            items.forEach((item, i) => {
                const isFront = slotOf(i) === total - 1;
                gsap.set(item, { zIndex: slotOf(i) + 1, cursor: interactive && !isFront ? 'pointer' : 'default' });
                item.classList.toggle('is-front', isFront);
                item.setAttribute('tabindex', interactive && !isFront ? '0' : '-1');
                item.setAttribute('role', interactive && !isFront ? 'button' : 'group');
                if (mode === 'animate') moveTo(item, slotY(i), 0.5, 'power3.out');
                else if (mode === 'set') { item._flipTween?.kill(); gsap.set(item, { y: slotY(i) }); }
            });
        };

        const bringToFront = index => {
            if (!interactive || slotOf(index) === total - 1) return;
            order = order.filter(i => i !== index).concat(index);
            place('animate');
        };

        items.forEach((item, i) => {
            item.addEventListener('click', () => bringToFront(i));
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    bringToFront(i);
                }
            });
            // Back cards lift a little on hover
            item.addEventListener('mouseenter', () => {
                if (!interactive || slotOf(i) === total - 1) return;
                moveTo(item, slotY(i) - FLIP_HOVER_LIFT_REM * remPx(), 0.3, 'power2.out');
            });
            item.addEventListener('mouseleave', () => {
                if (!interactive) return;
                moveTo(item, slotY(i), 0.3, 'power2.out');
            });
        });

        layout();

        // ----- Scroll reveal -----
        const section = container.closest('section');
        const canScroll = !reduceMotion
            && container.dataset.flipScroll !== 'false'
            && section
            && typeof ScrollTrigger !== 'undefined';

        if (!canScroll) {
            interactive = true;
            place('set');
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => { layout(); place('set'); }, 150);
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        place('none');

        const setStacked = stacked => {
            if (stacked === interactive) return;
            interactive = stacked;
            if (!stacked) {
                // Un-stacking resets any chosen order, the timeline takes over y again
                items.forEach(item => item._flipTween?.kill());
                order = defaultOrder();
            }
            place('none');
        };

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: section,
                start: () => (section.offsetHeight < window.innerHeight ? 'center center' : 'top top'),
                end: () => '+=' + Math.round(window.innerHeight * (total * FLIP_SEGMENT_VH + FLIP_HOLD_VH)),
                pin: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefresh: () => { order = defaultOrder(); place('none'); },
            },
            onUpdate: () => setStacked(tl.time() >= total)
        });

        items.forEach((item, i) => {
            const dir = i % 2 ? FLIP_TILT : -FLIP_TILT;
            tl.fromTo(item,
                { y: () => window.innerHeight + i * stepPx(), rotation: dir },
                { y: () => i * stepPx(), rotation: 0, duration: 1 },
                i // cards arrive one after the other
            );
        });
        // Hold at the end so the stack can be played with while pinned
        tl.to({}, { duration: (FLIP_HOLD_VH / FLIP_SEGMENT_VH) }, total);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { layout(); ScrollTrigger.refresh(); }, 150);
        });
    }

    document.querySelectorAll('.card-flip-container').forEach(initCardFlip);

    console.log("Loading mainInit()");

}