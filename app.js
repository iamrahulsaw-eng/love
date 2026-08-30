/**
 * MAIN APP INTERACTION SCRIPT
 * Manages Gate entry, wax seal breaking, photo modal, floating heart bursts, and music synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. GATE UNLOCK & AUDIO START
    const unlockBtn = document.getElementById('unlock-btn');
    const gateOverlay = document.getElementById('gate-overlay');
    const musicToggle = document.getElementById('music-toggle');
    const heartBurstBtn = document.getElementById('heart-burst-btn');

    if (unlockBtn && gateOverlay) {
        unlockBtn.addEventListener('click', () => {
            // Smoothly hide gate
            gateOverlay.classList.add('opened');
            
            // Start audio engine
            if (window.romanticAudio) {
                window.romanticAudio.start();
            }

            // Trigger welcome sparkle burst
            if (window.romanticFX) {
                window.romanticFX.triggerHeartExplosion(window.innerWidth / 2, window.innerHeight / 2);
            }
        });
    }

    // Top Navigation Music Toggle
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (window.romanticAudio) {
                window.romanticAudio.toggle();
            }
        });
    }

    // Top Navigation Heart Burst Button
    if (heartBurstBtn) {
        heartBurstBtn.addEventListener('click', (e) => {
            const rect = heartBurstBtn.getBoundingClientRect();
            spawnFloatingHearts(rect.left + 20, rect.top + 20);
            if (window.romanticFX) {
                window.romanticFX.triggerHeartExplosion(rect.left, rect.top);
            }
        });
    }

    // Custom MP3 Audio File Input
    const mp3Input = document.getElementById('custom-mp3-input');
    if (mp3Input) {
        mp3Input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && window.romanticAudio) {
                const url = URL.createObjectURL(file);
                const title = file.name.replace(/\.[^/.]+$/, "");
                window.romanticAudio.setCustomAudio(url, title);
            }
        });
    }

    // Active Navigation Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                current = sectionId;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
});

// WAX SEAL OPENING LOGIC
function openApologyLetter() {
    const envelope = document.getElementById('wax-envelope');
    const letter = document.getElementById('unfolded-letter');

    if (window.romanticAudio) {
        window.romanticAudio.playSealBreakSFX();
    }

    if (window.romanticFX) {
        const rect = envelope.getBoundingClientRect();
        window.romanticFX.triggerHeartExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    envelope.style.transition = 'all 0.5s ease';
    envelope.style.opacity = '0';
    envelope.style.transform = 'scale(0.8) translateY(-20px)';

    setTimeout(() => {
        envelope.style.display = 'none';
        letter.classList.add('active');
        letter.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 450);
}

// CELEBRATE FORGIVENESS BUTTON CLICK
function celebrateForgiveness(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    btn.innerHTML = '<span>💖 Thank You For Forgiving Me! Always Yours 💍</span>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    btn.style.pointerEvents = 'none';

    if (window.romanticFX) {
        window.romanticFX.triggerHeartExplosion(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => {
            window.romanticFX.triggerHeartExplosion(window.innerWidth / 3, window.innerHeight / 3);
        }, 300);
        setTimeout(() => {
            window.romanticFX.triggerHeartExplosion((window.innerWidth / 3) * 2, window.innerHeight / 3);
        }, 600);
    }

    // Spawn multiple floating screen hearts
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            spawnFloatingHearts(
                Math.random() * window.innerWidth,
                window.innerHeight - 50
            );
        }, i * 100);
    }
}

// SPAWN FLOATING SCREEN HEARTS
function spawnFloatingHearts(x, y) {
    const heartSymbols = ['❤️', '💖', '💕', '💗', '💓', '✨', '🌹'];
    const heart = document.createElement('div');
    heart.className = 'floating-screen-heart';
    heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    const dx = (Math.random() * 80 - 40) + 'px';
    const rot = (Math.random() * 60 - 30) + 'deg';
    heart.style.setProperty('--dx', dx);
    heart.style.setProperty('--rot', rot);

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 1800);
}

// PHOTO MODAL LOGIC
function openPhotoModal(imgSrc, caption) {
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');

    if (modal && modalImg && modalCaption) {
        modalImg.src = imgSrc;
        modalCaption.textContent = caption;
        modal.classList.add('active');

        if (window.romanticAudio) {
            window.romanticAudio.playSparkleSFX();
        }
    }
}

function closePhotoModal(e) {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Keyboard ESC to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePhotoModal();
    }
});
