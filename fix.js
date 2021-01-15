console.log('Loaded');

const RunCarouselFix = function () {
    console.log('Carousel fix');
    // owl-nav
    const sections = document.querySelectorAll('.sect-carou');
    sections.forEach(section => {
        const nav = section.querySelector('.owl-nav');
        const imgs = [...section.querySelectorAll('img')].filter(img => img.hasAttribute('data-src'));
        nav.addEventListener('click', () => {
            window.scrollBy(0,1);
            console.log(imgs);
            imgs.some((el, i, array) => {
                if (el.src === el.getAttribute('data-src')) {
                    const zero = array[i];
                    const first = array[i + 1];
                    const second = array[i + 2];
                    const third = array[i + 3];
                    const fourth = array[i + 3];
                    zero && setSrc(zero);
                    first && setSrc(first);
                    second && setSrc(second);
                    third && setSrc(third);
                    fourth && setSrc(fourth);
                    return el;
                }
            })
        });
    });
    const popular = document.querySelector('.popular-in');
    const popularCarousel = popular.querySelector('.owl-carousel');
    const owlStage = popularCarousel.querySelector('.owl-stage');
    [...owlStage.querySelectorAll('img')].forEach(el => {
        if (el.hasAttribute('data-src')) {
            el.src = el.getAttribute('data-src');
        }
    });


    const setSrc = function (el) {
        el.src = el.getAttribute('data-src');
    }
}
window.addEventListener('load', () => {
    setTimeout(RunCarouselFix, 1000);
    console.log('Added timeout');
    console.log('Added scroll by');
});