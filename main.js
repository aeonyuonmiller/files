/* ═══════════════════════════════════════════════════════
   main.js  —  Lenis + GSAP + Barba
   ═══════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger, SplitText);


/* ── 1. Lenis ───────────────────────────────────────── */
let lenis;

function initLenis() {
    if (lenis) lenis.destroy();
    lenis = new Lenis({
        duration: 1,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    // Re-attach nav listener to the new lenis instance every time
    attachNavListener();
}


/* ── 2. Nav — attached inside initLenis so it's always fresh ── */
function attachNavListener() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    let lastY = 0;
    lenis.on('scroll', ({ scroll }) => {
        const goingDown = scroll > lastY && scroll > 5;
        gsap.to(nav, {
            yPercent: goingDown ? -300 : 0,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: true,
        });
        lastY = scroll;
    });
}



/* ── 3. Active nav link with GSAP animation ─────────── */
function setActiveNav() {
    const links = document.querySelectorAll('nav a');
    const current = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === current || (current === '' && href === 'index.html');

        link.classList.toggle('active', isActive);

        // Animate: active link pops in, inactive fades slightly
        gsap.to(link, {
            opacity: isActive ? 1 : 0.5,
            duration: 0.4,
            ease: 'power2.out',
            delay: isActive ? 0.2 : 0,
        });

        // Animate the underline span scaleX
        const line = link.querySelector('.nav-line');
        if (line) {
            gsap.fromTo(line,
                { scaleX: 0, transformOrigin: 'left center' },
                { scaleX: isActive ? 1 : 0, duration: 0.5, ease: 'power3.in', delay: 0.3 }
            );
        }
    });
}

/* ── 4. Page animations ─────────────────────────────── */
function animatePageIn(container) {
    const tl = gsap.timeline();

    // H1 chars
    const h1 = container.querySelector('.hero-title');
    if (h1) {
        gsap.set(h1, { visibility: 'visible' });
        const split = new SplitText(h1, { type: 'chars', charsClass: 'char' });
        tl.from(split.chars, {
            yPercent: 110, opacity: 0, rotateZ: 4,
            duration: 0.6, stagger: 0.012, ease: 'power3.out',
        }, 0);
    }

    // Slider p lines
    const sliderP = container.querySelector('.slider p.split');
    if (sliderP) {
        gsap.set(sliderP, { visibility: 'visible' });
        const split = new SplitText(sliderP, { type: 'lines', linesClass: 'line' });
        tl.from(split.lines, {
            yPercent: 105, opacity: 0, rotateZ: 3,
            duration: 0.6,
            stagger: {
                amount: .4,
                from: "start",
                ease: "power2.out",
            },
            ease: 'power3.inOut',
        }, '>-0.3');
    }

    // Reel: clipPath reveal per section
    container.querySelectorAll('section.reel').forEach(reel => {
        const imgs = reel.querySelectorAll('img');
        if (!imgs.length) return;
        gsap.fromTo(imgs,
            { clipPath: 'inset(100% 0% 0% 0%)', scale: 0.8, y: "150%" },
            {
                clipPath: 'inset(0% 0% 0% 0%)', scale: 1, y: 0,
                duration: 1.1, ease: 'power4.out', stagger: 0.3,
                scrollTrigger: {
                    trigger: reel,
                    start: 'top 100%',
                    toggleActions: 'play none none reverse',
                },
            }
        );
    });

    // Caption: h2 chars + p lines
    container.querySelectorAll('section.caption').forEach(caption => {
        const h2 = caption.querySelector('h2');
        const p  = caption.querySelector('p');

        if (h2) {
            const split = new SplitText(h2, { type: 'chars', charsClass: 'char' });
            gsap.from(split.chars, {
                yPercent: 110, opacity: 0, rotateZ: 3,
                duration: 0.65, stagger: 0.018, ease: 'power3.out',
                scrollTrigger: {
                    trigger: h2, start: 'top 90%',
                    toggleActions: 'play none none reverse',
                },
            });
        }

        if (p) {
            const split = new SplitText(p, { type: 'lines', linesClass: 'line' });
            gsap.from(split.lines, {
                yPercent: 105, opacity: 0,
                duration: 0.55, stagger: 0.1, ease: 'power2.out',
                scrollTrigger: {
                    trigger: p, start: 'top 90%',
                    toggleActions: 'play none none reverse',
                },
            });
        }
    });

    return tl;
}


/* ── 5. Barba ───────────────────────────────────────── */
barba.init({
    prevent: ({ el }) => el.hasAttribute('data-no-barba'),

    transitions: [{
        name: 'fade',
        // sync: true,

        async leave({ current }) {
            ScrollTrigger.getAll().forEach(st => st.kill());
            await gsap.to(current.container, {
                clipPath: 'inset(0% 0% 100% 0%)', y: -80, duration: 1, background: "#333", ease: 'power3.in',
            });
        },

        async enter({ next }) {
            if (lenis) lenis.scrollTo(0, { immediate: true });
            gsap.set(next.container, { opacity: .5, height: "100vh", position: "fixed" });
            await gsap.to(next.container, {
                opacity: 1, duration: 1.5, ease: 'power3',
            }, "-=6");
            gsap.set(next.container, { height: "auto", position: "relative" });
            // initLenis re-creates lenis AND re-attaches the nav listener
            initLenis();
            animatePageIn(next.container);
            setActiveNav();
            setTimeout(() => ScrollTrigger.refresh(), 80);
        },
    }],

    views: [
        { namespace: 'home' },
        { namespace: 'about' },
    ],
});


/* ── 6. First load ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initLenis(); // also calls attachNavListener
    const container = document.querySelector('[data-barba="container"]');
    if (container) animatePageIn(container);
    setActiveNav();
});