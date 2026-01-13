// Scroll Animation Observer
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Track if candy rain has been triggered
let candyRainTriggered = false;

// Observer for candy rain trigger
const candyRainObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !candyRainTriggered) {
            candyRainTriggered = true;
            createChocolateRain();
        }
    });
}, {
    threshold: 0.3
});

// Observe elements on page load
document.addEventListener('DOMContentLoaded', () => {

    // Observe collection section for candy rain trigger
    const collectionSection = document.querySelector('.collection');
    if (collectionSection) {
        candyRainObserver.observe(collectionSection);
    }

    // Observe section titles
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        observer.observe(sectionTitle);
    }

    // Observe chocolate cards with staggered delay
    const chocolateCards = document.querySelectorAll('.chocolate-card');
    chocolateCards.forEach((card, index) => {
        observer.observe(card);
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Observe philosophy section
    const philosophyContent = document.querySelector('.philosophy-content');
    if (philosophyContent) {
        observer.observe(philosophyContent);
    }

    // Smooth scroll for scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const collection = document.querySelector('.collection');
            if (collection) {
                collection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Add hover effect enhancement for cards
    chocolateCards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            this.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        });

        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `translateY(-10px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // Parallax effect for hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');

        if (hero && heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    });

    // Add subtle floating animation to scroll indicator
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        let floatDirection = 1;
        setInterval(() => {
            floatDirection *= -1;
        }, 2000);
    }

    // Console art
    console.log('%c        ', 'font-size: 1px; padding: 50px 100px; background: linear-gradient(135deg, #1a0f0a 0%, #3d2817 100%); border: 2px solid #d4af37;');
    console.log('%c🍫 Af Sparfvén 🍫', 'font-size: 24px; font-weight: bold; color: #d4af37; text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);');
    console.log('%cHandgjord lyxchoklad med passion • Alingsås', 'font-size: 14px; color: #f4e4c1; font-style: italic;');
    console.log('%c        ', 'font-size: 1px; padding: 25px 100px; background: linear-gradient(135deg, #1a0f0a 0%, #3d2817 100%); border: 2px solid #d4af37; border-top: none;');
});

// Smooth reveal on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Add initial opacity for smooth load
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// R key to trigger candy rain (can be used multiple times)
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        createChocolateRain();
    }
});

function createChocolateRain() {
    const chocolates = ['🍫', '🍬', '🍭', '🧁', '🍰'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const chocolate = document.createElement('div');
            chocolate.textContent = chocolates[Math.floor(Math.random() * chocolates.length)];
            chocolate.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}vw;
                font-size: ${Math.random() * 30 + 20}px;
                z-index: 9999;
                pointer-events: none;
                animation: fall ${Math.random() * 3 + 2}s linear forwards;
            `;

            document.body.appendChild(chocolate);

            setTimeout(() => chocolate.remove(), 5000);
        }, i * 100);
    }

    // Add animation if not exists
    if (!document.getElementById('chocolate-rain-style')) {
        const style = document.createElement('style');
        style.id = 'chocolate-rain-style';
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add loading effect
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0';
});
