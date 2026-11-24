export function swiperInit() {

    console.log("running swiper.js");

    // Init all Swipers
    const swipersList = document.querySelectorAll('.swiper');

    if (swipersList.length > 0) {

        const swiperInstances = [];

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

        // update() lives on the Swiper instance, not the DOM element
        window.addEventListener('resize', () => {
            swiperInstances.forEach((instance) => {
                instance.update();
            });
        });


    }

    console.log("running swiperInit()");

}