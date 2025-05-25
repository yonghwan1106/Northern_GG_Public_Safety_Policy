// Main JavaScript for Northern GG Public Safety Policy Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components (except hero slider - handled separately)
    initializeNavigation();
    initializeCharts();
    initializeScrollEffects();
    initializeMobileMenu();
    initializeTooltips();
    initializeProgressBars();
    initializeFAB();
});

// Hero Slider functionality
function initializeHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let isAnimating = false;
    let autoSlideTimer;
    
    // Auto-slide settings
    const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds
    const ANIMATION_DURATION = 1000; // 1 second
    
    function goToSlide(slideIndex, direction = 'next') {
        if (isAnimating || slideIndex === currentSlide) return;
        
        isAnimating = true;
        
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // Reset animation classes
        slides.forEach(slide => {
            slide.classList.remove('next', 'prev');
        });
        
        // Add direction class to new slide
        slides[slideIndex].classList.add(direction);
        
        // Force reflow to ensure the direction class is applied
        slides[slideIndex].offsetHeight;
        
        // Remove direction class and add active class
        setTimeout(() => {
            slides[slideIndex].classList.remove(direction);
            slides[slideIndex].classList.add('active');
            indicators[slideIndex].classList.add('active');
            
            currentSlide = slideIndex;
            
            // Animation finished
            setTimeout(() => {
                isAnimating = false;
            }, 100);
        }, 50);
        
        // Trigger slide animations
        triggerSlideAnimations(slideIndex);
    }
    
    function triggerSlideAnimations(slideIndex) {
        const slide = slides[slideIndex];
        
        // First, ensure all buttons are clickable
        const allButtons = slide.querySelectorAll('a, button');
        allButtons.forEach(btn => {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'all';
            btn.style.zIndex = '1001';
            btn.style.position = 'relative';
            btn.style.display = 'inline-block';
            btn.style.visibility = 'visible';
        });
        
        // Animate only non-button elements
        setTimeout(() => {
            const titleSpans = slide.querySelectorAll('h1 span');
            const paragraphs = slide.querySelectorAll('p');
            const statsBoxes = slide.querySelectorAll('.bg-white.bg-opacity-20');
            const gridItems = slide.querySelectorAll('.grid > div');
            
            // Animate title spans
            titleSpans.forEach((span, index) => {
                span.style.opacity = '0';
                setTimeout(() => {
                    span.style.animation = `fadeInUp 0.8s ease-out forwards`;
                    span.style.opacity = '1';
                }, index * 300);
            });
            
            // Animate paragraphs
            paragraphs.forEach((p, index) => {
                p.style.opacity = '0';
                setTimeout(() => {
                    p.style.animation = `fadeInUp 0.8s ease-out forwards`;
                    p.style.opacity = '1';
                }, 600 + index * 200);
            });
            
            // Animate stats boxes
            statsBoxes.forEach((box, index) => {
                box.style.opacity = '0';
                setTimeout(() => {
                    box.style.animation = `zoomIn 0.8s ease-out forwards`;
                    box.style.opacity = '1';
                }, 1200 + index * 200);
            });
            
            // Animate grid items
            gridItems.forEach((item, index) => {
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.animation = `fadeInUp 0.6s ease-out forwards`;
                    item.style.opacity = '1';
                }, 1000 + index * 100);
            });
        }, 200);
        
        // Force button containers to be visible
        const buttonContainers = slide.querySelectorAll('.flex');
        buttonContainers.forEach(container => {
            container.style.opacity = '1';
            container.style.pointerEvents = 'all';
            container.style.zIndex = '1000';
        });
    }
    
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex, 'next');
    }
    
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prevIndex, 'prev');
    }
    
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideTimer = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
    }
    
    function stopAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL);
        });
    }
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (index !== currentSlide) {
                const direction = index > currentSlide ? 'next' : 'prev';
                goToSlide(index, direction);
                stopAutoSlide();
                setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL);
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.activeElement === document.body || 
            document.querySelector('#hero-slider').contains(document.activeElement)) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    stopAutoSlide();
                    setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    stopAutoSlide();
                    setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL);
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    if (autoSlideTimer) {
                        stopAutoSlide();
                    } else {
                        startAutoSlide();
                    }
                    break;
            }
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;
    
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe right - go to previous slide
                prevSlide();
            } else {
                // Swipe left - go to next slide
                nextSlide();
            }
            stopAutoSlide();
            setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL);
        }
    }
    
    // Pause auto-slide on hover (desktop only)
    if (!('ontouchstart' in window)) {
        const heroSlider = document.getElementById('hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopAutoSlide);
            heroSlider.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    // Pause auto-slide when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });
    
    // Debug: Test button clicks immediately
    setTimeout(() => {
        const testButtons = document.querySelectorAll('.hero-btn');
        console.log('Found hero buttons:', testButtons.length);
        
        testButtons.forEach((btn, index) => {
            console.log(`Button ${index}:`, {
                opacity: getComputedStyle(btn).opacity,
                pointerEvents: getComputedStyle(btn).pointerEvents,
                zIndex: getComputedStyle(btn).zIndex,
                href: btn.href
            });
            
            // Force click test
            btn.addEventListener('click', function(e) {
                console.log('HERO BUTTON CLICKED!', this.href || this.textContent);
                alert('버튼이 클릭되었습니다: ' + (this.href || this.textContent));
            });
        });
    }, 1000);
    
    // Initialize first slide
    if (slides.length > 0) {
        slides[0].classList.add('active');
        indicators[0].classList.add('active');
        
        // Ensure first slide buttons are immediately clickable
        const firstSlideButtons = slides[0].querySelectorAll('a, button');
        firstSlideButtons.forEach(btn => {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'all';
            btn.style.zIndex = '100';
            btn.style.position = 'relative';
        });
        
        triggerSlideAnimations(0);
        
        // Start auto-slide
        setTimeout(startAutoSlide, AUTO_SLIDE_INTERVAL);
    }
    
    // Ensure all buttons in slider are always clickable
    function ensureButtonsClickable() {
        const allSliderButtons = document.querySelectorAll('#hero-slider a, #hero-slider button, .hero-btn');
        allSliderButtons.forEach(btn => {
            // Force all properties
            btn.style.pointerEvents = 'all';
            btn.style.zIndex = '1001';
            btn.style.position = 'relative';
            btn.style.opacity = '1';
            btn.style.display = 'inline-block';
            btn.style.visibility = 'visible';
            
            // Remove any CSS classes that might interfere
            btn.classList.remove('opacity-0', 'animate-fadeInUp');
            
            // Ensure click events work
            if (!btn.hasAttribute('data-clickable')) {
                btn.setAttribute('data-clickable', 'true');
                
                // Add direct click handler
                btn.addEventListener('click', function(e) {
                    console.log('Button clicked:', this.href || this.textContent);
                    // Don't prevent default - allow normal navigation
                }, { passive: false });
            }
        });
        
        // Also fix the containers
        const buttonContainers = document.querySelectorAll('#hero-slider .flex');
        buttonContainers.forEach(container => {
            container.style.opacity = '1';
            container.style.pointerEvents = 'all';
            container.style.zIndex = '1000';
            container.style.position = 'relative';
        });
    }
    
    // Call immediately and repeatedly
    ensureButtonsClickable();
    setInterval(ensureButtonsClickable, 500);
    
    // Force on window load
    window.addEventListener('load', ensureButtonsClickable);
    
    // Force on DOM content loaded
    document.addEventListener('DOMContentLoaded', ensureButtonsClickable);
    
    // Call immediately and on interval to ensure buttons stay clickable
    
    // Preload images for better performance
    slides.forEach((slide, index) => {
        if (index > 0) { // Skip first slide as it's already loaded
            const bgImage = slide.style.backgroundImage;
            const imageUrl = bgImage.match(/url\(["']?(.*?)["']?\)/);
            if (imageUrl && imageUrl[1]) {
                const img = new Image();
                img.src = imageUrl[1];
            }
        }
    });
    
    // Accessibility improvements
    const heroSlider = document.getElementById('hero-slider');
    if (heroSlider) {
        heroSlider.setAttribute('role', 'region');
        heroSlider.setAttribute('aria-label', '히어로 슬라이더');
        heroSlider.setAttribute('aria-live', 'polite');
    }
    
    // Add aria labels to navigation
    if (prevBtn) {
        prevBtn.setAttribute('aria-label', '이전 슬라이드');
    }
    if (nextBtn) {
        nextBtn.setAttribute('aria-label', '다음 슬라이드');
    }
    
    indicators.forEach((indicator, index) => {
        indicator.setAttribute('aria-label', `슬라이드 ${index + 1}로 이동`);
        indicator.setAttribute('role', 'button');
        indicator.setAttribute('tabindex', '0');
        
        // Add keyboard support for indicators
        indicator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                indicator.click();
            }
        });
    });
    
    // Return slider controls for external use
    return {
        goToSlide,
        nextSlide,
        prevSlide,
        startAutoSlide,
        stopAutoSlide,
        getCurrentSlide: () => currentSlide,
        getTotalSlides: () => slides.length
    };
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav item
                updateActiveNavItem(targetId);
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
    
    // Update active nav on scroll
    window.addEventListener('scroll', updateNavOnScroll);
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking on links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

// Chart initialization
function initializeCharts() {
    initializeTrendChart();
    initializeCrimeRateChart();
    initializeTimePatternChart();
    initializeCrimeTypeChart();
    initializeSafetyChart();
    initializeEfficiencyChart();
}

function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // 차트 컨테이너 크기 고정
    const container = ctx.parentElement;
    if (container) {
        container.style.height = '300px';
        container.style.maxHeight = '300px';
        container.style.overflow = 'hidden';
        container.style.position = 'relative';
    }
    
    // Canvas 크기 고정
    ctx.style.height = '300px !important';
    ctx.style.maxHeight = '300px !important';
    ctx.style.width = '100%';
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2023-01', '2023-04', '2023-07', '2023-10', '2024-01', '2024-04', '2024-07', '2024-10'],
            datasets: [
                {
                    label: '생활안전',
                    data: [45, 52, 78, 65, 58, 71, 85, 72],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '사회적약자보호',
                    data: [38, 45, 42, 55, 62, 68, 65, 71],
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '교통안전',
                    data: [52, 48, 55, 61, 58, 64, 69, 66],
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            aspectRatio: 2,
            resizeDelay: 0,
            layout: {
                padding: 10
            },
            plugins: {
                title: {
                    display: true,
                    text: '치안 관련 검색어 트렌드',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '검색량 지수'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '기간'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            onResize: function(chart, size) {
                // 리사이즈 시 최대 높이 제한
                if (size.height > 300) {
                    chart.canvas.style.height = '300px';
                }
            }
        }
    });
    
    // 차트 생성 후 크기 강제 고정
    setTimeout(() => {
        ctx.style.height = '300px !important';
        ctx.style.maxHeight = '300px !important';
        ctx.height = 300;
    }, 100);
    
    return chart;
}

// Chart 2: Crime Rate by Region
function initializeCrimeRateChart() {
    const ctx = document.getElementById('crimeRateChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['의정부시', '고양시', '파주시', '남양주시', '구리시', '양주시', '동두천시', '포천시', '가평군', '연천군'],
            datasets: [{
                label: '범죄 발생률 (건/천명)',
                data: [3.2, 2.8, 2.1, 1.9, 1.6, 1.4, 1.7, 1.2, 0.9, 0.7],
                backgroundColor: [
                    '#dc2626', '#f97316', '#eab308', 
                    '#f97316', '#eab308', '#16a34a',
                    '#f97316', '#eab308', '#16a34a', '#16a34a'
                ],
                borderColor: [
                    '#dc2626', '#f97316', '#eab308', 
                    '#f97316', '#eab308', '#16a34a',
                    '#f97316', '#eab308', '#16a34a', '#16a34a'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '경기북부 시군별 범죄 발생률 비교',
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '범죄 발생률 (건/천명)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '시군'
                    }
                }
            }
        }
    });
    
    return chart;
}

