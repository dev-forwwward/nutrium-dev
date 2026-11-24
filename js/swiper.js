export function swiperInit() {

    console.log("running swiper.js");

    // Init all Swipers - DEFAULT
    const swipersList = document.querySelectorAll('.swiper:not(.animated-row)');
    let swiperInstances = [];

    if (swipersList.length > 0) {

        swipersList.forEach((swiper) => {
            // Controls can sit inside .swiper or beside it in the same wrapper
            const scope = swiper.parentElement;
            const findControl = (selector) =>
                swiper.querySelector(selector) || scope.querySelector(selector);

            const swiperPagination = findControl('.swiper-pagination');
            const swiperNext = findControl('.swiper-button-next');
            const swiperPrevious = findControl('.swiper-button-prev');


            const swiperEl = new Swiper(swiper, {
                slidesPerView: 1.25,
                spaceBetween: 16,
                direction: 'horizontal',
                loop: false,
                autoWidth: true,
                // speed: 1000,

                // freeMode: true,
                // freeModeMomentum: false,
                allowTouchMove: true,
                breakpoints: {
                    // for screens 500px wide and up
                    500: {
                        slidesPerView: 2.25,
                    },
                    // for screens 768px wide and up
                    768: {
                        slidesPerView: 3.25,
                    }
                },
                pagination: {
                    el: swiperPagination,
                },
                navigation: {
                    nextEl: swiperNext,
                    prevEl: swiperPrevious,
                },
            });

            swiperInstances.push(swiperEl);
        });

    }

    // ANIMATED Swiper Instances
    const animeSwipersList = document.querySelectorAll('.swiper.animated-row');

    // Continuous, never-ending carousel (marquee). Needs the Swiper bundle (Autoplay module)
    // and `linear` easing on the wrapper (see .animated-row in css/styles.css).
    if (animeSwipersList.length > 0) {

        animeSwipersList.forEach((swiper) => {
            // Controls can sit inside .swiper or beside it in the same wrapper
            const scope = swiper.parentElement;
            const findControl = (selector) =>
                swiper.querySelector(selector) || scope.querySelector(selector);

            const swiperPagination = findControl('.swiper-pagination');

            const swiperEl = new Swiper(swiper, {
                slidesPerView: 1.25,
                spaceBetween: 16,
                direction: 'horizontal',
                loop: true,
                // freeMode: true,
                // centeredSlides: true,
                // loopAdditionalSlides: 4,   // extra clones so the loop never shows a gap
                speed: 7000,               // ms per slide step: higher = slower scroll
                // allowTouchMove: true,     // dragging would interrupt the continuous motion
                autoplay: {
                    delay: 0,              // no pause between steps = constant movement
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                },
                pagination: {
                    el: swiperPagination,
                },
                breakpoints: {
                    // for screens 500px wide and up
                    500: {
                        slidesPerView: 2.25,
                    },
                    // for screens 768px wide and up
                    768: {
                        slidesPerView: 3.25,
                    }
                },
            });

            swiperInstances.push(swiperEl);
        });

        // update() lives on the Swiper instance, not the DOM element
        window.addEventListener('resize', () => {
            swiperInstances.forEach((instance) => {
                instance.update();
            });
        });
    }

    console.log("running swiperInit()");

}