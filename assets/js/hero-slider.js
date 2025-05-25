// Simple Hero Slider
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hero Slider initializing...');
    
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    
    if (!slides.length) {
        console.log('No slides found');
        return;
    }
    
    console.log('Found', slides.length, 'slides');
    
    let currentSlide = 0;
    let isAnimating = false;
    let autoSlideTimer;
    
    // Functions
    function showSlide(index) {
        if (isAnimating || index === currentSlide) return;
        
        console.log('Switching to slide', index);
        isAnimating = true;
        
        // Hide current slide
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // Show new slide
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
        
        // Reset animation flag
        setTimeout(() => {
            isAnimating = false;
        }, 1000);
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideTimer = setInterval(nextSlide, 5000);
    }
    
    function stopAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }
    
    // Event Listeners
    if (nextBtn) {
        console.log('Next button found, adding click listener');
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Next button clicked');
            alert('다음 슬라이드로 이동');
            nextSlide();
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000);
        });
        
        // Also add onclick as backup
        nextBtn.onclick = function() {
            console.log('Next button onclick triggered');
            nextSlide();
        };
    } else {
        console.log('Next button NOT found!');
    }
    
    if (prevBtn) {
        console.log('Prev button found, adding click listener');
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Prev button clicked');
            alert('이전 슬라이드로 이동');
            prevSlide();
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000);
        });
        
        // Also add onclick as backup
        prevBtn.onclick = function() {
            console.log('Prev button onclick triggered');
            prevSlide();
        };
    } else {
        console.log('Prev button NOT found!');
    }
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
        console.log(`Adding click listener to indicator ${index}`);
        indicator.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Indicator', index, 'clicked');
            alert(`슬라이드 ${index + 1}로 이동`);
            showSlide(index);
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000);
        });
        
        // Also add onclick as backup
        indicator.onclick = function() {
            console.log(`Indicator ${index} onclick triggered`);
            showSlide(index);
        };
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000);
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoSlide();
            setTimeout(startAutoSlide, 5000);
        } else if (e.key === ' ') {
            e.preventDefault();
            if (autoSlideTimer) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        sliderContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
                stopAutoSlide();
                setTimeout(startAutoSlide, 5000);
            }
        }, { passive: true });
    }
    
    // Pause on hover (desktop only)
    if (!('ontouchstart' in window)) {
        const heroSlider = document.getElementById('hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopAutoSlide);
            heroSlider.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    // Pause when tab is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });
    
    // Initialize
    if (slides.length > 0) {
        slides[0].classList.add('active');
        indicators[0].classList.add('active');
        console.log('First slide activated');
        
        // Start auto-slide after 5 seconds
        setTimeout(startAutoSlide, 5000);
    }
    
    console.log('Hero Slider initialized successfully');
});

// Button click handlers (backup)
function playAudio() {
    console.log('Play audio clicked');
    window.open('https://notebooklm.google.com/notebook/8330c6eb-b28e-4cef-9ffe-5622eb98c4e3/audio', '_blank');
}

function openDemo() {
    console.log('Demo clicked');
    window.location.href = 'demo.html';
}

// Test button functionality after page load
window.addEventListener('load', function() {
    console.log('Page loaded, testing buttons...');
    
    const buttons = document.querySelectorAll('#hero-slider button');
    console.log('Found', buttons.length, 'buttons in hero slider');
    
    buttons.forEach((btn, index) => {
        console.log(`Button ${index}:`, {
            text: btn.textContent.trim(),
            onclick: btn.onclick,
            visible: getComputedStyle(btn).opacity,
            pointerEvents: getComputedStyle(btn).pointerEvents
        });
    });
});
