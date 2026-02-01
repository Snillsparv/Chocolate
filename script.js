// Horizontal Timeline Section Handler
document.addEventListener('DOMContentLoaded', () => {
    const timelineTrack = document.getElementById('timeline-track');
    const timelineBg = document.querySelector('.timeline-bg');
    const timelineElements = document.querySelectorAll('.timeline-element');
    const timelineTexts = document.querySelectorAll('.timeline-text');
    // Use the new text section arrows
    const prevBtn = document.getElementById('timeline-text-prev');
    const nextBtn = document.getElementById('timeline-text-next');

    if (!timelineTrack || !timelineBg || timelineElements.length === 0) return;

    let currentIndex = 0;
    const totalSlides = 6; // t_0 to t_5

    // Specific center positions for each timeline point (from image specifications)
    // Image is 5272px wide
    const centerPositions = [1264, 1784, 2280, 2923, 3457, 3959];
    const imageWidth = 5272;

    // Wait for background image to load to get dimensions
    const initTimeline = () => {
        const bgWidth = timelineBg.naturalWidth || imageWidth;
        const scale = bgWidth / imageWidth; // Scale factor if image renders differently

        function goToSlide(index) {
            // Clamp index
            index = Math.max(0, Math.min(index, totalSlides - 1));
            currentIndex = index;

            const viewportWidth = window.innerWidth;

            // Get the specific center position for this slide
            const symbolCenter = centerPositions[index] * scale;

            // Calculate translateX to put symbol center at viewport center
            const translateX = (viewportWidth / 2) - symbolCenter;

            // Apply transform - this centers the symbol exactly
            timelineTrack.style.transform = `translateX(${translateX}px)`;

            // Update active states
            timelineElements.forEach((el, i) => {
                el.classList.toggle('active', i === index);
            });

            // Update text visibility
            timelineTexts.forEach((text, i) => {
                text.style.display = i === index ? 'block' : 'none';
            });

            // Update arrow visibility
            if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'flex';
            if (nextBtn) nextBtn.style.display = index === totalSlides - 1 ? 'none' : 'flex';
        }

        // Arrow click handlers
        if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const section = document.querySelector('.timeline-section');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                if (e.key === 'ArrowLeft') {
                    goToSlide(currentIndex - 1);
                } else if (e.key === 'ArrowRight') {
                    goToSlide(currentIndex + 1);
                }
            }
        });

        // Initialize first slide
        goToSlide(0);

        // Handle resize
        window.addEventListener('resize', () => goToSlide(currentIndex));
    };

    // Wait for image load
    if (timelineBg.complete && timelineBg.naturalWidth > 0) {
        initTimeline();
    } else {
        timelineBg.addEventListener('load', initTimeline);
    }
});