// Chart 3: Crime Pattern by Time
function initializeTimePatternChart() {
    const ctx = document.getElementById('timePatternChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [
                {
                    label: '생활안전',
                    data: [18, 8, 4, 6, 8, 12, 16, 22],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '교통안전',
                    data: [5, 3, 12, 25, 18, 22, 35, 15],
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '사회적약자보호',
                    data: [12, 6, 8, 14, 16, 18, 20, 16],
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '시간대별 범죄 발생 패턴',
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '발생 건수'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '시간대'
                    }
                }
            }
        }
    });
    
    return chart;
}

// Chart 4: Crime Type Distribution
function initializeCrimeTypeChart() {
    const ctx = document.getElementById('crimeTypeChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['생활안전', '교통안전', '사회적약자보호', '기타'],
            datasets: [{
                data: [45, 28, 22, 5],
                backgroundColor: [
                    '#3b82f6',
                    '#16a34a', 
                    '#f97316',
                    '#6b7280'
                ],
                borderColor: [
                    '#1d4ed8',
                    '#15803d',
                    '#ea580c',
                    '#4b5563'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '범죄 유형별 분포',
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
    
    return chart;
}

// Chart 5: Resident Safety Satisfaction
function initializeSafetyChart() {
    const ctx = document.getElementById('safetyChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['주간 안전도', '야간 안전도', '대중교통 안전', '아동 안전', '여성 안전', '노인 안전'],
            datasets: [
                {
                    label: '현재 수준',
                    data: [72, 47, 65, 68, 52, 59],
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: '#ef4444',
                    borderWidth: 2
                },
                {
                    label: '목표 수준',
                    data: [85, 75, 82, 88, 80, 85],
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: '#22c55e',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '주민 체감 안전도 조사 결과',
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
    
    return chart;
}

// Chart 6: Patrol Efficiency Projection
function initializeEfficiencyChart() {
    const ctx = document.getElementById('efficiencyChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['현재', '1개월', '3개월', '6개월', '1년', '2년', '3년'],
            datasets: [
                {
                    label: '순찰 효율성 (%)',
                    data: [100, 108, 115, 122, 128, 130, 130],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '대응 시간 개선 (%)',
                    data: [100, 105, 112, 125, 135, 140, 140],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '범죄 예방률 (%)',
                    data: [100, 103, 108, 115, 120, 125, 125],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'AI 시스템 도입 효과 예측',
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 95,
                    max: 145,
                    title: {
                        display: true,
                        text: '개선 지수 (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '도입 후 기간'
                    }
                }
            }
        }
    });
    
    return chart;
}

// Scroll effects
function initializeScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Observe cards
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Update active navigation item
function updateActiveNavItem(targetId) {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.classList.remove('nav-active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('nav-active');
        }
    });
}

// Update navigation on scroll
function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = '#' + section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            updateActiveNavItem(sectionId);
        }
    });
}

