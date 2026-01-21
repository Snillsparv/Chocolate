// Loading Screen and Intro Video Handler
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingText = document.querySelector('.loading-text');
    const keyholeContainer = document.querySelector('.keyhole-container');
    const keyholeImage = document.querySelector('.keyhole-image');
    const introVideoContainer = document.querySelector('.intro-video-container');
    const introVideo = document.querySelector('.intro-video');

    let videoReady = false;
    let clicked = false;

    // Rotating loading texts
    const loadingTexts = [
        "Maler kakaobönor...",
        "Tempererar chokladen...",
        "Rostar hasselnötterna...",
        "Spinner kadayiftrådar...",
        "Väljer de fetaste larverna...",
        "Tillber Sparv-Kungen...",
        "Flyger hejvilt fram och tillbaka..."
    ];
    let textIndex = 0;
    let textRotationInterval;

    if (loadingText) {
        loadingText.textContent = loadingTexts[0];
        textRotationInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length;
            loadingText.textContent = loadingTexts[textIndex];
        }, 1500); // Change text every 1.5 seconds
    }

    if (introVideo && introVideoContainer && loadingScreen) {
        // Load video in background
        introVideo.load();

        // When video is ready to play
        introVideo.addEventListener('canplay', () => {
            videoReady = true;
            // Stop text rotation
            clearInterval(textRotationInterval);
            loadingText.style.display = 'none';
            if (keyholeContainer) {
                keyholeContainer.style.display = 'flex';
            }
            document.querySelector('.loading-spinner').style.display = 'none';
        });

        // Listen for click on keyhole
        const startExperience = () => {
            if (videoReady && !clicked) {
                clicked = true;

                // First fade out keyhole
                if (keyholeContainer) {
                    keyholeContainer.classList.add('fade-out');
                }

                // After keyhole fades, fade out loading screen
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.remove();
                    }, 800);

                    // Show and play video
                    introVideoContainer.style.display = 'flex';
                    setTimeout(() => {
                        const playPromise = introVideo.play();

                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.log("Autoplay prevented:", error);
                            });
                        }
                    }, 100);
                }, 600); // Wait for keyhole fade-out
            }
        };

        // Click on keyhole starts the experience
        if (keyholeImage) {
            keyholeImage.addEventListener('click', startExperience);
        }

        // When video ends, fade out and remove
        introVideo.addEventListener('ended', () => {
            introVideoContainer.classList.add('fade-out');
            setTimeout(() => {
                introVideoContainer.remove();
            }, 1000);
        });

        // Fallback: if video fails to load
        introVideo.addEventListener('error', () => {
            console.log("Video failed to load");
            clearInterval(textRotationInterval);
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.remove();
            }, 800);
        });
    }
});

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

// Observer for candy rain trigger - triggers when hero section leaves viewport
const candyRainObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Trigger when hero is no longer intersecting (scrolled past)
        if (!entry.isIntersecting && !candyRainTriggered) {
            candyRainTriggered = true;
            createChocolateRain();
        }
    });
}, {
    threshold: 0
});

// Observe elements on page load
document.addEventListener('DOMContentLoaded', () => {

    // Observe hero section - candy rain triggers when scrolled past
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        candyRainObserver.observe(heroSection);
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

    // Parallax removed - was causing auto-scroll issues

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

// Start with body visible if there's an intro video, otherwise fade in
if (!document.querySelector('.intro-video-container')) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    // Smooth reveal on page load
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });
} else {
    // If intro video exists, body should be visible immediately
    document.body.style.opacity = '1';
}

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

// ====== SPECIAL EFFECTS ======

