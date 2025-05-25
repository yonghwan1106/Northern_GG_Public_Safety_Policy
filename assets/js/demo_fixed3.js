// Demo Page JavaScript - Enhanced Version with Heatmap Controls (Re-checked)
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
        this.heatmapIntensity = 0.6; 
        this.heatmapRadius = 30;    
        this.heatmapBlur = 15;      // 초기값 설정
        
        this.init();
    }

    init() {
        this.initializeAOS();
        this.setupEventListeners();
        this.initializeMaps(); // baseHeatmapData, heatmapRadius, heatmapBlur 초기화
        this.updateHeatmapInitialSliderValues(); // 지도 및 관련 값 초기화 후 슬라이더 UI 업데이트
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
            radiusSlider.value = this.heatmapRadius; // JS에서 설정된 초기 Radius 값 반영
            radiusValueEl.textContent = this.heatmapRadius;
        }
    }

    initializeAOS() { /* ... 기존과 동일 ... */ }
    initializeOnboarding() { /* ... 기존과 동일 ... */ }
    showOnboarding() { /* ... 기존과 동일 ... */ }
    closeOnboarding() { /* ... 기존과 동일 ... */ }
    nextOnboardingStep() { /* ... 기존과 동일 ... */ }
    prevOnboardingStep() { /* ... 기존과 동일 ... */ }
    updateOnboardingStep() { /* ... 기존과 동일 ... */ }
    initializeSounds() { /* ... 기존과 동일 ... */ }
    createOscillatorSound(frequency, duration, volume = 0.1) { /* ... 기존과 동일 ... */ }
    playSound(soundName) { /* ... 기존과 동일 ... */ }
    toggleSound() { /* ... 기존과 동일 ... */ }

    setupEventListeners() {
        // ... (기존 리스너들) ...
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

        // Prediction Dashboard Event Listeners
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
                this.heatmapBlur = Math.max(5, Math.min(25, Math.floor(this.heatmapRadius / 1.8))); // 반경에 따라 blur 값 조정
                document.getElementById('heatmapRadiusValue').textContent = this.heatmapRadius;
                this.updateHeatmapAppearance();
            });
        }
    }

    scrollToSection(sectionId) { /* ... 기존과 동일 ... */ }
    
    initializeMaps() {
        // Patrol Map
        if (document.getElementById('patrolMap')) {
            try {
                this.patrolMap = L.map('patrolMap').setView([37.741, 127.047], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.patrolMap);
                this.addPatrolMarkers();
            } catch (e) { console.error('Patrol map initialization failed:', e); /* ... error message ... */ }
        }

        // Risk Heatmap
        if (document.getElementById('riskHeatmap')) {
            try {
                this.riskMap = L.map('riskHeatmap').setView([37.741, 127.047], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.riskMap);
                
                this.baseHeatmapData = [
                    [37.741, 127.047, 0.9], [37.742, 127.048, 0.85], [37.740, 127.046, 0.8], [37.743, 127.049, 0.75],
                    [37.658, 126.834, 0.7], [37.659, 126.835, 0.75], [37.657, 126.833, 0.65], [37.660, 126.836, 0.6],
                    [37.767, 126.780, 0.6], [37.768, 126.781, 0.55], [37.766, 126.779, 0.5],
                    [37.593, 127.130, 0.4], [37.636, 127.224, 0.45], [37.826, 127.045, 0.3],
                    [37.903, 127.060, 0.35], [38.146, 127.200, 0.2],
                    [37.800, 127.150, 0.25], [37.700, 126.900, 0.3], [37.600, 127.200, 0.15] 
                ];
                // this.heatmapRadius는 constructor에서 30으로 초기화됨.
                // this.heatmapBlur는 constructor에서 15로 초기화됨.
                // 또는 여기서 this.heatmapRadius 기반으로 this.heatmapBlur를 다시 계산할 수 있음.
                this.heatmapBlur = Math.max(5, Math.min(25, Math.floor(this.heatmapRadius / 1.8))); 
                
                this.currentHeatmapData = this.generateHeatmapPoints(this.heatmapIntensity); 
                this.addRiskOverlayAndMarkers();

            } catch (e) { console.error('Risk heatmap initialization failed:', e); /* ... error message ... */ }
        }
    }
    
    generateHeatmapPoints(globalIntensityFactor, timeOfDayFactor = 1.0) { /* ... 기존과 동일 ... */ }

    addRiskOverlayAndMarkers() { 
        if (typeof L.heatLayer !== 'undefined') {
            this.heatLayer = L.heatLayer(this.currentHeatmapData, {
                radius: this.heatmapRadius, 
                blur: this.heatmapBlur, 
                maxZoom: 17, 
                max: 0.8, 
                gradient: { 0.0: '#16a34a', 0.25: '#eab308', 0.5: '#f97316', 0.75: '#dc2626', 1.0: '#7c2d12' } 
            }).addTo(this.riskMap);
        }
        // Static markers - 이전 답변에서 복원 필요
        const riskAreas = [ 
            { lat: 37.741, lng: 127.047, risk: 0.9, area: '의정부역 주변', details: '야간 유흥가, 소매치기 주의' },
            { lat: 37.658, lng: 126.834, risk: 0.7, area: '일산호수공원 인근', details: '주말 저녁 청소년 비행 우려' },
            { lat: 37.767, lng: 126.780, risk: 0.6, area: '파주 금촌 로데오거리', details: '음주 관련 사건 빈번' },
        ]; 
        riskAreas.forEach(area => { 
            const riskIcon = L.divIcon({ html: `<div class="w-3 h-3 rounded-full border-2 border-white shadow-md" style="background-color: ${this.getRiskColor(area.risk)};"></div>`, className: 'custom-div-icon', iconSize: [12, 12], iconAnchor: [6, 6]});
            const marker = L.marker([area.lat, area.lng], { icon: riskIcon }).addTo(this.riskMap);
            marker.bindPopup(`<div class="p-1 text-sm" style="min-width:180px;"><strong class="block text-base">${area.area}</strong>위험도: <span class="font-semibold" style="color:${this.getRiskColor(area.risk)};">${(area.risk * 100).toFixed(0)}%</span><br><span class="text-xs text-gray-600">${area.details}</span></div>`, { className: 'custom-popup' });
            marker.on('click', () => this.playSound('map_marker_click'));
        });
        this.updateHighRiskAreasUI(); 
    }

    updateHeatmapAppearance() { /* ... 기존과 동일 (blur, max 값 올바르게 사용) ... */ }
    startHeatmapAutoUpdate() { /* ... 기존과 동일 ... */ }
    stopHeatmapAutoUpdate() { /* ... 기존과 동일 ... */ }
    manualUpdatePredictions() { /* ... 기존과 동일 ... */ }
    handlePredictionTimeChange(timeRange) { /* ... 기존과 동일 (newBlur, newRadius 올바르게 사용) ... */ }

    addPatrolMarkers() { /* ... 기존과 동일 ... */ }
    getRiskColor(riskValue) { /* ... 기존과 동일 ... */ }
    initializeCharts() { /* ... 기존과 동일 ... */ }
    initPredictionChart() { /* ... 기존과 동일 ... */ }
    initPerformanceChart() { /* ... 기존과 동일 ... */ }
    togglePatrolSimulation() { /* ... 기존과 동일 ... */ }
    startPatrolSimulation() { /* ... 기존과 동일 ... */ }
    stopPatrolSimulation() { /* ... 기존과 동일 ... */ }
    resetPatrolSimulation() { /* ... 기존과 동일 ... */ }
    updateSimulationTime(seconds) { /* ... 기존과 동일 ... */ }
    updatePatrolUnitsUI(isRunning) { /* ... 기존과 동일 ... */ }
    updatePatrolStatusOnTick() { /* ... 기존과 동일 ... */ }
    generateRandomEvent() { /* ... 기존과 동일 ... */ }
    addActivity(message, type, icon) { /* ... 기존과 동일 ... */ }
    updateHighRiskAreasUI() { /* ... 기존과 동일 ... */ }
    selectReportCategory(event) { /* ... 기존과 동일 ... */ }
    submitReport() { /* ... 기존과 동일 ... */ }
    addLiveReport(category, details) { /* ... 기존과 동일 ... */ }
    startRealTimeUpdates() { /* ... 기존과 동일 ... */ }
    updateMonitorStats() { /* ... 기존과 동일 ... */ }
    updateSystemAlerts() { /* ... 기존과 동일 ... */ }
    updateActivePatrolsListMonitor() { /* ... 기존과 동일 ... */ }
    updatePerformanceChartData() { /* ... 기존과 동일 ... */ }
    updateLastUpdateTime() { /* ... 기존과 동일 ... */ }
    generateInitialData() { /* ... 기존과 동일 ... */ }
    showNotification(message, type) { /* ... 기존과 동일 ... */ }

} // End of DemoController Class

document.addEventListener('DOMContentLoaded', () => {
    window.demoApp = new DemoController();
});