// Tooltip functionality
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.classList.add('tooltip');
    });
}

// Progress bars animation
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const targetWidth = progressBar.dataset.width || '0%';
                
                setTimeout(() => {
                    progressBar.style.width = targetWidth;
                }, 200);
            }
        });
    }, {
        threshold: 0.5
    });
    
    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });
}

// Floating Action Button
function initializeFAB() {
    // Create scroll to top button
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '<i class="fas fa-arrow-up"></i>';
    fab.setAttribute('aria-label', '맨 위로 이동');
    fab.style.display = 'none';
    
    document.body.appendChild(fab);
    
    // Show/hide FAB based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            fab.style.display = 'flex';
            fab.style.alignItems = 'center';
            fab.style.justifyContent = 'center';
        } else {
            fab.style.display = 'none';
        }
    });
    
    // Scroll to top functionality
    fab.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Statistics counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Intersection observer for counter animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.disconnect(); // Run only once
        }
    });
}, {
    threshold: 0.5
});

// Observe the effects section for counter animation
document.addEventListener('DOMContentLoaded', function() {
    const effectsSection = document.getElementById('effects');
    if (effectsSection) {
        counterObserver.observe(effectsSection);
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance optimization with better resize handling
const debouncedResize = debounce(function() {
    // Handle window resize events
    // Force chart container size for all charts
    const chartIds = ['trendChart', 'crimeRateChart', 'timePatternChart', 'crimeTypeChart', 'safetyChart', 'efficiencyChart'];
    chartIds.forEach(chartId => {
        const chartCanvas = document.getElementById(chartId);
        if (chartCanvas) {
            chartCanvas.style.height = '300px';
            chartCanvas.style.maxHeight = '300px';
        }
    });
    console.log('Window resized - all chart sizes fixed');
}, 250);

const throttledScroll = throttle(updateNavOnScroll, 16);

window.addEventListener('resize', debouncedResize);
window.addEventListener('scroll', throttledScroll);

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
    
    // Enter key activates buttons
    if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.target.click();
    }
});

// Focus management
function manageFocus() {
    const focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('focus-visible');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('focus-visible');
        });
    });
}

// Initialize focus management
document.addEventListener('DOMContentLoaded', manageFocus);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // You could send error reports to a logging service here
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(function(registration) {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(function(registrationError) {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}

// Console message for developers
console.log('%c경기북부 치안개선 정책 아이디어 웹사이트', 'color: #1e3a8a; font-size: 20px; font-weight: bold;');
console.log('%c개발자 도구를 사용하여 이 웹사이트를 검사하고 있습니다.', 'color: #3b82f6; font-size: 14px;');
console.log('%c자세한 정보는 README.md 파일을 참조하세요.', 'color: #6b7280; font-size: 12px;');