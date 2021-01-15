console.log('Loaded');

const RunCarouselFix = function () {
    // owl-nav
    const sections = document.querySelectorAll('.sect-carou');
    sections.forEach(section => {
        const nav = section.querySelector('.owl-nav');
        const imgs = [...section.querySelectorAll('img')].filter(img => img.hasAttribute('data-src'));
        nav.addEventListener('click', () => {
            imgs.some((el, i, array) => {
                if (el.src === el.getAttribute('data-src')) {
                    const first = array[i + 1];
                    const second = array[i + 2];
                    first && setSrc(first);
                    second && setSrc(second);
                    return el;
                }
            })
        });
    });
    const setSrc = function (el) {
        el.src = el.getAttribute('data-src');
    }
}

RunCarouselFix();