// Loading Screen and Intro Video Handler
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingText = document.querySelector('.loading-text');
    const keyholeContainer = document.querySelector('.keyhole-container');
    const keyholeImage = document.querySelector('.keyhole-image');
    const introVideoContainer = document.querySelector('.intro-video-container');
    const introVideo = document.querySelector('.intro-video');

    // Use mobile-optimized video on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && introVideo) {
        const source = introVideo.querySelector('source');
        if (source) {
            source.src = 'bg_mobil.mp4';
            introVideo.load();
        }
    }

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
                // Create gold sparkles around biljett
                createBiljettSparkles();
            }
            document.querySelector('.loading-spinner').style.display = 'none';
        }
    }

    // Create animated gold sparkles around the biljett
    function createBiljettSparkles() {
        const sparklesContainer = document.getElementById('gold-sparkles');
        if (!sparklesContainer) return;

        // Create 20 sparkles at random positions around the ticket
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            // Random position around the edges
            const angle = (i / 20) * Math.PI * 2;
            const radius = 80 + Math.random() * 60; // Vary the distance
            const x = 50 + Math.cos(angle) * (radius / 3);  // percentage
            const y = 50 + Math.sin(angle) * (radius / 3);

            sparkle.style.left = `${x}%`;
            sparkle.style.top = `${y}%`;
            sparkle.style.animationDelay = `${Math.random() * 2}s`;
            sparkle.style.width = `${6 + Math.random() * 8}px`;
            sparkle.style.height = sparkle.style.width;

            sparklesContainer.appendChild(sparkle);
        }
    }

    // Rotating loading texts
    const loadingTexts = [
        "Maler kakaobönorna...",
        "Tempererar chokladen...",
        "Rostar hasselnötterna...",
        "Tillber Sparvkungen...",
        "Väljer de fetaste larverna...",
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

                    // Dissolve biljett immediately (only the image, not the text)
                    if (keyholeImage) {
                        keyholeImage.style.animation = 'dissolve 1.5s ease-out forwards';

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

                    // Fade out the text separately (no scale)
                    const keyholeText = document.querySelector('.keyhole-text');
                    if (keyholeText) {
                        keyholeText.style.transition = 'opacity 1.5s ease-out';
                        keyholeText.style.opacity = '0';
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
    const scrollY = window.scrollY;
    const fallDistance = window.innerHeight + 200;

    // Remove old animation style and create new one with current viewport height
    const oldStyle = document.getElementById('chocolate-rain-style');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = 'chocolate-rain-style';
    style.textContent = `
        @keyframes candyFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(${fallDistance}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const chocolate = document.createElement('div');
            chocolate.textContent = chocolates[Math.floor(Math.random() * chocolates.length)];
            const duration = Math.random() * 3 + 2;
            chocolate.style.cssText = `
                position: absolute;
                top: ${scrollY - 50}px;
                left: ${Math.random() * 100}vw;
                font-size: ${Math.random() * 30 + 20}px;
                z-index: 50;
                pointer-events: none;
                animation: candyFall ${duration}s linear forwards;
            `;

            document.body.appendChild(chocolate);

            setTimeout(() => chocolate.remove(), 6000);
        }, i * 100);
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

// Initialize gold particles on load (desktop only)
window.addEventListener('load', () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
        setTimeout(() => {
            createGoldParticles();
        }, 2000); // Start after page has loaded
    }

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

            // Create golden line animation from dot to slide
            createGoldenLineAnimation(dot, projectorFrame);

            goToSlide(index);
        });
    });

    // Function to create golden line animation from dot to slide
    function createGoldenLineAnimation(dot, target) {
        const dotRect = dot.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        // Calculate start point (center of dot)
        const startX = dotRect.left + dotRect.width / 2;
        const startY = dotRect.top + dotRect.height / 2;

        // Calculate end point (center bottom of slide area)
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height * 0.7;

        // Calculate distance and angle
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        // Create the golden line element
        const goldenLine = document.createElement('div');
        goldenLine.className = 'golden-line-animation';
        goldenLine.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg,
                rgba(212, 175, 55, 1) 0%,
                rgba(244, 228, 193, 1) 50%,
                rgba(212, 175, 55, 0.8) 100%);
            transform-origin: left center;
            transform: rotate(${angle}deg);
            z-index: 5;
            pointer-events: none;
            border-radius: 2px;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.8),
                        0 0 20px rgba(212, 175, 55, 0.5),
                        0 0 30px rgba(212, 175, 55, 0.3);
        `;

        document.body.appendChild(goldenLine);

        // Create sparkle at start point
        createSparkle(startX, startY);

        // Animate the line extending
        requestAnimationFrame(() => {
            goldenLine.style.transition = 'width 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
            goldenLine.style.width = distance + 'px';

            // Create sparkle at end point after line reaches
            setTimeout(() => {
                createSparkle(endX, endY);
            }, 350);
        });

        // Fade out and remove
        setTimeout(() => {
            goldenLine.style.transition = 'opacity 0.3s ease-out';
            goldenLine.style.opacity = '0';
            setTimeout(() => goldenLine.remove(), 300);
        }, 600);
    }

    // Function to create sparkle effect
    function createSparkle(x, y) {
        for (let i = 0; i < 6; i++) {
            const sparkle = document.createElement('div');
            const angle = (i / 6) * Math.PI * 2;
            const distance = 15 + Math.random() * 10;

            sparkle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle,
                    rgba(255, 215, 0, 1) 0%,
                    rgba(212, 175, 55, 0.8) 100%);
                border-radius: 50%;
                z-index: 6;
                pointer-events: none;
                box-shadow: 0 0 6px rgba(212, 175, 55, 1);
                transform: translate(-50%, -50%);
            `;

            document.body.appendChild(sparkle);

            // Animate sparkle outward
            requestAnimationFrame(() => {
                sparkle.style.transition = 'all 0.4s ease-out';
                sparkle.style.transform = `translate(
                    calc(-50% + ${Math.cos(angle) * distance}px),
                    calc(-50% + ${Math.sin(angle) * distance}px)
                )`;
                sparkle.style.opacity = '0';
            });

            setTimeout(() => sparkle.remove(), 400);
        }
    }

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

// ====== TIMELINE SCROLL SECTION ======
document.addEventListener('DOMContentLoaded', () => {
    const timelinePieces = document.querySelectorAll('.timeline-piece');
    const infoBox = document.getElementById('timeline-info-box');
    const infoTitle = document.getElementById('timeline-info-title');
    const infoText = document.getElementById('timeline-info-text');
    const infoClose = document.getElementById('timeline-info-close');

    // Click timeline pieces to show info
    if (timelinePieces.length > 0) {
        timelinePieces.forEach((piece) => {
            piece.addEventListener('click', (e) => {
                e.stopPropagation();

                // Remove active class from all pieces
                timelinePieces.forEach(p => p.classList.remove('active'));

                // Add active class to clicked piece
                piece.classList.add('active');

                // Get info from data attributes
                const title = piece.getAttribute('data-title');
                const text = piece.getAttribute('data-text');

                // Update info box
                infoTitle.textContent = title;
                infoText.textContent = text;

                // Show info box
                infoBox.classList.add('visible');
            });
        });
    }

    // Close info box
    if (infoClose) {
        infoClose.addEventListener('click', () => {
            infoBox.classList.remove('visible');
            // Remove active class from all pieces
            timelinePieces.forEach(p => p.classList.remove('active'));
        });
    }

    // Close info box when clicking outside
    document.addEventListener('click', (e) => {
        if (infoBox.classList.contains('visible') &&
            !infoBox.contains(e.target) &&
            !e.target.classList.contains('timeline-piece')) {
            infoBox.classList.remove('visible');
            // Remove active class from all pieces
            timelinePieces.forEach(p => p.classList.remove('active'));
        }
    });
});

// ====== INTERACTIVE CHOCOLATE SECTION ======
document.addEventListener('DOMContentLoaded', () => {
    const chocolates = [
        { id: 'chocolate-1', closedSrc: 'choklad_1_stängd.webp', openSrc: 'choklad_1_öppen.webp' },
        { id: 'chocolate-2', closedSrc: 'choklad_2_stängd.webp', openSrc: 'choklad_2_öppen_2.webp' },
        { id: 'chocolate-3', closedSrc: 'choklad_3_stängd.webp', openSrc: 'choklad_3_öppen.webp' }
    ];

    const section = document.querySelector('.chocolate-interactive-section');
    if (!section) return;

    // Create canvases for transparent pixel detection
    const chocolateCanvases = {};

    chocolates.forEach(choc => {
        const element = document.getElementById(choc.id);
        if (!element) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        chocolateCanvases[choc.id] = { element, canvas, ctx, ready: false, choc };

        const loadCanvas = () => {
            if (element.complete && element.naturalWidth > 0) {
                canvas.width = element.naturalWidth;
                canvas.height = element.naturalHeight;
                ctx.drawImage(element, 0, 0);
                chocolateCanvases[choc.id].ready = true;
            }
        };

        element.addEventListener('load', loadCanvas);
        if (element.complete) loadCanvas();
    });

    // Check if position has non-transparent pixel on a specific chocolate
    function isOnChocolate(chocId, clickX, clickY) {
        const canvasData = chocolateCanvases[chocId];
        if (!canvasData || !canvasData.ready) return false;

        const element = canvasData.element;
        const canvas = canvasData.canvas;
        const rect = element.getBoundingClientRect();
        const scaleX = element.naturalWidth / rect.width;
        const scaleY = element.naturalHeight / rect.height;

        const x = Math.floor((clickX - rect.left) * scaleX);
        const y = Math.floor((clickY - rect.top) * scaleY);

        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return false;
        }

        // Check a small radius around click point
        const radius = 20;
        for (let offsetX = -radius; offsetX <= radius; offsetX += 5) {
            for (let offsetY = -radius; offsetY <= radius; offsetY += 5) {
                const checkX = x + offsetX;
                const checkY = y + offsetY;
                if (checkX >= 0 && checkX < canvas.width && checkY >= 0 && checkY < canvas.height) {
                    const pixel = canvasData.ctx.getImageData(checkX, checkY, 1, 1).data;
                    if (pixel[3] > 50) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Find which chocolate (if any) is at the given position
    function findChocolateAt(x, y) {
        // Check in reverse order (chocolate-3 is on top visually, but we want to check all)
        for (const chocId of ['chocolate-1', 'chocolate-2', 'chocolate-3']) {
            if (isOnChocolate(chocId, x, y)) {
                return chocId;
            }
        }
        return null;
    }

    // Handle cursor changes on section level
    section.addEventListener('mousemove', (e) => {
        const chocId = findChocolateAt(e.clientX, e.clientY);
        if (chocId) {
            section.style.cursor = 'url("cursor_3.webp") 2 2, pointer';
        } else {
            section.style.cursor = 'url("cursor_bird.webp") 2 2, auto';
        }
    });

    section.addEventListener('mouseleave', () => {
        section.style.cursor = 'url("cursor_bird.webp") 2 2, auto';
    });

    // Handle clicks on section level
    section.addEventListener('click', (e) => {
        const chocId = findChocolateAt(e.clientX, e.clientY);
        if (!chocId) return;

        const canvasData = chocolateCanvases[chocId];
        if (!canvasData) return;

        const element = canvasData.element;
        const choc = canvasData.choc;
        const canvas = canvasData.canvas;
        const ctx = canvasData.ctx;

        // Play bite sound
        const biteSound = new Audio('choco_bite_2.mp3');
        biteSound.volume = 0.6;
        biteSound.play().catch(err => console.log('Audio play prevented:', err));

        const currentState = element.getAttribute('data-state');

        if (currentState === 'closed') {
            element.src = choc.openSrc;
            element.setAttribute('data-state', 'open');
        } else {
            element.src = choc.closedSrc;
            element.setAttribute('data-state', 'closed');
        }

        // Reload canvas with new image
        element.onload = () => {
            canvas.width = element.naturalWidth;
            canvas.height = element.naturalHeight;
            ctx.drawImage(element, 0, 0);
        };
    });
});

// ====== MOBILE CHOCOLATE NAVIGATION ======
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    const scrollWrapper = document.querySelector('.chocolate-scroll-wrapper');
    const prevBtn = document.getElementById('choc-prev');
    const nextBtn = document.getElementById('choc-next');
    const chocolatePieces = document.querySelectorAll('.chocolate-piece');
    let currentIndex = 1; // Start with middle chocolate

    // Scroll positions - adjusted to center the non-transparent part of each chocolate
    // Left needs more offset, right needs less (based on chocolate positions in image)
    const scrollPositions = [0.08, 0.5, 0.92];

    // Closed and open image sources
    const closedSrcs = ['choklad_1_stängd.webp', 'choklad_2_stängd.webp', 'choklad_3_stängd.webp'];
    const openSrcs = ['choklad_1_öppen.webp', 'choklad_2_öppen_2.webp', 'choklad_3_öppen.webp'];

    function scrollToChocolate(index) {
        if (!scrollWrapper) return;

        // Wrap around
        if (index < 0) index = 2;
        if (index > 2) index = 0;
        currentIndex = index;

        // Calculate scroll position
        const maxScroll = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
        const targetScroll = maxScroll * scrollPositions[index];
        scrollWrapper.scrollTo({ left: targetScroll, behavior: 'smooth' });

        // Open selected chocolate, close others
        chocolatePieces.forEach((piece, i) => {
            if (i === currentIndex) {
                piece.src = openSrcs[i];
                piece.setAttribute('data-state', 'open');
            } else {
                piece.src = closedSrcs[i];
                piece.setAttribute('data-state', 'closed');
            }
        });
    }

    // Initialize - scroll to middle chocolate (index 1)
    scrollToChocolate(1);

    // Button click handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => scrollToChocolate(currentIndex - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => scrollToChocolate(currentIndex + 1));
    }
});

// ====== 3D SPARROW KING MASCOT ======
let sparrowActive = false;

// Function to summon Sparvkungen (called from guldägg animation)
function summonSparrow() {
    const container = document.getElementById('sparrow-container');
    const sparrowModel = document.getElementById('sparrow-model');

    if (!container) {
        console.error('Sparrow container not found');
        return;
    }

    // Use 2D image on mobile (3D has color rendering issues on mobile WebGL)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Hide 3D model and use 2D image instead
        if (sparrowModel) {
            sparrowModel.style.display = 'none';
        }

        // Add rotation animation CSS if not already added
        if (!document.getElementById('sparrow-2d-animation')) {
            const style = document.createElement('style');
            style.id = 'sparrow-2d-animation';
            style.textContent = `
                @keyframes sparrowSpinCW {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes sparrowSpinCCW {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(-360deg); }
                }
                @keyframes sparrowSpinFastCW {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(1080deg); }
                }
                @keyframes sparrowSpinFastCCW {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(-1080deg); }
                }
            `;
            document.head.appendChild(style);
        }

        // Track rotation direction
        let spinClockwise = true;

        // Create 2D sparrow image with continuous rotation
        const sparrowImage = document.createElement('img');
        sparrowImage.src = 'sparvkungen_backup.webp';
        sparrowImage.alt = 'Sparvkungen';
        sparrowImage.id = 'sparrow-2d-image';
        sparrowImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            animation: sparrowSpinCW 2s linear infinite;
        `;

        // Click to reverse direction with fast spin
        sparrowImage.addEventListener('click', () => {
            spinClockwise = !spinClockwise;
            const fastAnim = spinClockwise ? 'sparrowSpinFastCW' : 'sparrowSpinFastCCW';
            const normalAnim = spinClockwise ? 'sparrowSpinCW' : 'sparrowSpinCCW';

            sparrowImage.style.animation = 'none';
            sparrowImage.offsetHeight; // Force reflow
            sparrowImage.style.animation = `${fastAnim} 0.8s ease-out forwards`;

            setTimeout(() => {
                sparrowImage.style.animation = `${normalAnim} 2s linear infinite`;
            }, 800);
        });

        container.appendChild(sparrowImage);
        console.log('📱 Using 2D image for mobile');
    }

    // Play crazy sound
    const crazySound = new Audio('crazy.mp3');
    crazySound.volume = 0.6;
    crazySound.play().catch(err => console.log('Audio play prevented:', err));

    // Set initial position at center of current view BEFORE entrance animation
    const size = window.innerWidth <= 768 ? 400 : 650;
    const startX = (document.documentElement.clientWidth - size) / 2;
    const startY = window.scrollY + (document.documentElement.clientHeight - size) / 2;
    container.style.left = `${startX}px`;
    container.style.top = `${startY}px`;

    // Show container with dramatic entrance - start from 0% scale (emerging from egg)
    container.style.transform = 'scale(0) rotate(-180deg)';
    container.style.transition = 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    container.style.opacity = '0';

    setTimeout(() => {
        container.classList.add('visible');
        container.style.transform = 'scale(1) rotate(0deg)';
        container.style.opacity = '1'; // Use inline style to override

        // Remove transition BEFORE starting bouncing animation
        setTimeout(() => {
            container.style.transition = 'none';

            // Start bouncing animation AFTER transition is removed
            startSparrowBouncing(container);
        }, 1000); // Wait for 1s entrance animation to complete
    }, 100);

    console.log('👑🐦 Sparvkungen har blivit kallad!');

    // Listen for model load events
    sparrowModel.addEventListener('load', () => {
        console.log('👑🐦 Sparvkungen is here!');

        // Device-specific exposure adjustment for better mobile colors
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            // Mobile devices need adjusted exposure with commerce tone-mapping
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                sparrowModel.exposure = 1.3;
                console.log('📱 iOS detected - exposure set to 1.3');
            } else if (/Android/.test(navigator.userAgent)) {
                sparrowModel.exposure = 1.5;
                console.log('📱 Android detected - exposure set to 1.5');
            }
        }
    });

    sparrowModel.addEventListener('error', (event) => {
        console.error('Error loading Sparvkungen:', event);
    });
}

