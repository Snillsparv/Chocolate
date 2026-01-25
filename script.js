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
    let minimumLoadTimeReached = false;

    // Minimum 5 seconds loading screen
    setTimeout(() => {
        minimumLoadTimeReached = true;
        checkIfReadyToShow();
    }, 5000);

    function checkIfReadyToShow() {
        if (videoReady && minimumLoadTimeReached) {
            // Stop text rotation
            clearInterval(textRotationInterval);
            loadingText.style.display = 'none';
            if (keyholeContainer) {
                keyholeContainer.style.display = 'flex';
            }
            document.querySelector('.loading-spinner').style.display = 'none';
        }
    }

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
            checkIfReadyToShow();
        });

        // Listen for click on keyhole
        const startExperience = () => {
            if (videoReady && !clicked) {
                clicked = true;

                // Prevent scrolling IMMEDIATELY
                document.body.classList.add('video-playing');
                window.scrollTo(0, 0);

                // Fade out loading screen and start video immediately
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

                    // Play intro music SIMULTANEOUSLY with video
                    const introMusic = new Audio('intro.mp3');
                    introMusic.volume = 0.5;
                    introMusic.play().catch(err => console.log('Audio play prevented:', err));
                }, 100);
            }
        };

        // Click on keyhole starts the experience
        if (keyholeImage) {
            keyholeImage.addEventListener('click', () => {
                if (videoReady && !clicked) {
                    // Don't set clicked yet - wait until we actually start the video

                    // Play unlock sound
                    const unlockSound = new Audio('unlock.mp3');
                    unlockSound.volume = 0.7;
                    unlockSound.play().catch(err => console.log('Audio play prevented:', err));

                    // Dissolve biljett immediately
                    if (keyholeContainer) {
                        keyholeContainer.style.animation = 'dissolve 1.5s ease-out forwards';

                        // Add dissolve animation if not exists
                        if (!document.getElementById('dissolve-animation-style')) {
                            const style = document.createElement('style');
                            style.id = 'dissolve-animation-style';
                            style.textContent = `
                                @keyframes dissolve {
                                    0% {
                                        opacity: 1;
                                        transform: scale(1);
                                        filter: blur(0px);
                                    }
                                    50% {
                                        opacity: 0.5;
                                        transform: scale(1.1);
                                        filter: blur(5px);
                                    }
                                    100% {
                                        opacity: 0;
                                        transform: scale(1.3);
                                        filter: blur(10px);
                                    }
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    }

                    // Wait for sound to finish, then start video
                    unlockSound.addEventListener('ended', () => {
                        if (!clicked) {  // Check again to avoid double-trigger
                            startExperience();  // This will set clicked = true internally
                        }
                    });

                    // Fallback: start after 2 seconds even if sound fails
                    setTimeout(() => {
                        if (!clicked && (!introVideoContainer || introVideoContainer.style.display === 'none')) {
                            startExperience();  // This will set clicked = true internally
                        }
                    }, 2500);
                }
            });
        }

        // When video ends, fade out and remove
        introVideo.addEventListener('ended', () => {
            // Force scroll to top BEFORE removing video-playing class
            window.scrollTo({ top: 0, behavior: 'instant' });

            introVideoContainer.classList.add('fade-out');

            setTimeout(() => {
                // Re-enable scrolling and ensure we're at top
                document.body.classList.remove('video-playing');
                window.scrollTo({ top: 0, behavior: 'instant' });

                setTimeout(() => {
                    introVideoContainer.remove();
                }, 100);
            }, 900);
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

// Ensure body is visible immediately when page loads
document.body.style.opacity = '1';

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

    // Don't auto-initialize Sparrow - wait for "S" key press
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
});

// ====== LATERNA MAGICA SLIDESHOW ======
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const indicatorDots = document.querySelectorAll('.indicator-dot');
    const projectorFrame = document.querySelector('.projector-frame');

    if (slides.length === 0) return;

    let currentSlideIndex = 0;
    let isTransitioning = false;

    // Function to go to specific slide
    function goToSlide(index) {
        if (isTransitioning || index === currentSlideIndex) return;

        isTransitioning = true;

        const currentSlide = slides[currentSlideIndex];
        const nextSlide = slides[index];

        // Add exiting class to current slide
        currentSlide.classList.add('exiting');
        currentSlide.classList.remove('active');

        // Add active class to next slide
        nextSlide.classList.add('active');
        nextSlide.classList.remove('exiting');

        // Update indicator dots
        indicatorDots[currentSlideIndex].classList.remove('active');
        indicatorDots[index].classList.add('active');

        // Update current index
        currentSlideIndex = index;

        // Remove exiting class after transition
        setTimeout(() => {
            currentSlide.classList.remove('exiting');
            isTransitioning = false;
        }, 800);
    }

    // Function to advance to next slide
    function nextSlide() {
        const nextIndex = (currentSlideIndex + 1) % slides.length;
        goToSlide(nextIndex);
    }

    // Function to go to previous slide
    function prevSlide() {
        const prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        goToSlide(prevIndex);
    }

    // Click on projector frame to advance
    if (projectorFrame) {
        projectorFrame.addEventListener('click', (e) => {
            // Don't trigger if clicking on indicator dots
            if (e.target.classList.contains('indicator-dot')) return;
            nextSlide();
        });
    }

    // Click on indicator dots to jump to specific slide
    indicatorDots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(index);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const laternaMagica = document.querySelector('.laterna-magica-section');
        if (!laternaMagica) return;

        const rect = laternaMagica.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            }
        }
    });
});

// ====== 3D SPARROW KING MASCOT ======
let sparrowActive = false;

// Listen for "S" key to summon Sparvkungen
document.addEventListener('keydown', (e) => {
    if ((e.key === 's' || e.key === 'S') && !sparrowActive) {
        sparrowActive = true;
        summonSparrow();
    }
});

function summonSparrow() {
    const container = document.getElementById('sparrow-container');
    const sparrowModel = document.getElementById('sparrow-model');

    if (!container || !sparrowModel) {
        console.error('Sparrow container or model not found');
        return;
    }

    // Play crazy sound
    const crazySound = new Audio('crazy.mp3');
    crazySound.volume = 0.6;
    crazySound.play().catch(err => console.log('Audio play prevented:', err));

    // Show container with dramatic entrance
    container.style.transform = 'scale(0.3) rotate(-180deg)';
    container.style.transition = 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    container.style.opacity = '0';

    setTimeout(() => {
        container.classList.add('visible');
        container.style.transform = 'scale(1) rotate(0deg)';
        container.style.opacity = '1'; // Use inline style to override
    }, 100);

    console.log('👑🐦 Sparvkungen har blivit kallad!');

    // Listen for model load events
    sparrowModel.addEventListener('load', () => {
        console.log('👑🐦 Sparvkungen is here!');
    });

    sparrowModel.addEventListener('error', (event) => {
        console.error('Error loading Sparvkungen:', event);
    });

    // Start bouncing animation
    startSparrowBouncing(container);
}

function startSparrowBouncing(container) {
    const size = window.innerWidth <= 768 ? 180 : 300;
    const margin = 10;

    // Start from center of screen
    let x = (window.innerWidth - size) / 2;
    let y = (window.innerHeight - size) / 2;

    // Random initial velocity - moderate speed
    let velocityX = (Math.random() - 0.5) * 6;
    let velocityY = (Math.random() - 0.5) * 6;

    // Make sure velocity is never too slow
    if (Math.abs(velocityX) < 2) velocityX = velocityX < 0 ? -2 : 2;
    if (Math.abs(velocityY) < 2) velocityY = velocityY < 0 ? -2 : 2;

    let rotation = 0;

    // Update container size
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;

    function animate() {
        if (!sparrowActive) return;

        // Update position BEFORE checking bounds
        x += velocityX;
        y += velocityY;

        // Get current screen dimensions
        const maxX = window.innerWidth - size - margin;
        const maxY = window.innerHeight - size - margin;

        // Bounce off LEFT edge
        if (x < margin) {
            x = margin;
            velocityX = Math.abs(velocityX); // Force positive (move right)
        }

        // Bounce off RIGHT edge
        if (x > maxX) {
            x = maxX;
            velocityX = -Math.abs(velocityX); // Force negative (move left)
        }

        // Bounce off TOP edge
        if (y < margin) {
            y = margin;
            velocityY = Math.abs(velocityY); // Force positive (move down)
        }

        // Bounce off BOTTOM edge
        if (y > maxY) {
            y = maxY;
            velocityY = -Math.abs(velocityY); // Force negative (move up)
        }

        // Double-check: clamp position to always be visible
        x = Math.max(margin, Math.min(x, maxX));
        y = Math.max(margin, Math.min(y, maxY));

        // Gentle rotation
        rotation += 1;

        // Apply position and rotation
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        container.style.transform = `rotate(${rotation}deg)`;

        requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const newSize = window.innerWidth <= 768 ? 180 : 300;
        container.style.width = `${newSize}px`;
        container.style.height = `${newSize}px`;

        // Recalculate position to keep within new bounds
        const maxX = window.innerWidth - newSize - margin;
        const maxY = window.innerHeight - newSize - margin;
        x = Math.max(margin, Math.min(x, maxX));
        y = Math.max(margin, Math.min(y, maxY));
    });
}
