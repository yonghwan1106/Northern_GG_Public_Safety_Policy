// Demo Page JavaScript - Enhanced Version with Heatmap Controls (Re-checked & Full)
class DemoController {
    constructor() {
        this.simulationRunning = false;
        this.simulationTimer = null;
        this.elapsedSeconds = 0;
        this.patrolUnitsData = []; 
        this.reports = [];
        this.alerts = [];
        this.soundEnabled = true;
        this.sounds = {};
        this.patrolMap = null;
        this.riskMap = null;
        this.heatLayer = null;
        this.currentHeatmapData = [];
        this.baseHeatmapData = []; 
        this.predictionChart = null;
        this.performanceChart = null;
        this.heatmapAutoUpdateTimer = null;
        this.heatmapIntensity = 0.8; 
        this.heatmapRadius = 45;    
        this.heatmapBlur = 25;      
        
        this.init();
    }

    init() {
        this.initializeAOS();
        this.setupEventListeners();
        this.initializeMaps(); 
        this.updateHeatmapInitialSliderValues(); 
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.generateInitialData();
        this.initializeSounds();
        this.initializeOnboarding();
        this.updatePatrolUnitsUI(false);
        this.startHeatmapAutoUpdate(); 
    }
    
    updateHeatmapInitialSliderValues() {
        const intensitySlider = document.getElementById('heatmapIntensity');
        const intensityValueEl = document.getElementById('heatmapIntensityValue');
        const radiusSlider = document.getElementById('heatmapRadius');
        const radiusValueEl = document.getElementById('heatmapRadiusValue');

        if (intensitySlider && intensityValueEl) {
            intensitySlider.value = this.heatmapIntensity;
            intensityValueEl.textContent = this.heatmapIntensity.toFixed(2);
        }
        if (radiusSlider && radiusValueEl) {
            radiusSlider.value = this.heatmapRadius; 
            radiusValueEl.textContent = this.heatmapRadius;
        }
    }

    initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 800, easing: 'ease-in-out', once: true, mirror: false });
        }
    }

    initializeOnboarding() {
        this.onboardingStep = 0; this.maxOnboardingSteps = 4;
        const hasSeenOnboarding = localStorage.getItem('demoOnboardingSeen');
        const helpButton = document.getElementById('helpButton');
        if (!hasSeenOnboarding) { setTimeout(() => this.showOnboarding(), 1000); } 
        else { if (helpButton) helpButton.style.display = 'block'; }
        const onboardingSkip = document.getElementById('onboardingSkip');
        const onboardingNext = document.getElementById('onboardingNext');
        const onboardingPrev = document.getElementById('onboardingPrev');
        if (onboardingSkip) onboardingSkip.addEventListener('click', () => this.closeOnboarding());
        if (onboardingNext) onboardingNext.addEventListener('click', () => this.nextOnboardingStep());
        if (onboardingPrev) onboardingPrev.addEventListener('click', () => this.prevOnboardingStep());
        if (helpButton) { helpButton.addEventListener('click', () => { this.playSound('click'); this.showOnboarding(); });}
    }

    showOnboarding() {
        this.onboardingStep = 0; const overlay = document.getElementById('onboardingOverlay');
        if (overlay) { overlay.style.display = 'flex'; setTimeout(() => overlay.classList.add('active'), 10); this.updateOnboardingStep(); this.playSound('notification');}
    }

    closeOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.classList.remove('active'); setTimeout(() => { overlay.style.display = 'none'; }, 300);
            localStorage.setItem('demoOnboardingSeen', 'true');
            const helpButton = document.getElementById('helpButton');
            if (helpButton) helpButton.style.display = 'block';
            this.playSound('success');
        }
    }

    nextOnboardingStep() {
        this.playSound('click');
        if (this.onboardingStep < this.maxOnboardingSteps - 1) { this.onboardingStep++; this.updateOnboardingStep(); } 
        else { this.closeOnboarding(); }
    }

    prevOnboardingStep() {
        this.playSound('click');
        if (this.onboardingStep > 0) { this.onboardingStep--; this.updateOnboardingStep(); }
    }

    updateOnboardingStep() {
        document.querySelectorAll('.step-dot').forEach((dot, index) => dot.classList.toggle('active', index === this.onboardingStep));
        document.querySelectorAll('.onboarding-step').forEach((step, index) => step.classList.toggle('active', index === this.onboardingStep));
        const prevBtn = document.getElementById('onboardingPrev'); const nextBtn = document.getElementById('onboardingNext');
        if (prevBtn) prevBtn.style.display = this.onboardingStep > 0 ? 'inline-block' : 'none';
        if (nextBtn) nextBtn.textContent = this.onboardingStep === this.maxOnboardingSteps - 1 ? '시작하기!' : '다음';
    }

    initializeSounds() {
        this.sounds = {
            click: this.createOscillatorSound(800, 0.05, 0.1), notification: this.createOscillatorSound(600, 0.15, 0.1),
            success: this.createOscillatorSound(880, 0.2, 0.1), alert: this.createOscillatorSound(440, 0.3, 0.15),
            start: this.createOscillatorSound(660, 0.25, 0.1), map_marker_click: this.createOscillatorSound(700, 0.05, 0.08)
        };
    }

    createOscillatorSound(frequency, duration, volume = 0.1) {
        return {
            play: () => {
                if (!this.soundEnabled || (!window.AudioContext && !window.webkitAudioContext)) return;
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator(); const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
                    oscillator.frequency.value = frequency; oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
                    oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + duration);
                } catch (e) { console.warn('Sound playback failed:', e); }
            }
        };
    }

    playSound(soundName) { if (!this.soundEnabled || !this.sounds[soundName]) return; try { this.sounds[soundName].play(); } catch (e) { console.warn('Error playing sound:', soundName, e); } }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundIcon = document.getElementById('soundIcon'); const soundToggle = document.getElementById('soundToggle');
        if (soundIcon && soundToggle) {
            if (this.soundEnabled) { soundIcon.className = 'fas fa-volume-up'; soundToggle.classList.remove('muted'); this.playSound('click');} 
            else { soundIcon.className = 'fas fa-volume-mute'; soundToggle.classList.add('muted'); }
        }
        localStorage.setItem('demoSoundEnabled', this.soundEnabled);
    }

    setupEventListeners() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn'); const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) { mobileMenuBtn.addEventListener('click', () => { this.playSound('click'); mobileMenu.classList.toggle('hidden'); });}
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); const targetId = link.getAttribute('href').substring(1); this.scrollToSection(targetId); this.playSound('click');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) { mobileMenu.classList.add('hidden');}
            });
        });
        document.querySelectorAll('.demo-scroll-btn').forEach(button => {
            button.addEventListener('click', (e) => { const targetId = e.currentTarget.dataset.target; this.scrollToSection(targetId); this.playSound('click'); });
        });
        const soundToggle = document.getElementById('soundToggle'); if (soundToggle) soundToggle.addEventListener('click', () => this.toggleSound());
        const startPatrolBtn = document.getElementById('startPatrol'); const resetPatrolBtn = document.getElementById('resetPatrol');
        if (startPatrolBtn) startPatrolBtn.addEventListener('click', () => this.togglePatrolSimulation());
        if (resetPatrolBtn) resetPatrolBtn.addEventListener('click', () => this.resetPatrolSimulation());
        const submitReportBtn = document.getElementById('submitReport'); if (submitReportBtn) submitReportBtn.addEventListener('click', () => this.submitReport());
        document.querySelectorAll('.report-category').forEach(btn => { btn.addEventListener('click', (e) => { this.playSound('click'); this.selectReportCategory(e); });});
        const savedSoundSetting = localStorage.getItem('demoSoundEnabled');
        if (savedSoundSetting !== null) {
            this.soundEnabled = savedSoundSetting === 'true';
            const soundIcon = document.getElementById('soundIcon'); const soundToggleEl = document.getElementById('soundToggle');
            if (soundIcon && soundToggleEl && !this.soundEnabled) { soundIcon.className = 'fas fa-volume-mute'; soundToggleEl.classList.add('muted');}
        }

        const updatePredictionBtn = document.getElementById('updatePrediction');
        if (updatePredictionBtn) updatePredictionBtn.addEventListener('click', () => this.manualUpdatePredictions());

        const predictionTimeRangeSelect = document.getElementById('predictionTimeRange');
        if (predictionTimeRangeSelect) predictionTimeRangeSelect.addEventListener('change', (e) => this.handlePredictionTimeChange(e.target.value));

        const heatmapIntensitySlider = document.getElementById('heatmapIntensity');
        const heatmapRadiusSlider = document.getElementById('heatmapRadius');
        
        if (heatmapIntensitySlider) {
            heatmapIntensitySlider.addEventListener('input', (e) => {
                this.heatmapIntensity = parseFloat(e.target.value);
                document.getElementById('heatmapIntensityValue').textContent = this.heatmapIntensity.toFixed(2);
                this.updateHeatmapAppearance();
            });
        }
        if (heatmapRadiusSlider) {
            heatmapRadiusSlider.addEventListener('input', (e) => {
                this.heatmapRadius = parseInt(e.target.value, 10);
                this.heatmapBlur = Math.max(15, Math.min(35, Math.floor(this.heatmapRadius / 1.5))); 
                document.getElementById('heatmapRadiusValue').textContent = this.heatmapRadius;
                this.updateHeatmapAppearance();
            });
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const navbarHeight = document.querySelector('nav')?.offsetHeight || 64;
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        }
    }
    
    initializeMaps() {
        if (document.getElementById('patrolMap')) {
            try {
                this.patrolMap = L.map('patrolMap').setView([37.741, 127.047], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.patrolMap);
                this.addPatrolMarkers();
            } catch (e) { console.error('Patrol map initialization failed:', e); 
                document.getElementById('patrolMap').innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 p-4 text-center"><i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i><p>순찰 지도를 불러오는데 실패했습니다.</p></div>';
            }
        }

        if (document.getElementById('riskHeatmap')) {
            try {
                this.riskMap = L.map('riskHeatmap').setView([37.741, 127.047], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.riskMap);
                
                this.baseHeatmapData = [
                    // 의정부시 (고위험 지역)
                    [37.741, 127.047, 0.9], [37.742, 127.048, 0.85], [37.740, 127.046, 0.8], [37.743, 127.049, 0.75],
                    [37.738, 127.045, 0.7], [37.745, 127.050, 0.65],
                    
                    // 고양시 (일산서구, 일산동구, 덕양구)
                    [37.658, 126.834, 0.8], [37.659, 126.835, 0.75], [37.657, 126.833, 0.7], [37.660, 126.836, 0.65],
                    [37.648, 126.844, 0.6], [37.668, 126.824, 0.55], [37.650, 126.850, 0.5],
                    
                    // 파주시
                    [37.767, 126.780, 0.7], [37.768, 126.781, 0.65], [37.766, 126.779, 0.6], [37.770, 126.785, 0.55],
                    [37.765, 126.775, 0.5], [37.772, 126.788, 0.45],
                    
                    // 구리시
                    [37.593, 127.130, 0.6], [37.595, 127.132, 0.55], [37.591, 127.128, 0.5],
                    
                    // 남양주시
                    [37.636, 127.224, 0.65], [37.638, 127.226, 0.6], [37.634, 127.222, 0.55], [37.640, 127.230, 0.5],
                    [37.632, 127.218, 0.45], [37.642, 127.235, 0.4],
                    
                    // 양주시
                    [37.826, 127.045, 0.5], [37.828, 127.047, 0.45], [37.824, 127.043, 0.4],
                    
                    // 동두천시
                    [37.903, 127.060, 0.55], [37.905, 127.062, 0.5], [37.901, 127.058, 0.45],
                    
                    // 포천시
                    [38.146, 127.200, 0.4], [38.148, 127.202, 0.35], [38.144, 127.198, 0.3],
                    
                    // 가평군
                    [37.831, 127.511, 0.35], [37.833, 127.513, 0.3], [37.829, 127.509, 0.25],
                    
                    // 연천군
                    [38.096, 127.075, 0.3], [38.098, 127.077, 0.25], [38.094, 127.073, 0.2],
                    
                    // 추가 핫스팟 지역들
                    [37.800, 127.150, 0.4], [37.700, 126.900, 0.45], [37.600, 127.200, 0.35],
                    [37.750, 126.850, 0.5], [37.680, 127.100, 0.4], [37.720, 127.000, 0.35],
                    [37.780, 126.950, 0.3], [37.850, 127.100, 0.25], [37.950, 127.150, 0.2]
                ];
                this.heatmapBlur = Math.max(15, Math.min(35, Math.floor(this.heatmapRadius / 1.5))); 
                
                this.currentHeatmapData = this.generateHeatmapPoints(this.heatmapIntensity); 
                this.addRiskOverlayAndMarkers();

            } catch (e) { console.error('Risk heatmap initialization failed:', e); 
                document.getElementById('riskHeatmap').innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 p-4 text-center"><i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i><p>위험도 히트맵을 불러오는데 실패했습니다.</p></div>';
            }
        }
    }
    
    generateHeatmapPoints(globalIntensityFactor, timeOfDayFactor = 1.0) {
        return this.baseHeatmapData.map(p => {
            let intensity = p[2] * globalIntensityFactor * timeOfDayFactor;
            intensity += (Math.random() * 0.1 - 0.05); 
            return [p[0], p[1], Math.max(0, Math.min(1, intensity))]; 
        });
    }

    addRiskOverlayAndMarkers() { 
        if (typeof L.heatLayer !== 'undefined' && this.riskMap) { // Check if riskMap is initialized
            this.heatLayer = L.heatLayer(this.currentHeatmapData, {
                radius: this.heatmapRadius, 
                blur: this.heatmapBlur, 
                maxZoom: 17, 
                max: 1.0, 
                gradient: { 0.0: '#16a34a', 0.2: '#65a30d', 0.4: '#eab308', 0.6: '#f97316', 0.8: '#dc2626', 1.0: '#7c2d12' } 
            }).addTo(this.riskMap);
        }
        const riskAreas = [ 
            { lat: 37.741, lng: 127.047, risk: 0.9, area: '의정부역 주변', details: '야간 유흥가, 소매치기 주의' },
            { lat: 37.658, lng: 126.834, risk: 0.8, area: '일산 라페스타', details: '주말 밤 청소년 비행 우려' },
            { lat: 37.767, lng: 126.780, risk: 0.7, area: '파주 금촌 로데오거리', details: '음주 관련 사건 빈번' },
            { lat: 37.636, lng: 127.224, risk: 0.65, area: '남양주 다산신도시', details: '신도시 내 절도 사건 증가' },
            { lat: 37.593, lng: 127.130, risk: 0.6, area: '구리 돌다리역', details: '교통 요충지, 분실물 신고 많음' },
            { lat: 37.826, lng: 127.045, risk: 0.5, area: '양주 덕계역', details: '역 주변 상업지구' },
            { lat: 37.903, lng: 127.060, risk: 0.55, area: '동두천 중앙역', details: '유흥업소 밀집 지역' },
            { lat: 38.146, lng: 127.200, risk: 0.4, area: '포천시청 일대', details: '관공서 주변, 집회 가능성' },
            { lat: 37.700, lng: 126.900, risk: 0.45, area: '고양 화정지구', details: '대형마트 주변, 매치기 주의' },
            { lat: 37.750, lng: 126.850, risk: 0.5, area: '고양 대화역', details: '지하철역 주변 치안 취약' }
        ]; 
        if (this.riskMap) { // Check if riskMap is initialized before adding markers
            riskAreas.forEach(area => { 
                const riskIcon = L.divIcon({ html: `<div class="w-3 h-3 rounded-full border-2 border-white shadow-md" style="background-color: ${this.getRiskColor(area.risk)};"></div>`, className: 'custom-div-icon', iconSize: [12, 12], iconAnchor: [6, 6]});
                const marker = L.marker([area.lat, area.lng], { icon: riskIcon }).addTo(this.riskMap);
                marker.bindPopup(`<div class="p-1 text-sm" style="min-width:180px;"><strong class="block text-base">${area.area}</strong>위험도: <span class="font-semibold" style="color:${this.getRiskColor(area.risk)};">${(area.risk * 100).toFixed(0)}%</span><br><span class="text-xs text-gray-600">${area.details}</span></div>`, { className: 'custom-popup' });
                marker.on('click', () => this.playSound('map_marker_click'));
            });
        }
        this.updateHighRiskAreasUI(); 
    }

    updateHeatmapAppearance() {
        if (!this.heatLayer || !this.riskMap) return;
        
        this.currentHeatmapData = this.generateHeatmapPoints(this.heatmapIntensity); 

        this.heatLayer.setOptions({
            radius: this.heatmapRadius,
            blur: this.heatmapBlur, 
            max: 1.0 
        });
        this.heatLayer.setLatLngs(this.currentHeatmapData); 
        this.updateHighRiskAreasUI(); 
    }
    
    startHeatmapAutoUpdate() {
        if (this.heatmapAutoUpdateTimer) clearInterval(this.heatmapAutoUpdateTimer);
        this.heatmapAutoUpdateTimer = setInterval(() => {
            if (!this.riskMap || !this.heatLayer) return;

            const autoUpdatedData = this.currentHeatmapData.map(p => {
                let newIntensity = p[2] + (Math.random() * 0.04 - 0.02); 
                return [p[0], p[1], Math.max(0, Math.min(1, newIntensity))];
            });
            
            this.currentHeatmapData = autoUpdatedData;
            this.heatLayer.setLatLngs(this.currentHeatmapData);
            if (Math.random() < 0.2) { 
                 this.updateHighRiskAreasUI();
            }
            
            const statusEl = document.getElementById('heatmapAutoUpdateStatus');
            if(statusEl) statusEl.classList.toggle('opacity-50'); 

        }, 15000); 
    }
    
    stopHeatmapAutoUpdate() {
        if (this.heatmapAutoUpdateTimer) clearInterval(this.heatmapAutoUpdateTimer);
        this.heatmapAutoUpdateTimer = null;
        const statusEl = document.getElementById('heatmapAutoUpdateStatus');
        if(statusEl) { statusEl.textContent = '(자동 업데이트 중지됨)'; statusEl.classList.remove('opacity-50');}
    }

    manualUpdatePredictions() { 
        this.playSound('click');
        this.stopHeatmapAutoUpdate(); 
        this.showNotification('AI 예측 모델 수동 업데이트 중...', 'info');
        
        const heatmapContainer = document.querySelector('#riskHeatmap');
        if (heatmapContainer) heatmapContainer.classList.add('heatmap-updating');

        setTimeout(() => {
            if (this.predictionChart) {
                this.predictionChart.data.datasets[0].data = this.predictionChart.data.datasets[0].data.map(() => Math.random() * 60 + 20);
                this.predictionChart.update();
            }
            this.currentHeatmapData = this.generateHeatmapPoints(this.heatmapIntensity, Math.random() + 0.5); 
            this.updateHeatmapAppearance(); 
            
            if (heatmapContainer) heatmapContainer.classList.remove('heatmap-updating');
            this.showNotification('AI 예측 모델 수동 업데이트 완료', 'success');
            this.startHeatmapAutoUpdate(); 
            const statusEl = document.getElementById('heatmapAutoUpdateStatus');
            if(statusEl) statusEl.textContent = '(자동 업데이트 활성)';

        }, 1500);
    }

    handlePredictionTimeChange(timeRange) {
        this.playSound('click');
        this.stopHeatmapAutoUpdate();
        this.showNotification(`${timeRange} 예측 데이터로 전환합니다.`, 'info');

        let timeOfDayFactor = 1.0; 
        let intensityMultiplier = 1.0; 
        let newRadius = this.heatmapRadius; 
        let newBlur = this.heatmapBlur;     

        switch(timeRange) {
            case '1h': 
                timeOfDayFactor = 1.2 + (Math.random() * 0.3); 
                intensityMultiplier = 1.1;
                newRadius = 22; 
                newBlur = Math.max(5, Math.floor(newRadius / 2)); 
                break;
            case '6h': 
                timeOfDayFactor = 1.0 + (Math.random() * 0.2);
                intensityMultiplier = 1.05;
                newRadius = 28;
                newBlur = Math.max(8, Math.floor(newRadius / 1.8));
                break;
            case '24h': 
                timeOfDayFactor = 1.0;
                intensityMultiplier = 1.0;
                newRadius = 32; 
                newBlur = Math.max(10, Math.floor(newRadius / 1.8));
                break;
            case '7d': 
                timeOfDayFactor = 0.8 + (Math.random() * 0.2); 
                intensityMultiplier = 0.9;
                newRadius = 38; 
                newBlur = Math.max(15, Math.floor(newRadius / 1.7)); 
                break;
        }
        
        this.heatmapRadius = newRadius;
        this.heatmapBlur = newBlur;

        const radiusSlider = document.getElementById('heatmapRadius');
        if (radiusSlider) {
            radiusSlider.value = this.heatmapRadius;
            document.getElementById('heatmapRadiusValue').textContent = this.heatmapRadius;
        }
        
        this.currentHeatmapData = this.generateHeatmapPoints(this.heatmapIntensity * intensityMultiplier, timeOfDayFactor);
        this.updateHeatmapAppearance(); 
        
        this.startHeatmapAutoUpdate(); 
        const statusEl = document.getElementById('heatmapAutoUpdateStatus');
        if(statusEl) statusEl.textContent = '(자동 업데이트 활성)';
    }

    addPatrolMarkers() {
        const patrolPoints = [
            { lat: 37.741, lng: 127.047, name: '의정부시청', unit: 'P-001', status: '대기', icon: 'fa-car' }, { lat: 37.658, lng: 126.834, name: '고양시청', unit: 'P-002', status: '순찰중', icon: 'fa-person-walking-arrow-right' },
            { lat: 37.767, lng: 126.780, name: '파주시청', unit: 'P-003', status: '대기', icon: 'fa-car' }, { lat: 37.593, lng: 127.130, name: '구리시청', unit: 'P-004', status: '출동', icon: 'fa-truck-medical' },
            { lat: 37.636, lng: 127.224, name: '남양주시청', unit: 'P-005', status: '순찰중', icon: 'fa-person-walking-arrow-right' }, { lat: 37.826, lng: 127.045, name: '양주시청', unit: 'P-006', status: '대기', icon: 'fa-car' },
            { lat: 37.903, lng: 127.060, name: '동두천시청', unit: 'P-007', status: '대기', icon: 'fa-car' }, { lat: 38.146, lng: 127.200, name: '포천시청', unit: 'P-008', status: '순찰중', icon: 'fa-person-walking-arrow-right' }
        ];
        this.patrolUnitsData = patrolPoints.map(point => {
            const patrolIcon = L.divIcon({ html: `<div class="p-1 bg-police-blue text-white rounded-full shadow-md flex items-center justify-center w-8 h-8 border-2 border-white"><i class="fas ${point.icon} text-sm"></i></div>`, className: 'custom-patrol-icon', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]});
            if (this.patrolMap) { // Ensure map is initialized
                const marker = L.marker([point.lat, point.lng], { icon: patrolIcon }).addTo(this.patrolMap);
                marker.bindPopup(`<div class="p-1 text-sm"><strong class="block text-base">${point.unit} (${point.name})</strong>상태: <span class="font-semibold" data-unit-status="${point.unit}">${point.status}</span><br>최근 활동: <span class="text-gray-600" data-unit-activity="${point.unit}">정보 없음</span></div>`, { className: 'custom-popup' });
                marker.on('click', () => this.playSound('map_marker_click'));
                return { ...point, marker, lastActivity: '정보 없음' };
            }
            return { ...point, marker: null, lastActivity: '정보 없음' }; // Fallback if map not ready
        });
        this.updatePatrolUnitsUI(false);
    }

    getRiskColor(riskValue) { if (riskValue >= 0.8) return '#7c2d12'; if (riskValue >= 0.6) return '#dc2626'; if (riskValue >= 0.4) return '#f97316'; if (riskValue >= 0.2) return '#eab308'; return '#16a34a'; }
    
    initializeCharts() { this.initPredictionChart(); this.initPerformanceChart(); }
    
    initPredictionChart() {
        const ctx = document.getElementById('predictionChart')?.getContext('2d'); if (!ctx) return;
        try { const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
            this.predictionChart = new Chart(ctx, { type: 'line', data: { labels: hours, datasets: [{ label: '예측 위험도 (%)', data: hours.map(() => Math.random() * 60 + 20), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.3, fill: true, pointRadius: 2, pointHoverRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } } });
        } catch (e) { console.error('Prediction chart init failed:', e); }
    }
    
    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart')?.getContext('2d'); if (!ctx) return;
        try { const timeLabels = Array.from({length: 12}, (_, i) => { const t = new Date(); t.setHours(t.getHours() - (11 - i)); return `${String(t.getHours()).padStart(2, '0')}:00`; });
            this.performanceChart = new Chart(ctx, { type: 'bar', data: { labels: timeLabels, datasets: [ { label: '대응시간 (분)', type: 'line', tension: 0.3, data: Array.from({length: 12}, () => Math.random() * 10 + 5), borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', yAxisID: 'y', pointRadius: 2, pointHoverRadius: 5, fill: true }, { label: '순찰 효율성 (%)', type: 'bar', data: Array.from({length: 12}, () => Math.random() * 20 + 75), backgroundColor: 'rgba(22, 163, 74, 0.6)', borderColor: '#16a34a', yAxisID: 'y1', barPercentage: 0.7 } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { type: 'linear', display: true, position: 'left', beginAtZero: true, max: 20, title: { display: true, text: '분' } }, y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, max: 100, title: { display: true, text: '%' }, grid: { drawOnChartArea: false } } } } });
        } catch (e) { console.error('Performance chart init failed:', e); }
    }

    togglePatrolSimulation() { 
        this.playSound(this.simulationRunning ? 'click' : 'start'); 
        const btn = document.getElementById('startPatrol'); 
        if (!this.simulationRunning) { 
            this.startPatrolSimulation(); 
            if (btn) { btn.innerHTML = '<i class="fas fa-pause mr-2"></i>순찰 중지'; btn.classList.replace('bg-blue-600', 'bg-red-600'); btn.classList.replace('hover:bg-blue-700', 'hover:bg-red-700'); } 
        } else { 
            this.stopPatrolSimulation(); 
            if (btn) { btn.innerHTML = '<i class="fas fa-play mr-2"></i>순찰 시작'; btn.classList.replace('bg-red-600', 'bg-blue-600'); btn.classList.replace('hover:bg-red-700', 'hover:bg-blue-700'); } 
        } 
    }

    startPatrolSimulation() { 
        this.simulationRunning = true; this.elapsedSeconds = 0; 
        document.getElementById('recentActivity').innerHTML = ''; 
        document.getElementById('patrolUnits').innerHTML = ''; 
        this.updatePatrolUnitsUI(true); 
        this.addActivity('순찰 시뮬레이션 시작됨', 'info', 'fa-play-circle'); 
        this.simulationTimer = setInterval(() => { this.elapsedSeconds++; this.updateSimulationTime(this.elapsedSeconds); this.updatePatrolStatusOnTick(); if (Math.random() < 0.2) this.generateRandomEvent(); }, 2000); 
    }

    stopPatrolSimulation() { 
        this.simulationRunning = false; 
        if (this.simulationTimer) clearInterval(this.simulationTimer); 
        this.simulationTimer = null; 
        this.addActivity('순찰 시뮬레이션 중지됨', 'warning', 'fa-pause-circle'); 
        this.updatePatrolUnitsUI(false); 
    }

    resetPatrolSimulation() { 
        this.playSound('click'); 
        this.stopPatrolSimulation(); 
        this.elapsedSeconds = 0; 
        this.updateSimulationTime(0); 
        document.getElementById('processedReports').textContent = '0'; 
        document.getElementById('preventedIncidents').textContent = '0'; 
        document.getElementById('recentActivity').innerHTML = '<p class="text-sm text-gray-500">시뮬레이션 활동이 기록됩니다.</p>'; 
        document.getElementById('patrolUnits').innerHTML = '<p class="text-sm text-gray-500">시뮬레이션 시작 시 표시됩니다.</p>'; 
        const startBtn = document.getElementById('startPatrol'); 
        if (startBtn) { startBtn.innerHTML = '<i class="fas fa-play mr-2"></i>순찰 시작'; startBtn.classList.replace('bg-red-600', 'bg-blue-600'); startBtn.classList.replace('hover:bg-red-700', 'hover:bg-blue-700');} 
        this.addActivity('시뮬레이션 초기화됨', 'info', 'fa-undo'); 
        this.updatePatrolUnitsUI(false); 
    }

    updateSimulationTime(seconds) { 
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0'); 
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'); 
        const s = String(seconds % 60).padStart(2, '0'); 
        const simTimeEl = document.getElementById('simTime');
        if (simTimeEl) simTimeEl.textContent = `${h}:${m}:${s}`; 
    }

    updatePatrolUnitsUI(isRunning) { 
        const container = document.getElementById('patrolUnits'); 
        if (!container) return; 
        if (!this.patrolUnitsData || this.patrolUnitsData.length === 0) { container.innerHTML = '<p class="text-sm text-gray-500">순찰대 정보가 없습니다.</p>'; return; } 
        if (!isRunning && !this.simulationRunning) { container.innerHTML = '<p class="text-sm text-gray-500">시뮬레이션 시작 시 순찰대 현황이 표시됩니다.</p>'; return; } 
        container.innerHTML = ''; 
        this.patrolUnitsData.slice(0, 5).forEach(unit => { 
            if (isRunning) { 
                const rand = Math.random(); 
                if (rand < 0.6) { unit.status = '대기'; unit.icon = 'fa-car'; } 
                else if (rand < 0.9) { unit.status = '순찰중'; unit.icon = 'fa-person-walking-arrow-right'; } 
                else { unit.status = '출동'; unit.icon = 'fa-truck-medical'; } 
            } 
            let statusColorClass; 
            if (unit.status === '대기') statusColorClass = 'bg-green-500'; 
            else if (unit.status === '순찰중') statusColorClass = 'bg-blue-500'; 
            else statusColorClass = 'bg-orange-500'; 
            container.insertAdjacentHTML('beforeend', `<div class="flex justify-between items-center p-2 bg-white rounded border hover:shadow-md transition-shadow"><div class="flex items-center"><i class="fas ${unit.icon} mr-3 text-police-navy"></i><span class="text-sm font-medium">${unit.unit}</span></div><div class="flex items-center"><div class="w-2.5 h-2.5 ${statusColorClass} rounded-full mr-2"></div><span class="text-xs text-gray-700">${unit.status}</span></div></div>`); 
        }); 
    }

    updatePatrolStatusOnTick() { 
        if (!this.simulationRunning) return; 
        this.updatePatrolUnitsUI(true); 
        const activePatrolsEl = document.getElementById('activePatrols');
        if (activePatrolsEl) activePatrolsEl.textContent = this.patrolUnitsData.length; 
        
        const coverageRateEl = document.getElementById('coverageRate');
        if (coverageRateEl) {
            const coverage = Math.min(95, parseFloat(coverageRateEl.textContent) + (Math.random() * 2 - 1)); 
            coverageRateEl.textContent = `${coverage.toFixed(0)}%`; 
        }

        const avgResponsePatrolEl = document.getElementById('avgResponsePatrol');
        if (avgResponsePatrolEl) {
            let respTime = parseFloat(avgResponsePatrolEl.textContent); 
            respTime += (Math.random() * 0.5 - 0.25); 
            respTime = Math.max(5, Math.min(20, respTime)); 
            avgResponsePatrolEl.textContent = respTime.toFixed(1); 
        }

        if (Math.random() < 0.3) { 
            const randomUnit = this.patrolUnitsData[Math.floor(Math.random() * this.patrolUnitsData.length)]; 
            if (randomUnit && randomUnit.marker && randomUnit.marker.getPopup()) { 
                 const popupContentEl = randomUnit.marker.getPopup().getContentElement(); 
                 if (popupContentEl) { 
                    const statusSpan = popupContentEl.querySelector(`[data-unit-status="${randomUnit.unit}"]`);
                    const activitySpan = popupContentEl.querySelector(`[data-unit-activity="${randomUnit.unit}"]`);
                    if (statusSpan) statusSpan.textContent = randomUnit.status; 
                    if (activitySpan) activitySpan.textContent = randomUnit.lastActivity; 
                } 
            } 
        } 
    }

    generateRandomEvent() { 
        if (!this.simulationRunning) return; 
        const eventTypes = [ { type: 'info', message: '새로운 순찰 경로 AI 추천', icon: 'fa-route' }, { type: 'info', message: 'CCTV 이상 감지 알림 확인', icon: 'fa-video' }, { type: 'success', message: '예방 순찰 중 위험요소 제거', icon: 'fa-shield-alt' }, { type: 'warning', message: '특정 지역 드론 지원 요청', icon: 'fa-helicopter' }]; 
        const randomUnit = this.patrolUnitsData[Math.floor(Math.random() * this.patrolUnitsData.length)]; 
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]; 
        const fullMessage = `${randomUnit.unit}: ${randomEvent.message}`; 
        this.addActivity(fullMessage, randomEvent.type, randomEvent.icon); 
        randomUnit.lastActivity = randomEvent.message; 
        if (randomEvent.type === 'success') { 
            const preventedIncidentsEl = document.getElementById('preventedIncidents');
            if(preventedIncidentsEl) {
                const prevented = parseInt(preventedIncidentsEl.textContent) + 1; 
                preventedIncidentsEl.textContent = prevented; 
            }
        } 
    }

    addActivity(message, type = 'info', icon = 'fa-info-circle') { 
        const container = document.getElementById('recentActivity'); 
        if (!container) return; 
        if (container.querySelector('p.text-gray-500')) container.innerHTML = ''; // Remove placeholder if it exists
        const time = new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', second: '2-digit'}); 
        let iconColorClass = 'text-blue-500'; 
        if (type === 'warning') iconColorClass = 'text-orange-500'; 
        else if (type === 'success') iconColorClass = 'text-green-500'; 
        else if (type === 'error') iconColorClass = 'text-red-500'; 
        container.insertAdjacentHTML('afterbegin', `<div class="flex items-start space-x-2 p-2.5 bg-white rounded border hover:shadow-sm transition-shadow"><i class="fas ${icon} ${iconColorClass} mt-1 fa-fw"></i><div class="flex-1"><p class="text-sm text-gray-800">${message}</p><p class="text-xs text-gray-500">${time}</p></div></div>`); 
        if (container.children.length > 7) container.removeChild(container.lastChild); 
    }

    updateHighRiskAreasUI() { 
        const container = document.getElementById('highRiskAreas'); 
        if (!container) return; 
        container.innerHTML = ''; 
        if (!this.currentHeatmapData || this.currentHeatmapData.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">위험 지역 정보가 없습니다.</p>';
            return;
        }
        const sortedRisks = [...this.currentHeatmapData].sort((a, b) => b[2] - a[2]); 
        const topRisks = sortedRisks.slice(0, 3); 
        const areaNames = ['의정부역 일대', '고양 화정지구', '파주 운정신도시', '남양주 별내지구', '구리 돌다리', 
                          '양주 덕계지구', '동두천 중앙동', '포천시청 인근', '고양 일산서구', '의정부 녹양동']; 
        topRisks.forEach((riskPoint, index) => { 
            const riskPercent = (riskPoint[2] * 100).toFixed(0); 
            let bgColor = 'bg-yellow-100'; let textColor = 'text-yellow-800'; 
            if (riskPoint[2] >= 0.8) { bgColor = 'bg-red-100'; textColor = 'text-red-800'; } 
            else if (riskPoint[2] >= 0.5) { bgColor = 'bg-orange-100'; textColor = 'text-orange-800'; } 
            const areaName = areaNames[index % areaNames.length]; 
            const details = ['야간 유흥가', '상업 밀집지역', '공원 주변', '학교 근처', '교통 요충지', 
                            '신도시 지역', '전통시장 인근', '관공서 주변', '대학가', '주거 밀집지역']; 
            container.insertAdjacentHTML('beforeend', `<div class="bg-white rounded-lg p-3 border hover:shadow-sm transition-shadow"><div class="flex justify-between items-center mb-1"><span class="text-sm font-medium text-gray-800">${areaName} (예시)</span><span class="text-xs ${bgColor} ${textColor} px-2 py-1 rounded-full">${riskPercent}%</span></div><p class="text-xs text-gray-600">${details[index % details.length]} 관련 위험요소 증가</p></div>`); 
        }); 
    }

    selectReportCategory(event) { 
        document.querySelectorAll('.report-category').forEach(btn => { btn.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100'); }); 
        event.currentTarget.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100'); 
    }

    submitReport() { 
        this.playSound('alert'); 
        const descriptionEl = document.getElementById('reportDescription'); 
        const description = descriptionEl.value.trim(); 
        const selectedCategory = document.querySelector('.report-category.ring-2'); 
        if (!selectedCategory) { this.showNotification('신고 유형을 선택해주세요', 'error'); return; } 
        if (!description) { this.showNotification('신고 내용을 입력해주세요', 'error'); return; } 
        const reportStatus = document.getElementById('reportStatus'); 
        reportStatus.textContent = '신고 접수 중...'; 
        reportStatus.className = 'text-center text-sm text-orange-500 h-5 animate-pulse'; 
        setTimeout(() => { 
            reportStatus.textContent = '신고 접수 완료! 순찰대 배치됨.'; 
            reportStatus.className = 'text-center text-sm text-green-500 h-5'; 
            descriptionEl.value = ''; 
            document.querySelectorAll('.report-category.ring-2').forEach(btn => { btn.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100'); }); 
            this.addLiveReport(selectedCategory.querySelector('div').textContent, description); 
            const todayReportsEl = document.getElementById('todayReports'); 
            if (todayReportsEl) todayReportsEl.textContent = parseInt(todayReportsEl.textContent) + 1; 
            
            const avgResponseTimeReportEl = document.getElementById('avgResponseTimeReport');
            if (avgResponseTimeReportEl) {
                let avgTime = parseFloat(avgResponseTimeReportEl.textContent); 
                avgTime = Math.max(3, avgTime - Math.random() * 0.5).toFixed(1); 
                avgResponseTimeReportEl.textContent = avgTime; 
            }
            setTimeout(() => { reportStatus.textContent = '신고 준비 완료'; reportStatus.className = 'text-center text-sm text-gray-500 h-5'; }, 3000); 
        }, 2000); 
        this.showNotification('신고가 성공적으로 접수되었습니다.', 'success'); 
    }

    addLiveReport(category, details) { 
        const container = document.getElementById('liveReports'); 
        if (!container) return; 
        if (container.querySelector('p.text-gray-500')) container.innerHTML = ''; // Remove placeholder
        const locations = ['의정부시 가능동', '고양시 일산서구', '파주시 운정1동', '구리시 교문동', '남양주시 다산동']; 
        const location = locations[Math.floor(Math.random() * locations.length)]; 
        const time = new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}); 
        const statusColors = { "처리중": "bg-orange-100 text-orange-800", "대응완료": "bg-green-100 text-green-800" }; 
        const currentStatus = Math.random() > 0.3 ? "처리중" : "대응완료"; 
        container.insertAdjacentHTML('afterbegin', `<div class="flex justify-between items-center p-3 bg-white rounded border hover:shadow-sm transition-shadow"><div><div class="text-sm font-medium text-gray-800">${category}</div><p class="text-xs text-gray-600 truncate" style="max-width:150px;" title="${details}">${details}</p><div class="text-xs text-gray-500">${location} • ${time}</div></div><span class="text-xs ${statusColors[currentStatus]} px-2 py-1 rounded-full whitespace-nowrap">${currentStatus}</span></div>`); 
        if (container.children.length > 5) container.removeChild(container.lastChild); 
        if(this.simulationRunning && currentStatus === "처리중") { 
            const processedReportsEl = document.getElementById('processedReports');
            if(processedReportsEl) {
                const processed = parseInt(processedReportsEl.textContent) + 1; 
                processedReportsEl.textContent = processed; 
            }
        } 
    }

    startRealTimeUpdates() { 
        this.updateMonitorStats(); 
        setInterval(() => { 
            if (Math.random() < 0.5) this.updateSystemAlerts(); 
            if (Math.random() < 0.3) this.updateActivePatrolsListMonitor(); 
            if (this.performanceChart && Math.random() < 0.7) this.updatePerformanceChartData(); 
            this.updateLastUpdateTime(); 
            this.updateMonitorStats(); 
        }, 5000); 
    }

    updateMonitorStats() { 
        const totalPatrolsMonitorEl = document.getElementById('totalPatrolsMonitor');
        if (totalPatrolsMonitorEl) totalPatrolsMonitorEl.textContent = this.patrolUnitsData.length; 
        
        const activeIncidentsMonitorEl = document.getElementById('activeIncidentsMonitor');
        if (activeIncidentsMonitorEl) {
            const activeIncidents = Math.floor(Math.random() * 5); 
            activeIncidentsMonitorEl.textContent = activeIncidents; 
        }

        const riskLevels = ['낮음', '보통', '높음', '매우높음']; 
        const riskProgress = [25, 50, 75, 90]; 
        const randomRiskIndex = Math.floor(Math.random() * riskLevels.length); 
        const riskLevelMonitorEl = document.getElementById('riskLevelMonitor');
        if (riskLevelMonitorEl) riskLevelMonitorEl.textContent = riskLevels[randomRiskIndex]; 
        
        const riskBar = document.querySelector('#riskLevelMonitor + p + div div.bg-white'); 
        if(riskBar) riskBar.style.width = `${riskProgress[randomRiskIndex]}%`; 
        
        const systemHealthEl = document.getElementById('systemHealth');
        if (systemHealthEl) {
            let health = parseFloat(systemHealthEl.textContent); 
            health += (Math.random() * 0.2 - 0.1); 
            health = Math.max(98.0, Math.min(99.9, health)).toFixed(1); 
            systemHealthEl.textContent = `${health}%`; 
        }
    }

    updateSystemAlerts() { 
        const container = document.getElementById('systemAlerts'); 
        if (!container) return; 
        if (container.querySelector('p.text-gray-400')) container.innerHTML = ''; // Remove placeholder
        const alertTypes = [ { type: 'info', icon: 'fa-info-circle', color: 'border-blue-400', message: 'AI 모델 정확도 87.5% 유지 중' }, { type: 'warning', icon: 'fa-exclamation-triangle', color: 'border-yellow-400', message: '고양시 일산동구 야간 위험도 소폭 상승 예상' }, { type: 'success', icon: 'fa-check-circle', color: 'border-green-400', message: '순찰대 P-005, 신고 사건 (#S1204) 처리 완료' }, { type: 'info', icon: 'fa-traffic-light', color: 'border-blue-400', message: '교통정보 시스템 연동 데이터 업데이트됨' }]; 
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)]; 
        const time = new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}); 
        container.insertAdjacentHTML('afterbegin', `<div class="flex items-center space-x-3 p-2.5 bg-gray-800 rounded-md border-l-4 ${alert.color} hover:bg-gray-700 transition-colors"><i class="fas ${alert.icon} ${alert.color.replace('border-', 'text-')} fa-fw"></i><div class="flex-1"><p class="text-sm text-gray-100">${alert.message}</p><p class="text-xs text-gray-400">${time}</p></div></div>`); 
        if (container.children.length > 6) container.removeChild(container.lastChild); 
    }

    updateActivePatrolsListMonitor() { 
        const container = document.getElementById('activePatrolsList'); 
        if (!container) return; 
        if (container.querySelector('p.text-gray-500')) container.innerHTML = ''; // Remove placeholder
        container.innerHTML = ''; 
        this.patrolUnitsData.slice(0, 4).forEach(unit => { 
            const statuses = ['대기중', '순찰중', '출동중', '현장도착']; 
            const status = statuses[Math.floor(Math.random() * statuses.length)]; 
            const statusColor = status === '대기중' ? 'bg-green-500' : status === '순찰중' ? 'bg-blue-500' : status === '출동중' ? 'bg-orange-500' : 'bg-red-500'; 
            container.innerHTML += `<div class="flex justify-between items-center p-2.5 bg-white rounded border hover:shadow-sm transition-shadow"><div><div class="text-sm font-medium text-gray-800">${unit.unit} <span class="text-xs text-gray-500">(${unit.name})</span></div><div class="text-xs text-gray-600">배정사건: ${Math.random() > 0.5 ? `#S${Math.floor(Math.random()*1000)+1000}` : '없음'}</div></div><div class="flex items-center"><div class="w-2.5 h-2.5 ${statusColor} rounded-full mr-2"></div><span class="text-xs text-gray-700">${status}</span></div></div>`; 
        }); 
    }

    updatePerformanceChartData() { 
        if (!this.performanceChart) return; 
        this.performanceChart.data.labels.shift(); 
        this.performanceChart.data.datasets.forEach(dataset => dataset.data.shift()); 
        const newTime = new Date(); 
        this.performanceChart.data.labels.push(`${String(newTime.getHours()).padStart(2, '0')}:00`); 
        this.performanceChart.data.datasets[0].data.push(Math.random() * 10 + 5); 
        this.performanceChart.data.datasets[1].data.push(Math.random() * 20 + 75); 
        this.performanceChart.update('quiet'); 
    }

    updateLastUpdateTime() { 
        const element = document.getElementById('lastUpdate'); 
        if (element) element.textContent = new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit', second:'2-digit'}); 
    }

    generateInitialData() { 
        for (let i = 0; i < 3; i++) this.addLiveReport('초기 신고 유형', '초기 신고 상세 내용'); 
        for (let i = 0; i < 3; i++) this.updateSystemAlerts(); 
        this.updateActivePatrolsListMonitor(); 
        this.updateHighRiskAreasUI(); // 초기 고위험 지역 목록 채우기
    }

    showNotification(message, type = 'info') { 
        if (type === 'success') this.playSound('success'); 
        else if (type === 'error' || type === 'warning') this.playSound('alert'); 
        else this.playSound('notification'); 
        const notification = document.createElement('div'); 
        notification.className = `fixed top-20 right-4 z-[10000] p-4 rounded-lg shadow-xl notification max-w-sm`; 
        const icons = { info: 'fa-info-circle', success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle' }; 
        const colors = { info: 'bg-blue-500 text-white', success: 'bg-green-500 text-white', warning: 'bg-orange-500 text-white', error: 'bg-red-600 text-white' }; 
        notification.classList.add(...colors[type].split(' ')); 
        notification.innerHTML = `<div class="flex items-center"><i class="fas ${icons[type]} mr-3 text-xl"></i><span class="text-sm font-medium">${message}</span></div>`; 
        document.body.appendChild(notification); 
        setTimeout(() => { notification.remove(); }, 3500); 
    }

} // End of DemoController Class

document.addEventListener('DOMContentLoaded', () => {
    window.demoApp = new DemoController();
});