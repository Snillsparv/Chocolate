// Tid Section Handler (Historia)
document.addEventListener('DOMContentLoaded', () => {
    const tidSection = document.querySelector('.tid-section');
    const tidLayers = document.querySelectorAll('.tid-layer');

    if (tidSection && tidLayers.length > 0) {
        // Store canvas data for each layer to detect non-transparent clicks
        const layerCanvases = new Map();

        // Load each image into a canvas for pixel detection
        tidLayers.forEach((layer) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            layer.addEventListener('load', () => {
                canvas.width = layer.naturalWidth;
                canvas.height = layer.naturalHeight;
                ctx.drawImage(layer, 0, 0);
                layerCanvases.set(layer, { canvas, ctx });
            });

            // If already loaded
            if (layer.complete && layer.naturalWidth > 0) {
                canvas.width = layer.naturalWidth;
                canvas.height = layer.naturalHeight;
                ctx.drawImage(layer, 0, 0);
                layerCanvases.set(layer, { canvas, ctx });
            }
        });

        // Check if click is on or near non-transparent pixel (with expanded radius)
        function isClickOnVisiblePixel(layer, clickX, clickY) {
            const data = layerCanvases.get(layer);
            if (!data) return false;

            const rect = layer.getBoundingClientRect();
            const scaleX = layer.naturalWidth / rect.width;
            const scaleY = layer.naturalHeight / rect.height;

            const centerX = Math.floor((clickX - rect.left) * scaleX);
            const centerY = Math.floor((clickY - rect.top) * scaleY);

            // Check a radius of 60 pixels around the click point
            const radius = 60;
            for (let offsetX = -radius; offsetX <= radius; offsetX += 5) {
                for (let offsetY = -radius; offsetY <= radius; offsetY += 5) {
                    const x = centerX + offsetX;
                    const y = centerY + offsetY;

                    if (x < 0 || x >= data.canvas.width || y < 0 || y >= data.canvas.height) {
                        continue;
                    }

                    const pixel = data.ctx.getImageData(x, y, 1, 1).data;
                    if (pixel[3] > 50) {
                        return true;
                    }
                }
            }
            return false;
        }

        // Calculate the center of visible (non-transparent) pixels for a layer
        function getSymbolCenter(layer) {
            const data = layerCanvases.get(layer);
            if (!data) return null;

            const rect = layer.getBoundingClientRect();
            const scaleX = rect.width / layer.naturalWidth;
            const scaleY = rect.height / layer.naturalHeight;

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const step = 10; // Sample every 10 pixels for performance

            for (let y = 0; y < data.canvas.height; y += step) {
                for (let x = 0; x < data.canvas.width; x += step) {
                    const pixel = data.ctx.getImageData(x, y, 1, 1).data;
                    if (pixel[3] > 50) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (minX === Infinity) return null;

            // Convert to screen coordinates
            const centerX = rect.left + ((minX + maxX) / 2) * scaleX;
            const centerY = rect.top + ((minY + maxY) / 2) * scaleY;

            return { x: centerX, y: centerY };
        }

        // Get textbox elements
        const textbox = document.querySelector('.tid-textbox');
        const textboxTitle = document.querySelector('.tid-textbox-title');
        const textboxContent = document.querySelector('.tid-textbox-content');
        let currentActiveLayer = null;

        // Handle clicks on tid section
        tidSection.addEventListener('click', (e) => {
            // Check layers in reverse order (top to bottom)
            for (let i = tidLayers.length - 1; i >= 0; i--) {
                const layer = tidLayers[i];
                if (isClickOnVisiblePixel(layer, e.clientX, e.clientY)) {
                    // If clicking same layer, toggle off
                    if (currentActiveLayer === layer) {
                        layer.classList.remove('glow');
                        textbox.classList.remove('visible');
                        currentActiveLayer = null;
                    } else {
                        // Remove glow from previous layer
                        if (currentActiveLayer) {
                            currentActiveLayer.classList.remove('glow');
                        }
                        // Add glow to this layer
                        layer.classList.add('glow');
                        currentActiveLayer = layer;

                        // Show textbox with content
                        const title = layer.dataset.title || '';
                        const text = layer.dataset.text || '';
                        textboxTitle.textContent = title;
                        textboxContent.textContent = text;

                        // Position textbox relative to symbol's actual center
                        const layerIndex = i + 1; // 1-based
                        const gap = 40;
                        const boxWidth = 320;
                        const boxHeight = 200;
                        let left, top;

                        // Get symbol's actual visible center
                        const symbolCenter = getSymbolCenter(layer);
                        const symX = symbolCenter ? symbolCenter.x : e.clientX;
                        const symY = symbolCenter ? symbolCenter.y : e.clientY;

                        if (layerIndex === 1) {
                            // Ruta 1: +80px höger
                            left = symX + gap + 80;
                            top = symY - boxHeight / 2;
                        } else if (layerIndex === 2) {
                            // Ruta 2: +50px höger
                            left = symX + gap + 50;
                            top = symY - boxHeight / 2;
                        } else if (layerIndex === 3) {
                            // Ruta 3: -30px vänster, +30px nedåt
                            left = symX - boxWidth - gap - 30;
                            top = symY - boxHeight / 2 + 30;
                        } else if (layerIndex === 4) {
                            // Ruta 4: -50px vänster
                            left = symX - boxWidth - gap - 50;
                            top = symY - boxHeight - gap - 10;
                        } else {
                            // Ruta 5: -70px vänster, -60px uppåt
                            left = symX - boxWidth - gap - 70;
                            top = symY - boxHeight - gap - 60;
                        }

                        // Clamp within viewport
                        left = Math.max(20, Math.min(left, window.innerWidth - boxWidth - 20));
                        top = Math.max(20, Math.min(top, window.innerHeight - boxHeight - 20));

                        textbox.style.left = left + 'px';
                        textbox.style.top = top + 'px';
                        textbox.style.right = 'auto';
                        textbox.style.transform = 'none';
                        textbox.classList.add('visible');
                    }
                    return;
                }
            }

            // Clicked on empty area - hide textbox
            if (currentActiveLayer) {
                currentActiveLayer.classList.remove('glow');
                currentActiveLayer = null;
            }
            textbox.classList.remove('visible');
        });
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

    // Handle clicks on chocolate zones
    const zones = document.querySelectorAll('.chocolate-zone');
    zones.forEach(zone => {
        zone.addEventListener('click', () => {
            const chocolateId = zone.getAttribute('data-chocolate');
            const element = document.getElementById(chocolateId);
            const choc = chocolates.find(c => c.id === chocolateId);

            if (element && choc) {
                const currentState = element.getAttribute('data-state');

                if (currentState === 'closed') {
                    element.src = choc.openSrc;
                    element.setAttribute('data-state', 'open');
                } else {
                    element.src = choc.closedSrc;
                    element.setAttribute('data-state', 'closed');
                }
            }
        });
    });
});

// ====== 3D SPARROW KING MASCOT ======
let sparrowActive = false;

// Function to summon Sparvkungen (called from guldägg animation)
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

    // Set initial position at center BEFORE entrance animation
    const size = window.innerWidth <= 768 ? 400 : 650;
    const startX = (document.documentElement.clientWidth - size) / 2;
    const startY = (document.documentElement.clientHeight - size) / 2;
    container.style.left = `${startX}px`;
    container.style.top = `${startY}px`;

    // Show container with dramatic entrance
    container.style.transform = 'scale(0.3) rotate(-180deg)';
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

    // Start from center of viewport
    let x = (document.documentElement.clientWidth - size) / 2;
    let y = (document.documentElement.clientHeight - size) / 2;

    // Random initial velocity - slower
    let velocityX = (Math.random() - 0.5) * 3;
    let velocityY = (Math.random() - 0.5) * 3;

    // Make sure velocity is never too slow
    if (Math.abs(velocityX) < 1) velocityX = velocityX < 0 ? -1 : 1;
    if (Math.abs(velocityY) < 1) velocityY = velocityY < 0 ? -1 : 1;

    // Store base velocity for gradual return
    const baseVelocityX = velocityX;
    const baseVelocityY = velocityY;
    const velocityDamping = 0.03; // How fast velocity returns to base (0.03 = 3% per frame)

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

            // Update position based on mouse
            x = e.clientX - dragOffsetX;
            y = e.clientY - dragOffsetY;

            // Apply bounds
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;
            const maxX = viewportWidth - size - margin;
            const maxY = viewportHeight - size - margin;

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

    // Create debug overlay
    const debugDiv = document.createElement('div');
    debugDiv.id = 'sparrow-debug';
    debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: #0f0;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 99999;
        border-radius: 5px;
        display: none;
    `;
    document.body.appendChild(debugDiv);

    // Press D to toggle debug info
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' || e.key === 'D') {
            debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
        }
    });

    function animate() {
        if (!sparrowActive) return;

        frameCount++;

        // Get current viewport dimensions (always needed for debug)
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const maxX = viewportWidth - size - margin;
        const maxY = viewportHeight - size - margin;

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

            // Update position
            x += velocityX;
            y += velocityY;

            // Bounce off LEFT edge
            if (x < margin) {
                x = margin;
                velocityX = Math.abs(velocityX);
                console.log('🔵 Bounced LEFT');
            }

            // Bounce off RIGHT edge
            if (x > maxX) {
                x = maxX;
                velocityX = -Math.abs(velocityX);
                console.log('🔵 Bounced RIGHT');
            }

            // Bounce off TOP edge
            if (y < margin) {
                y = margin;
                velocityY = Math.abs(velocityY);
                console.log('🔵 Bounced TOP');
            }

            // Bounce off BOTTOM edge
            if (y > maxY) {
                y = maxY;
                velocityY = -Math.abs(velocityY);
                console.log('🔵 Bounced BOTTOM');
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

        // Update debug info every 30 frames
        if (frameCount % 30 === 0 && debugDiv.style.display === 'block') {
            debugDiv.innerHTML = `
                Viewport: ${viewportWidth} x ${viewportHeight}<br>
                Position: ${Math.round(x)}, ${Math.round(y)}<br>
                Velocity: ${velocityX.toFixed(2)}, ${velocityY.toFixed(2)}<br>
                Size: ${size}px<br>
                Margin: ${margin}px<br>
                MaxX: ${Math.round(maxX)}<br>
                MaxY: ${Math.round(maxY)}
            `;
        }

        requestAnimationFrame(animate);
    }

    animate();

    console.log('👑 Sparvkung physics initialized:');
    console.log(`   Viewport: ${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`);
    console.log(`   Size: ${size}px, Margin: ${margin}px`);
    console.log(`   Press D to toggle debug overlay`);

    // Handle window resize
    window.addEventListener('resize', () => {
        const newSize = window.innerWidth <= 768 ? 400 : 650;
        const newMargin = -50; // Negative margin to compensate for model padding
        container.style.width = `${newSize}px`;
        container.style.height = `${newSize}px`;

        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const maxX = viewportWidth - newSize - newMargin;
        const maxY = viewportHeight - newSize - newMargin;
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

        guldaggEgg.addEventListener('click', (e) => {
            // Only trigger if clicking on non-transparent part
            if (!isClickOnEgg(e.clientX, e.clientY)) {
                return;
            }

            // Hide the egg
            guldaggEgg.style.display = 'none';

            // Show and play the video
            guldaggVideo.style.display = 'block';
            guldaggVideo.play().catch(err => console.log('Video play error:', err));

            // Summon Sparvkungen during the animation
            if (!sparrowActive) {
                sparrowActive = true;
                summonSparrow();
            }
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