// 1. GULDFLIMMER-PARTIKLAR
function createGoldParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'gold-particles-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    document.body.appendChild(particleContainer);

    // Create 30 floating particles
    for (let i = 0; i < 30; i++) {
        createParticle(particleContainer);
    }

    // Continuously create new particles
    setInterval(() => {
        if (document.querySelectorAll('.gold-particle').length < 30) {
            createParticle(particleContainer);
        }
    }, 3000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'gold-particle';
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const duration = Math.random() * 10 + 15;
    const delay = Math.random() * 5;

    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(212, 175, 55, 0.8) 0%, rgba(244, 228, 193, 0.4) 100%);
        border-radius: 50%;
        left: ${startX}%;
        top: ${startY}%;
        animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
        box-shadow: 0 0 ${size * 2}px rgba(212, 175, 55, 0.5);
        filter: blur(0.5px);
    `;

    container.appendChild(particle);

    // Remove and recreate after animation cycle
    setTimeout(() => {
        particle.remove();
    }, (duration + delay) * 1000);
}

// Add particle animation
if (!document.getElementById('particle-animation-style')) {
    const style = document.createElement('style');
    style.id = 'particle-animation-style';
    style.textContent = `
        @keyframes floatParticle {
            0%, 100% {
                transform: translate(0, 0) scale(1);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            25% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.2);
            }
            50% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.8);
            }
            75% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.1);
            }
        }
    `;
    document.head.appendChild(style);
}

// 2. MOUSE TRAIL - REMOVED

// 3. KONAMI CODE - REMOVED

// 4. SCROLL-TRIGGERED STORYLINE
const storyElements = [
    { selector: '.collection', text: 'Från kakaoböna till mästerwerk...' },
    { selector: '.philosophy', text: 'Familjetradition sedan 2016' }
];

storyElements.forEach(story => {
    const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.storyShown) {
                entry.target.dataset.storyShown = 'true';
                showStoryText(story.text, entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.addEventListener('DOMContentLoaded', () => {
        const element = document.querySelector(story.selector);
        if (element) {
            storyObserver.observe(element);
        }
    });
});

function showStoryText(text, targetElement) {
    const storyText = document.createElement('div');
    storyText.className = 'story-text';
    storyText.textContent = text;
    storyText.style.cssText = `
        position: absolute;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'Great Vibes', cursive;
        font-size: 2rem;
        color: var(--gold);
        text-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
        opacity: 0;
        animation: storyFadeIn 2s ease-out forwards;
        z-index: 10;
        white-space: nowrap;
    `;

    targetElement.style.position = 'relative';
    targetElement.appendChild(storyText);

    // Add animation
    if (!document.getElementById('story-animation-style')) {
        const style = document.createElement('style');
        style.id = 'story-animation-style';
        style.textContent = `
            @keyframes storyFadeIn {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                50% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => storyText.remove(), 2000);
}

// 5. BITEMARK ON PRODUCT CARD CLICK
document.addEventListener('DOMContentLoaded', () => {
    const chocolateCards = document.querySelectorAll('.chocolate-card');

    chocolateCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Create bitemark
            const bitemark = document.createElement('div');
            bitemark.className = 'bitemark';

            // Position relative to click
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            bitemark.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 60px;
                height: 60px;
                background: radial-gradient(circle at 50% 50%,
                    rgba(26, 15, 10, 0.6) 0%,
                    rgba(26, 15, 10, 0.4) 30%,
                    transparent 60%);
                border-radius: 50% 40% 50% 40%;
                transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
                pointer-events: none;
                animation: bitemarkFade 2.5s ease-out forwards;
                z-index: 100;
                box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
                filter: blur(1px);
            `;

            // Ensure card has relative positioning
            this.style.position = 'relative';
            this.appendChild(bitemark);

            setTimeout(() => bitemark.remove(), 2500);
        });
    });

    // Add bitemark animation
    if (!document.getElementById('bitemark-animation-style')) {
        const style = document.createElement('style');
        style.id = 'bitemark-animation-style';
        style.textContent = `
            @keyframes bitemarkFade {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                20% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                80% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(1.2);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Initialize gold particles on load
window.addEventListener('load', () => {
    setTimeout(() => {
        createGoldParticles();
    }, 2000); // Start after page has loaded
});

// ====== STORYTELLING ANIMATIONS ======

// Observer for all storytelling elements
const storyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

document.addEventListener('DOMContentLoaded', () => {
    // ALTERNATIV 1: Timeline animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.2}s`;
        storyObserver.observe(item);
    });

    // ALTERNATIV 2: Process steps animations
    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach((step, index) => {
        step.style.transitionDelay = `${index * 0.15}s`;
        storyObserver.observe(step);
    });

    // Process progress bar
    const progressBarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.process-progress-bar');
                if (progressBar) {
                    setTimeout(() => {
                        progressBar.classList.add('active');
                    }, 500);
                }
            }
        });
    }, { threshold: 0.5 });

    const processSection = document.querySelector('.process-section');
    if (processSection) {
        progressBarObserver.observe(processSection);
    }

    // ALTERNATIV 3: Parallax effects
    const parallaxScenes = document.querySelectorAll('.parallax-scene');

    parallaxScenes.forEach(scene => {
        const parallaxText = scene.querySelector('.parallax-text');
        if (parallaxText) {
            storyObserver.observe(parallaxText);
        }
    });

    // Parallax scroll effect
    window.addEventListener('scroll', () => {
        parallaxScenes.forEach(scene => {
            const rect = scene.getBoundingClientRect();
            const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

            if (scrollPercent > 0 && scrollPercent < 1) {
                const bg = scene.querySelector('.parallax-bg');
                if (bg) {
                    const translateY = (scrollPercent - 0.5) * 100;
                    bg.style.transform = `translateY(${translateY}px)`;
                }
            }
        });
    });
});
