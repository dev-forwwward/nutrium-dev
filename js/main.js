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

    console.log("Loading mainInit()");

}