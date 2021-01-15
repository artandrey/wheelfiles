console.log('Loaded');

const RunCarouselFix = function () {
    console.log('Carousel fix');
    // owl-nav
    const sections = document.querySelectorAll('.sect-carou');
    sections.forEach(section => {
        const nav = section.querySelector('.owl-nav');
        const items = document.querySelectorAll('.owl-item');
        nav.addEventListener('click', () => {
            setTimeout(() => {
                window.scrollBy(0,0.1);
            }, 200);
            [...items].forEach(item => {
                if (item.classList.contains('active')) {
                    const img = item.querySelector('img')
                    const src = img.getAttribute('data-src');
                    img.src = src;
                }
            });
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
    // console.log('Added timeout');
    // console.log('Added scroll by');
    // console.log('Updated src');
    // console.log('Console out');
    // console.log('Changed scroll');
});