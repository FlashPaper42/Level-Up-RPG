// Mob Data
const mobs = [
    { name: 'Forest Slime', level: 1, type: 'Common', image: 'slime' },
    { name: 'Shadow Wolf', level: 5, type: 'Uncommon', image: 'wolf' },
    { name: 'Crystal Golem', level: 10, type: 'Rare', image: 'golem' },
    { name: 'Fire Drake', level: 15, type: 'Epic', image: 'drake' },
    { name: 'Ancient Dragon', level: 25, type: 'Legendary', image: 'dragon' },
    { name: 'Void Specter', level: 30, type: 'Mythic', image: 'specter' },
    { name: 'Ice Phoenix', level: 35, type: 'Legendary', image: 'phoenix' },
    { name: 'Dark Overlord', level: 50, type: 'Boss', image: 'overlord' }
];

// DOM Elements
const carouselTrack = document.getElementById('carouselTrack');
const leftArrow = document.querySelector('.carousel-arrow-left');
const rightArrow = document.querySelector('.carousel-arrow-right');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const achievementPanel = document.getElementById('achievementPanel');
const achievementToggleBtn = document.getElementById('achievementToggleBtn');
const closeAchievementBtn = document.getElementById('closeAchievementBtn');

// Carousel State
let currentIndex = 0;
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

// Generate placeholder image with mob silhouette
function generateMobImage(mobType) {
    // Create a canvas-based placeholder for mob images
    const colors = {
        slime: '#22c55e',
        wolf: '#64748b',
        golem: '#8b5cf6',
        drake: '#ef4444',
        dragon: '#f59e0b',
        specter: '#6366f1',
        phoenix: '#06b6d4',
        overlord: '#dc2626'
    };
    
    const color = colors[mobType] || '#6366f1';
    
    // Return an SVG data URL for the placeholder
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <defs>
                <linearGradient id="grad-${mobType}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.6" />
                </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#grad-${mobType})" />
            <text x="100" y="110" text-anchor="middle" font-size="60" fill="white" font-family="Arial, sans-serif">
                ${getMobEmoji(mobType)}
            </text>
        </svg>
    `;
    
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function getMobEmoji(mobType) {
    const emojis = {
        slime: '🟢',
        wolf: '🐺',
        golem: '🗿',
        drake: '🦎',
        dragon: '🐉',
        specter: '👻',
        phoenix: '🔥',
        overlord: '👹'
    };
    return emojis[mobType] || '❓';
}

// Get type color
function getTypeColor(type) {
    const colors = {
        'Common': '#94a3b8',
        'Uncommon': '#22c55e',
        'Rare': '#3b82f6',
        'Epic': '#a855f7',
        'Legendary': '#f59e0b',
        'Mythic': '#ec4899',
        'Boss': '#dc2626'
    };
    return colors[type] || '#6366f1';
}

// Create Mob Cards
function createMobCards() {
    carouselTrack.innerHTML = '';
    
    mobs.forEach((mob, index) => {
        const card = document.createElement('div');
        card.className = 'mob-card';
        card.innerHTML = `
            <div class="mob-image-container">
                <img src="${generateMobImage(mob.image)}" alt="${mob.name}" class="mob-image" loading="lazy">
            </div>
            <div class="mob-info">
                <h3 class="mob-name">${mob.name}</h3>
                <p class="mob-level">Level ${mob.level}</p>
                <span class="mob-type" style="background-color: ${getTypeColor(mob.type)}">${mob.type}</span>
            </div>
        `;
        carouselTrack.appendChild(card);
    });
}

// Calculate card width including gap
function getCardWidth() {
    const card = carouselTrack.querySelector('.mob-card');
    if (!card) return 0;
    const style = window.getComputedStyle(carouselTrack);
    const gap = parseInt(style.gap) || 16;
    return card.offsetWidth + gap;
}

// Calculate visible cards
function getVisibleCards() {
    const container = document.querySelector('.carousel-track-container');
    const cardWidth = getCardWidth();
    if (cardWidth === 0) return 1;
    return Math.floor(container.offsetWidth / cardWidth) || 1;
}

// Update carousel position
function updateCarousel() {
    const cardWidth = getCardWidth();
    const offset = -currentIndex * cardWidth;
    carouselTrack.style.transform = `translateX(${offset}px)`;
    updateArrowStates();
}

// Update arrow disabled states
function updateArrowStates() {
    const maxIndex = Math.max(0, mobs.length - getVisibleCards());
    leftArrow.disabled = currentIndex <= 0;
    rightArrow.disabled = currentIndex >= maxIndex;
}

// Navigate carousel
function navigate(direction) {
    const maxIndex = Math.max(0, mobs.length - getVisibleCards());
    
    if (direction === 'left' && currentIndex > 0) {
        currentIndex--;
    } else if (direction === 'right' && currentIndex < maxIndex) {
        currentIndex++;
    }
    
    updateCarousel();
}

// Drag functionality
function handleDragStart(e) {
    isDragging = true;
    startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    scrollLeft = currentIndex * getCardWidth();
    carouselTrack.style.transition = 'none';
}

function handleDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
    const walk = startX - x;
    const newOffset = scrollLeft + walk;
    
    carouselTrack.style.transform = `translateX(${-newOffset}px)`;
}

function handleDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    carouselTrack.style.transition = 'transform 0.5s ease';
    
    const x = e.type === 'mouseup' ? e.pageX : (e.changedTouches ? e.changedTouches[0].pageX : startX);
    const walk = startX - x;
    const cardWidth = getCardWidth();
    const threshold = cardWidth / 3;
    
    const maxIndex = Math.max(0, mobs.length - getVisibleCards());
    
    if (walk > threshold && currentIndex < maxIndex) {
        currentIndex++;
    } else if (walk < -threshold && currentIndex > 0) {
        currentIndex--;
    }
    
    updateCarousel();
}

// Settings Modal
function openSettings() {
    settingsModal.classList.add('open');
}

function closeSettings() {
    settingsModal.classList.remove('open');
}

// Achievement Panel
function toggleAchievements() {
    achievementPanel.classList.toggle('open');
}

function closeAchievements() {
    achievementPanel.classList.remove('open');
}

// Event Listeners
leftArrow.addEventListener('click', () => navigate('left'));
rightArrow.addEventListener('click', () => navigate('right'));

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
});

achievementToggleBtn.addEventListener('click', toggleAchievements);
closeAchievementBtn.addEventListener('click', closeAchievements);

// Drag events for carousel
carouselTrack.addEventListener('mousedown', handleDragStart);
carouselTrack.addEventListener('mousemove', handleDragMove);
carouselTrack.addEventListener('mouseup', handleDragEnd);
carouselTrack.addEventListener('mouseleave', handleDragEnd);

// Touch events for mobile
carouselTrack.addEventListener('touchstart', handleDragStart, { passive: true });
carouselTrack.addEventListener('touchmove', handleDragMove, { passive: false });
carouselTrack.addEventListener('touchend', handleDragEnd);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (settingsModal.classList.contains('open')) {
        if (e.key === 'Escape') closeSettings();
        return;
    }
    
    if (achievementPanel.classList.contains('open')) {
        if (e.key === 'Escape') closeAchievements();
        return;
    }
    
    if (e.key === 'ArrowLeft') navigate('left');
    if (e.key === 'ArrowRight') navigate('right');
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const maxIndex = Math.max(0, mobs.length - getVisibleCards());
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        updateCarousel();
    }, 100);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createMobCards();
    updateCarousel();
});