function startSparrowBouncing(container) {
    const size = window.innerWidth <= 768 ? 400 : 650; // Even bigger to fill edges!
    // Negative margin to compensate for empty space around model in GLB file
    const margin = -50;

    // Get model-viewer element for 3D rotation
    const modelViewer = container.querySelector('#sparrow-model');

    // Start from center of current view (accounting for scroll)
    let x = (document.documentElement.clientWidth - size) / 2;
    let y = window.scrollY + (document.documentElement.clientHeight - size) / 2;

    // Random initial velocity - faster!
    let velocityX = (Math.random() - 0.5) * 12 + (Math.random() > 0.5 ? 4 : -4);
    let velocityY = (Math.random() - 0.5) * 12 + (Math.random() > 0.5 ? 4 : -4);

    // Minimum velocity - never slower than this
    const minVelocity = 3;
    if (Math.abs(velocityX) < minVelocity) velocityX = velocityX < 0 ? -minVelocity : minVelocity;
    if (Math.abs(velocityY) < minVelocity) velocityY = velocityY < 0 ? -minVelocity : minVelocity;

    // Store base velocity for gradual return (keep it fast!)
    const baseVelocityX = velocityX;
    const baseVelocityY = velocityY;
    const velocityDamping = 0.02; // How fast velocity returns to base (slower damping)

    // Constant 3D rotation - steady multi-axis spin
    let yaw = 0;   // rotation around Y axis (left-right spin)
    let pitch = 0; // rotation around X axis (forward-backward tilt)
    let roll = 0;  // rotation around Z axis (barrel roll)
    let baseYawSpeed = 0.8;    // constant speed
    let basePitchSpeed = 0.5;  // constant speed
    let baseRollSpeed = 0.3;   // constant speed
    let currentYawSpeed = baseYawSpeed;
    let currentPitchSpeed = basePitchSpeed;
    let currentRollSpeed = baseRollSpeed;
    const rotationDamping = 0.05; // How fast rotation returns to base (5% per frame)
    let frameCount = 0;

    // Update container size
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;

    // Enable clicking and dragging on Sparvkungen
    container.style.pointerEvents = 'auto';
    container.style.cursor = 'grab';

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let wasDragged = false;
    let lastDragX = x;
    let lastDragY = y;
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    // WASD keyboard controls
    const keys = { w: false, a: false, s: false, d: false };
    const keyboardAcceleration = 0.5; // How fast keyboard input affects velocity

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
            keys[key] = true;
            e.preventDefault(); // Prevent page scrolling
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
            keys[key] = false;
        }
    });

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        wasDragged = false;
        container.style.cursor = 'grabbing';

        // Play scream sound when clicking on Sparvkungen
        const screamSound = new Audio('sparrow_scream.mp3');
        screamSound.volume = 0.5;
        screamSound.play().catch(err => console.log('Audio play prevented:', err));

        // Calculate offset from container's current position
        const rect = container.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        // Reset velocity tracking
        lastDragX = x;
        lastDragY = y;
        dragVelocityX = 0;
        dragVelocityY = 0;

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            wasDragged = true;

            // Save previous position
            const prevX = x;
            const prevY = y;

            // Update position based on mouse (account for scroll since we use absolute positioning)
            x = e.clientX - dragOffsetX;
            y = e.clientY + window.scrollY - dragOffsetY;

            // Apply bounds - use full page height, not just viewport
            const pageWidth = document.documentElement.clientWidth;
            const pageHeight = document.body.scrollHeight;
            const maxX = pageWidth - size - margin;
            const maxY = pageHeight - size - margin;

            x = Math.max(margin, Math.min(x, maxX));
            y = Math.max(margin, Math.min(y, maxY));

            // Calculate drag velocity
            dragVelocityX = x - prevX;
            dragVelocityY = y - prevY;

            container.style.left = `${x}px`;
            container.style.top = `${y}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            container.style.cursor = 'grab';

            // If it was just a click (not dragged), trigger spin boost
            if (!wasDragged) {
                // Boost rotation speed, will gradually return to base via damping
                currentYawSpeed = baseYawSpeed * 5;
                currentPitchSpeed = basePitchSpeed * 5;
                currentRollSpeed = baseRollSpeed * 5;

                console.log('🌀 Extra spin!');
            } else {
                // Apply throw velocity from drag
                velocityX = dragVelocityX * 0.8; // Dampen slightly
                velocityY = dragVelocityY * 0.8;

                // Ensure minimum velocity if too slow
                if (Math.abs(velocityX) < 0.5) velocityX = velocityX < 0 ? -1 : 1;
                if (Math.abs(velocityY) < 0.5) velocityY = velocityY < 0 ? -1 : 1;

                console.log(`🎯 Thrown with velocity: ${velocityX.toFixed(2)}, ${velocityY.toFixed(2)}`);
            }
        }
    });

    // Touch events for mobile dragging
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        wasDragged = false;

        // Play scream sound when touching Sparvkungen
        const screamSound = new Audio('sparrow_scream.mp3');
        screamSound.volume = 0.5;
        screamSound.play().catch(err => console.log('Audio play prevented:', err));

        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        dragOffsetX = touch.clientX - rect.left;
        dragOffsetY = touch.clientY - rect.top;

        lastDragX = x;
        lastDragY = y;
        dragVelocityX = 0;
        dragVelocityY = 0;

        e.preventDefault();
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
        if (isDragging) {
            wasDragged = true;

            const touch = e.touches[0];
            const prevX = x;
            const prevY = y;

            x = touch.clientX - dragOffsetX;
            y = touch.clientY + window.scrollY - dragOffsetY;

            const pageWidth = document.documentElement.clientWidth;
            const pageHeight = document.body.scrollHeight;
            const maxX = pageWidth - size - margin;
            const maxY = pageHeight - size - margin;

            x = Math.max(margin, Math.min(x, maxX));
            y = Math.max(margin, Math.min(y, maxY));

            dragVelocityX = x - prevX;
            dragVelocityY = y - prevY;

            container.style.left = `${x}px`;
            container.style.top = `${y}px`;

            e.preventDefault();
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;

            if (!wasDragged) {
                currentYawSpeed = baseYawSpeed * 5;
                currentPitchSpeed = basePitchSpeed * 5;
                currentRollSpeed = baseRollSpeed * 5;
            } else {
                velocityX = dragVelocityX * 0.8;
                velocityY = dragVelocityY * 0.8;

                if (Math.abs(velocityX) < 0.5) velocityX = velocityX < 0 ? -1 : 1;
                if (Math.abs(velocityY) < 0.5) velocityY = velocityY < 0 ? -1 : 1;
            }
        }
    });

    function animate() {
        if (!sparrowActive) return;

        frameCount++;

        // Get current page dimensions (full page, not just viewport)
        const pageWidth = document.documentElement.clientWidth;
        const pageHeight = document.body.scrollHeight;
        const maxX = pageWidth - size - margin;
        const maxY = pageHeight - size - margin;

        // Skip position updates if dragging
        if (!isDragging) {
            // Apply WASD keyboard controls
            if (keys.w) velocityY -= keyboardAcceleration;
            if (keys.s) velocityY += keyboardAcceleration;
            if (keys.a) velocityX -= keyboardAcceleration;
            if (keys.d) velocityX += keyboardAcceleration;

            // Gradually return velocity to base velocity (slower when using keyboard)
            const isUsingKeyboard = keys.w || keys.a || keys.s || keys.d;
            if (!isUsingKeyboard) {
                velocityX += (baseVelocityX - velocityX) * velocityDamping;
                velocityY += (baseVelocityY - velocityY) * velocityDamping;
            }

            // NEVER let velocity drop below minimum - keep him moving!
            if (Math.abs(velocityX) < minVelocity) {
                velocityX = velocityX >= 0 ? minVelocity : -minVelocity;
            }
            if (Math.abs(velocityY) < minVelocity) {
                velocityY = velocityY >= 0 ? minVelocity : -minVelocity;
            }

            // Update position
            x += velocityX;
            y += velocityY;

            // Bounce off LEFT edge
            if (x < margin) {
                x = margin;
                velocityX = Math.max(Math.abs(velocityX), minVelocity);
            }

            // Bounce off RIGHT edge
            if (x > maxX) {
                x = maxX;
                velocityX = -Math.max(Math.abs(velocityX), minVelocity);
            }

            // Bounce off TOP edge
            if (y < margin) {
                y = margin;
                velocityY = Math.max(Math.abs(velocityY), minVelocity);
            }

            // Bounce off BOTTOM edge
            if (y > maxY) {
                y = maxY;
                velocityY = -Math.max(Math.abs(velocityY), minVelocity);
            }

            // Safety clamp
            x = Math.max(margin, Math.min(x, maxX));
            y = Math.max(margin, Math.min(y, maxY));

            // Apply position
            container.style.left = `${x}px`;
            container.style.top = `${y}px`;
        }

        // Gradually return rotation speed to base speed
        currentYawSpeed += (baseYawSpeed - currentYawSpeed) * rotationDamping;
        currentPitchSpeed += (basePitchSpeed - currentPitchSpeed) * rotationDamping;
        currentRollSpeed += (baseRollSpeed - currentRollSpeed) * rotationDamping;

        // Update 3D rotation (always, even when dragging)
        yaw += currentYawSpeed;
        pitch += currentPitchSpeed;
        roll += currentRollSpeed;

        // Apply 3D rotation to the model itself using model-viewer's orientation
        if (modelViewer) {
            modelViewer.orientation = `${yaw}deg ${pitch}deg ${roll}deg`;
        }

        requestAnimationFrame(animate);
    }

    animate();

    console.log('👑 Sparvkung physics initialized');

    // Handle window resize
    window.addEventListener('resize', () => {
        const newSize = window.innerWidth <= 768 ? 400 : 650;
        const newMargin = -50; // Negative margin to compensate for model padding
        container.style.width = `${newSize}px`;
        container.style.height = `${newSize}px`;

        const pageWidth = document.documentElement.clientWidth;
        const pageHeight = document.body.scrollHeight;
        const maxX = pageWidth - newSize - newMargin;
        const maxY = pageHeight - newSize - newMargin;
        x = Math.max(newMargin, Math.min(x, maxX));
        y = Math.max(newMargin, Math.min(y, maxY));

        console.log('🔄 Window resized, new bounds calculated');
    });
}

// Guldägg Section Handler
document.addEventListener('DOMContentLoaded', () => {
    const guldaggEgg = document.getElementById('guldagg-egg');
    const guldaggVideo = document.getElementById('guldagg-video');
    const guldaggBgFinal = document.getElementById('guldagg-bg-final');
    const guldaggBg = document.querySelector('.guldagg-bg');

    if (guldaggEgg && guldaggVideo) {
        // Create canvas for transparent pixel detection
        const eggCanvas = document.createElement('canvas');
        const eggCtx = eggCanvas.getContext('2d', { willReadFrequently: true });
        let eggCanvasReady = false;

        // Load egg image into canvas when ready
        const loadEggCanvas = () => {
            if (guldaggEgg.complete && guldaggEgg.naturalWidth > 0) {
                eggCanvas.width = guldaggEgg.naturalWidth;
                eggCanvas.height = guldaggEgg.naturalHeight;
                eggCtx.drawImage(guldaggEgg, 0, 0);
                eggCanvasReady = true;
            }
        };

        guldaggEgg.addEventListener('load', loadEggCanvas);
        if (guldaggEgg.complete) loadEggCanvas();

        // Check if click is on non-transparent pixel
        function isClickOnEgg(clickX, clickY) {
            if (!eggCanvasReady) return true; // Fallback to allow click

            const rect = guldaggEgg.getBoundingClientRect();
            const scaleX = guldaggEgg.naturalWidth / rect.width;
            const scaleY = guldaggEgg.naturalHeight / rect.height;

            const x = Math.floor((clickX - rect.left) * scaleX);
            const y = Math.floor((clickY - rect.top) * scaleY);

            if (x < 0 || x >= eggCanvas.width || y < 0 || y >= eggCanvas.height) {
                return false;
            }

            // Check a small radius around click point
            const radius = 30;
            for (let offsetX = -radius; offsetX <= radius; offsetX += 5) {
                for (let offsetY = -radius; offsetY <= radius; offsetY += 5) {
                    const checkX = x + offsetX;
                    const checkY = y + offsetY;
                    if (checkX >= 0 && checkX < eggCanvas.width && checkY >= 0 && checkY < eggCanvas.height) {
                        const pixel = eggCtx.getImageData(checkX, checkY, 1, 1).data;
                        if (pixel[3] > 50) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        // Change cursor to pointer only when over non-transparent pixels
        guldaggEgg.addEventListener('mousemove', (e) => {
            if (isClickOnEgg(e.clientX, e.clientY)) {
                guldaggEgg.style.cursor = 'url("cursor_3.webp") 2 2, pointer';
            } else {
                guldaggEgg.style.cursor = 'inherit';
            }
        });

        guldaggEgg.addEventListener('mouseleave', () => {
            guldaggEgg.style.cursor = 'inherit';
        });

        guldaggEgg.addEventListener('click', (e) => {
            // Only trigger if clicking on non-transparent part
            if (!isClickOnEgg(e.clientX, e.clientY)) {
                return;
            }

            // Show flashing text "SPARV-KUNGEN HAR BLIVIT KALLAD!"
            const sparvKungenText = document.getElementById('sparv-kungen-text');
            if (sparvKungenText) {
                sparvKungenText.classList.add('visible');
                // Remove the animation class after it completes (8 flashes * 0.4s = 3.2s)
                setTimeout(() => {
                    sparvKungenText.classList.remove('visible');
                }, 3200);
            }

            // Hide the egg
            guldaggEgg.style.display = 'none';

            // Show and play the video with audio
            guldaggVideo.style.display = 'block';
            guldaggVideo.volume = 0.7;
            guldaggVideo.muted = false;
            guldaggVideo.play().catch(err => console.log('Video play error:', err));

            // Summon Sparvkungen a bit earlier (before video ends)
            setTimeout(() => {
                if (!sparrowActive) {
                    sparrowActive = true;
                    summonSparrow();
                }
            }, 3000); // Appear 3 seconds after click, before video ends
        });

        // When video ends, show the final background
        guldaggVideo.addEventListener('ended', () => {
            guldaggVideo.style.display = 'none';
            if (guldaggBgFinal && guldaggBg) {
                // Swap backgrounds - show final, hide original
                guldaggBgFinal.style.display = 'block';
                guldaggBg.style.opacity = '0';
                guldaggBg.style.visibility = 'hidden';
            }
        });
    }
});
