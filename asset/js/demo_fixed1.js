// Demo Page JavaScript - Enhanced Version
class DemoController {
    constructor() {
        this.simulationRunning = false;
        this.simulationTimer = null;
        this.elapsedSeconds = 0;
        this.patrolUnitsData = []; // Store patrol unit data including marker
        this.reports = [];
        this.alerts = [];
        this.soundEnabled = true;
        this.sounds = {};
        this.patrolMap = null;
        this.riskMap = null;
        this.heatLayer = null;
        this.currentHeatmapData = [];
        this.predictionChart = null;
        this.performanceChart = null;
        
        this.init();
    }

    init() {
        this.initializeAOS(); // AOS 먼저 초기화
        this.setupEventListeners();
        this.initializeMaps();
        this.initializeCharts();
        this.startRealTimeUpdates(); // 차트 초기화 후 데이터 업데이트 시작
        this.generateInitialData();
        this.initializeSounds();
        this.initializeOnboarding(); // 사운드 초기화 후 온보딩
        this.updatePatrolUnitsUI(false); // 초기 순찰대 UI 업데이트
    }

    initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false,
                // disable: 'mobile' // 모바일에서도 AOS 사용 원하면 주석 처리
            });
        }
    }

    initializeOnboarding() {
        this.onboardingStep = 0;
        this.maxOnboardingSteps = 4;
        
        const hasSeenOnboarding = localStorage.getItem('demoOnboardingSeen');
        if (!hasSeenOnboarding) {
            setTimeout(() => this.showOnboarding(), 1000);
        } else {
            const helpButton = document.getElementById('helpButton');
            if (helpButton) helpButton.style.display = 'block';
        }

        const onboardingSkip = document.getElementById('onboardingSkip');
        const onboardingNext = document.getElementById('onboardingNext');
        const onboardingPrev = document.getElementById('onboardingPrev');
        const helpButton = document.getElementById('helpButton');

        if (onboardingSkip) onboardingSkip.addEventListener('click', () => this.closeOnboarding());
        if (onboardingNext) onboardingNext.addEventListener('click', () => this.nextOnboardingStep());
        if (onboardingPrev) onboardingPrev.addEventListener('click', () => this.prevOnboardingStep());
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                this.playSound('click');
                this.showOnboarding();
            });
        }
    }

    showOnboarding() {
        this.onboardingStep = 0;
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            setTimeout(() => overlay.classList.add('active'), 10);
            this.updateOnboardingStep();
            this.playSound('notification');
        }
    }

    closeOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
            localStorage.setItem('demoOnboardingSeen', 'true');
            const helpButton = document.getElementById('helpButton');
            if (helpButton) helpButton.style.display = 'block';
            this.playSound('success');
        }
    }

    nextOnboardingStep() {
        this.playSound('click');
        if (this.onboardingStep < this.maxOnboardingSteps - 1) {
            this.onboardingStep++;
            this.updateOnboardingStep();
        } else {
            this.closeOnboarding();
        }
    }

    prevOnboardingStep() {
        this.playSound('click');
        if (this.onboardingStep > 0) {
            this.onboardingStep--;
            this.updateOnboardingStep();
        }
    }

    updateOnboardingStep() {
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.onboardingStep);
        });
        document.querySelectorAll('.onboarding-step').forEach((step, index) => {
            step.classList.toggle('active', index === this.onboardingStep);
        });

        const prevBtn = document.getElementById('onboardingPrev');
        const nextBtn = document.getElementById('onboardingNext');
        if (prevBtn) prevBtn.style.display = this.onboardingStep > 0 ? 'inline-block' : 'none';
        if (nextBtn) nextBtn.textContent = this.onboardingStep === this.maxOnboardingSteps - 1 ? '시작하기!' : '다음';
    }

    initializeSounds() {
        this.sounds = {
            click: this.createOscillatorSound(800, 0.05, 0.1), // freq, duration, volume
            notification: this.createOscillatorSound(600, 0.15, 0.1),
            success: this.createOscillatorSound(880, 0.2, 0.1),
            alert: this.createOscillatorSound(440, 0.3, 0.15),
            start: this.createOscillatorSound(660, 0.25, 0.1),
            map_marker_click: this.createOscillatorSound(700, 0.05, 0.08)
        };
    }

    createOscillatorSound(frequency, duration, volume = 0.1) {
        return {
            play: () => {
                if (!this.soundEnabled || !window.AudioContext && !window.webkitAudioContext) return;
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
                    
                    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (e) {
                    console.warn('Sound playback failed:', e);
                }
            }
        };
    }

    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        try {
            this.sounds[soundName].play();
        } catch (e) {
            console.warn('Error playing sound:', soundName, e);
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundIcon = document.getElementById('soundIcon');
        const soundToggle = document.getElementById('soundToggle');
        
        if (soundIcon && soundToggle) {
            if (this.soundEnabled) {
                soundIcon.className = 'fas fa-volume-up';
                soundToggle.classList.remove('muted');
                this.playSound('click');
            } else {
                soundIcon.className = 'fas fa-volume-mute';
                soundToggle.classList.add('muted');
            }
        }
        localStorage.setItem('demoSoundEnabled', this.soundEnabled);
    }

    setupEventListeners() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                this.playSound('click');
                mobileMenu.classList.toggle('hidden');
            });
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.playSound('click');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            });
        });
        
        document.querySelectorAll('.demo-scroll-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                this.scrollToSection(targetId);
                this.playSound('click');
            });
        });

        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) soundToggle.addEventListener('click', () => this.toggleSound());

        const startPatrolBtn = document.getElementById('startPatrol');
        const resetPatrolBtn = document.getElementById('resetPatrol');
        if (startPatrolBtn) startPatrolBtn.addEventListener('click', () => this.togglePatrolSimulation());
        if (resetPatrolBtn) resetPatrolBtn.addEventListener('click', () => this.resetPatrolSimulation());

        const updatePredictionBtn = document.getElementById('updatePrediction');
        if (updatePredictionBtn) updatePredictionBtn.addEventListener('click', () => this.updatePredictions());

        const submitReportBtn = document.getElementById('submitReport');
        if (submitReportBtn) submitReportBtn.addEventListener('click', () => this.submitReport());

        document.querySelectorAll('.report-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playSound('click');
                this.selectReportCategory(e);
            });
        });

        const savedSoundSetting = localStorage.getItem('demoSoundEnabled');
        if (savedSoundSetting !== null) {
            this.soundEnabled = savedSoundSetting === 'true';
            const soundIcon = document.getElementById('soundIcon');
            const soundToggleEl = document.getElementById('soundToggle');
            if (soundIcon && soundToggleEl && !this.soundEnabled) {
                soundIcon.className = 'fas fa-volume-mute';
                soundToggleEl.classList.add('muted');
            }
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            // section.scrollIntoView({ behavior: 'smooth', block: 'start' }); // 'start' can be jarring if navbar is fixed
            const navbarHeight = document.querySelector('nav')?.offsetHeight || 64;
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        }
    }

    initializeMaps() {
        // Patrol Map
        if (document.getElementById('patrolMap')) {
            try {
                this.patrolMap = L.map('patrolMap').setView([37.741, 127.047], 10); // Zoom out a bit
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(this.patrolMap);
                this.addPatrolMarkers();
            } catch (e) {
                console.error('Patrol map initialization failed:', e);
                document.getElementById('patrolMap').innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 p-4 text-center"><i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i><p>순찰 지도를 불러오는데 실패했습니다. 페이지를 새로고침하거나 인터넷 연결을 확인해주세요.</p></div>';
            }
        }

        // Risk Heatmap
        if (document.getElementById('riskHeatmap')) {
            try {
                this.riskMap = L.map('riskHeatmap').setView([37.741, 127.047], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(this.riskMap);
                this.addRiskOverlayAndMarkers();
            } catch (e) {
                console.error('Risk heatmap initialization failed:', e);
                document.getElementById('riskHeatmap').innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 p-4 text-center"><i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i><p>위험도 히트맵을 불러오는데 실패했습니다. 페이지를 새로고침하거나 인터넷 연결을 확인해주세요.</p></div>';
            }
        }
    }

    addPatrolMarkers() {
        const patrolPoints = [
            { lat: 37.741, lng: 127.047, name: '의정부시청', unit: 'P-001', status: '대기', icon: 'fa-car' },
            { lat: 37.658, lng: 126.834, name: '고양시청', unit: 'P-002', status: '순찰중', icon: 'fa-person-walking-arrow-right' },
            { lat: 37.767, lng: 126.780, name: '파주시청', unit: 'P-003', status: '대기', icon: 'fa-car' },
            { lat: 37.593, lng: 127.130, name: '구리시청', unit: 'P-004', status: '출동', icon: 'fa-truck-medical' },
            { lat: 37.636, lng: 127.224, name: '남양주시청', unit: 'P-005', status: '순찰중', icon: 'fa-person-walking-arrow-right' },
            { lat: 37.826, lng: 127.045, name: '양주시청', unit: 'P-006', status: '대기', icon: 'fa-car' },
            { lat: 37.903, lng: 127.060, name: '동두천시청', unit: 'P-007', status: '대기', icon: 'fa-car' },
            { lat: 38.146, lng: 127.200, name: '포천시청', unit: 'P-008', status: '순찰중', icon: 'fa-person-walking-arrow-right' }
        ];
        
        this.patrolUnitsData = patrolPoints.map(point => {
            const patrolIcon = L.divIcon({
                html: `<div class="p-1 bg-police-blue text-white rounded-full shadow-md flex items-center justify-center w-8 h-8 border-2 border-white"><i class="fas ${point.icon} text-sm"></i></div>`,
                className: 'custom-patrol-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            const marker = L.marker([point.lat, point.lng], { icon: patrolIcon }).addTo(this.patrolMap);
            marker.bindPopup(`
                <div class="p-1 text-sm">
                    <strong class="block text-base">${point.unit} (${point.name})</strong>
                    상태: <span class="font-semibold" data-unit-status="${point.unit}">${point.status}</span><br>
                    최근 활동: <span class="text-gray-600" data-unit-activity="${point.unit}">정보 없음</span>
                </div>
            `, { className: 'custom-popup' });
            marker.on('click', () => this.playSound('map_marker_click'));
            return { ...point, marker, lastActivity: '정보 없음' };
        });
        this.updatePatrolUnitsUI(false); // 시뮬레이션 시작 전 초기 상태 반영
    }

    addRiskOverlayAndMarkers() {
        this.currentHeatmapData = [
            [37.741, 127.047, 0.9], [37.742, 127.048, 0.85], [37.740, 127.046, 0.8], [37.743, 127.049, 0.75],
            [37.658, 126.834, 0.7], [37.659, 126.835, 0.75], [37.657, 126.833, 0.65], [37.660, 126.836, 0.6],
            [37.767, 126.780, 0.6], [37.768, 126.781, 0.55], [37.766, 126.779, 0.5],
            [37.593, 127.130, 0.4], [37.636, 127.224, 0.45], [37.826, 127.045, 0.3],
            [37.903, 127.060, 0.35], [38.146, 127.200, 0.2] 
        ];

        if (typeof L.heatLayer !== 'undefined') {
            this.heatLayer = L.heatLayer(this.currentHeatmapData, {
                radius: 35, blur: 25, maxZoom: 17, max: 1.0,
                gradient: { 0.0: '#16a34a', 0.3: '#eab308', 0.6: '#f97316', 0.8: '#dc2626', 1.0: '#7c2d12' }
            }).addTo(this.riskMap);
        }

        const riskAreas = [
            { lat: 37.741, lng: 127.047, risk: 0.9, area: '의정부역 주변', details: '야간 유흥가, 소매치기 주의' },
            { lat: 37.658, lng: 126.834, risk: 0.7, area: '일산호수공원 인근', details: '주말 저녁 청소년 비행 우려' },
            { lat: 37.767, lng: 126.780, risk: 0.6, area: '파주 금촌 로데오거리', details: '음주 관련 사건 빈번' },
        ];

        riskAreas.forEach(area => {
            const riskIcon = L.divIcon({
                html: `<div class="w-3 h-3 rounded-full border-2 border-white shadow-md" style="background-color: ${this.getRiskColor(area.risk)};"></div>`,
                className: 'custom-div-icon', iconSize: [12, 12], iconAnchor: [6, 6]
            });
            const marker = L.marker([area.lat, area.lng], { icon: riskIcon }).addTo(this.riskMap);
            marker.bindPopup(`
                <div class="p-1 text-sm" style="min-width:180px;">
                    <strong class="block text-base">${area.area}</strong>
                    위험도: <span class="font-semibold" style="color:${this.getRiskColor(area.risk)};">${(area.risk * 100).toFixed(0)}%</span><br>
                    <span class="text-xs text-gray-600">${area.details}</span>
                </div>
            `, { className: 'custom-popup' });
            marker.on('click', () => this.playSound('map_marker_click'));
        });
        this.updateHighRiskAreasUI();
    }
    
    getRiskColor(riskValue) {
        if (riskValue >= 0.8) return '#7c2d12'; // 매우높음 (진한 빨강)
        if (riskValue >= 0.6) return '#dc2626'; // 높음 (빨강)
        if (riskValue >= 0.4) return '#f97316'; // 보통 (주황)
        if (riskValue >= 0.2) return '#eab308'; // 주의 (노랑)
        return '#16a34a'; // 낮음 (초록)
    }

    initializeCharts() {
        this.initPredictionChart();
        this.initPerformanceChart();
    }

    initPredictionChart() {
        const ctx = document.getElementById('predictionChart')?.getContext('2d');
        if (!ctx) return;
        try {
            const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
            this.predictionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: hours,
                    datasets: [{
                        label: '예측 위험도 (%)', data: hours.map(() => Math.random() * 60 + 20), // 20-80 범위
                        borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3, fill: true, pointRadius: 2, pointHoverRadius: 5
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
            });
        } catch (e) { console.error('Prediction chart init failed:', e); }
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart')?.getContext('2d');
        if (!ctx) return;
        try {
            const timeLabels = Array.from({length: 12}, (_, i) => { // 12개 데이터 포인트 (1시간 간격)
                const t = new Date(); t.setHours(t.getHours() - (11 - i));
                return `${String(t.getHours()).padStart(2, '0')}:00`;
            });
            this.performanceChart = new Chart(ctx, {
                type: 'bar', // Bar chart로 변경
                data: {
                    labels: timeLabels,
                    datasets: [
                        {
                            label: '대응시간 (분)', type: 'line', tension: 0.3,
                            data: Array.from({length: 12}, () => Math.random() * 10 + 5), // 5-15분
                            borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            yAxisID: 'y', pointRadius: 2, pointHoverRadius: 5, fill: true
                        },
                        {
                            label: '순찰 효율성 (%)', type: 'bar',
                            data: Array.from({length: 12}, () => Math.random() * 20 + 75), // 75-95%
                            backgroundColor: 'rgba(22, 163, 74, 0.6)', borderColor: '#16a34a',
                            yAxisID: 'y1', barPercentage: 0.7
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: { type: 'linear', display: true, position: 'left', beginAtZero: true, max: 20, title: { display: true, text: '분' } },
                        y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, max: 100, title: { display: true, text: '%' }, grid: { drawOnChartArea: false } }
                    }
                }
            });
        } catch (e) { console.error('Performance chart init failed:', e); }
    }

    togglePatrolSimulation() {
        this.playSound(this.simulationRunning ? 'click' : 'start');
        const btn = document.getElementById('startPatrol');
        if (!this.simulationRunning) {
            this.startPatrolSimulation();
            if (btn) {
                btn.innerHTML = '<i class="fas fa-pause mr-2"></i>순찰 중지';
                btn.classList.replace('bg-blue-600', 'bg-red-600');
                btn.classList.replace('hover:bg-blue-700', 'hover:bg-red-700');
            }
        } else {
            this.stopPatrolSimulation();
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play mr-2"></i>순찰 시작';
                btn.classList.replace('bg-red-600', 'bg-blue-600');
                btn.classList.replace('hover:bg-red-700', 'hover:bg-blue-700');
            }
        }
    }

    startPatrolSimulation() {
        this.simulationRunning = true;
        this.elapsedSeconds = 0;
        document.getElementById('recentActivity').innerHTML = ''; // Clear previous logs
        document.getElementById('patrolUnits').innerHTML = ''; // Clear previous units
        
        this.updatePatrolUnitsUI(true); // Simulation start status
        this.addActivity('순찰 시뮬레이션 시작됨', 'info', 'fa-play-circle');
        
        this.simulationTimer = setInterval(() => {
            this.elapsedSeconds++;
            this.updateSimulationTime(this.elapsedSeconds);
            this.updatePatrolStatusOnTick();
            if (Math.random() < 0.2) this.generateRandomEvent(); // Higher chance for events
        }, 2000); // Slower tick for demo clarity
    }

    stopPatrolSimulation() {
        this.simulationRunning = false;
        if (this.simulationTimer) clearInterval(this.simulationTimer);
        this.simulationTimer = null;
        this.addActivity('순찰 시뮬레이션 중지됨', 'warning', 'fa-pause-circle');
        this.updatePatrolUnitsUI(false); // Simulation stop status
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
        if (startBtn) {
             startBtn.innerHTML = '<i class="fas fa-play mr-2"></i>순찰 시작';
             startBtn.classList.replace('bg-red-600', 'bg-blue-600');
             startBtn.classList.replace('hover:bg-red-700', 'hover:bg-blue-700');
        }
        this.addActivity('시뮬레이션 초기화됨', 'info', 'fa-undo');
        this.updatePatrolUnitsUI(false); // Reset patrol units UI
    }

    updateSimulationTime(seconds) {
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        document.getElementById('simTime').textContent = `${h}:${m}:${s}`;
    }
    
    updatePatrolUnitsUI(isRunning) {
        const container = document.getElementById('patrolUnits');
        if (!container) return;
    
        if (!this.patrolUnitsData || this.patrolUnitsData.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">순찰대 정보가 없습니다.</p>';
            return;
        }
    
        if (!isRunning && !this.simulationRunning) { // 시뮬레이션이 실행 중이 아닐 때 (초기 상태 또는 중지 후)
            container.innerHTML = '<p class="text-sm text-gray-500">시뮬레이션 시작 시 순찰대 현황이 표시됩니다.</p>';
            return;
        }
        
        container.innerHTML = ''; // Clear previous entries
    
        this.patrolUnitsData.slice(0, 5).forEach(unit => { // Show up to 5 units
            let statusText, statusColorClass, unitIconClass;
            if (isRunning) { // 시뮬레이션 실행 중
                // Randomize status for demo
                const rand = Math.random();
                if (rand < 0.6) { unit.status = '대기'; unit.icon = 'fa-car'; }
                else if (rand < 0.9) { unit.status = '순찰중'; unit.icon = 'fa-person-walking-arrow-right'; }
                else { unit.status = '출동'; unit.icon = 'fa-truck-medical'; }
            } // isRunning이 false이면, unit.status는 addPatrolMarkers에서 설정된 초기값을 유지
    
            statusText = unit.status;
            unitIconClass = unit.icon;
    
            if (unit.status === '대기') statusColorClass = 'bg-green-500';
            else if (unit.status === '순찰중') statusColorClass = 'bg-blue-500';
            else statusColorClass = 'bg-orange-500'; // 출동
            
            // Update marker icon (optional, can be performance heavy)
            // unit.marker.setIcon(L.divIcon({html: `<div class="p-1 ${statusColorClass} text-white rounded-full shadow-md flex items-center justify-center w-8 h-8 border-2 border-white"><i class="fas ${unitIconClass} text-sm"></i></div>`, className: 'custom-patrol-icon', iconSize: [32, 32]}));

            const unitHTML = `
                <div class="flex justify-between items-center p-2 bg-white rounded border hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <i class="fas ${unitIconClass} mr-3 text-police-navy"></i>
                        <span class="text-sm font-medium">${unit.unit}</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-2.5 h-2.5 ${statusColorClass} rounded-full mr-2"></div>
                        <span class="text-xs text-gray-700">${statusText}</span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', unitHTML);
        });
    }

    updatePatrolStatusOnTick() { // Renamed from updatePatrolStatus
        if (!this.simulationRunning) return;

        this.updatePatrolUnitsUI(true);

        // Update statistics
        document.getElementById('activePatrols').textContent = this.patrolUnitsData.length;
        const coverage = Math.min(95, parseFloat(document.getElementById('coverageRate').textContent) + (Math.random() * 2 - 1));
        document.getElementById('coverageRate').textContent = `${coverage.toFixed(0)}%`;
        
        let respTime = parseFloat(document.getElementById('avgResponsePatrol').textContent);
        respTime += (Math.random() * 0.5 - 0.25); // Fluctuate slightly
        respTime = Math.max(5, Math.min(20, respTime)); // Clamp between 5 and 20
        document.getElementById('avgResponsePatrol').textContent = respTime.toFixed(1);


        if (Math.random() < 0.3) { // 30% chance to update a unit's popup
            const randomUnit = this.patrolUnitsData[Math.floor(Math.random() * this.patrolUnitsData.length)];
            if (randomUnit && randomUnit.marker && randomUnit.marker.getPopup()) {
                 const popupContentEl = randomUnit.marker.getPopup().getContentElement();
                 if (popupContentEl) {
                    popupContentEl.querySelector(`[data-unit-status="${randomUnit.unit}"]`).textContent = randomUnit.status;
                    popupContentEl.querySelector(`[data-unit-activity="${randomUnit.unit}"]`).textContent = randomUnit.lastActivity;
                 }
            }
        }
    }

    generateRandomEvent() {
        if (!this.simulationRunning) return;
        const eventTypes = [
            { type: 'info', message: '새로운 순찰 경로 AI 추천', icon: 'fa-route' },
            { type: 'info', message: 'CCTV 이상 감지 알림 확인', icon: 'fa-video' },
            { type: 'success', message: '예방 순찰 중 위험요소 제거', icon: 'fa-shield-alt' },
            { type: 'warning', message: '특정 지역 드론 지원 요청', icon: 'fa-helicopter' }
        ];
        const randomUnit = this.patrolUnitsData[Math.floor(Math.random() * this.patrolUnitsData.length)];
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const fullMessage = `${randomUnit.unit}: ${randomEvent.message}`;
        this.addActivity(fullMessage, randomEvent.type, randomEvent.icon);
        randomUnit.lastActivity = randomEvent.message; // Update unit's last activity

        if (randomEvent.type === 'success') {
            const prevented = parseInt(document.getElementById('preventedIncidents').textContent) + 1;
            document.getElementById('preventedIncidents').textContent = prevented;
        }
    }

    addActivity(message, type = 'info', icon = 'fa-info-circle') {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        if (container.querySelector('p')) container.innerHTML = ''; // Remove placeholder

        const time = new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
        let iconColorClass = 'text-blue-500';
        if (type === 'warning') iconColorClass = 'text-orange-500';
        else if (type === 'success') iconColorClass = 'text-green-500';
        else if (type === 'error') iconColorClass = 'text-red-500';

        const activityHTML = `
            <div class="flex items-start space-x-2 p-2.5 bg-white rounded border hover:shadow-sm transition-shadow">
                <i class="fas ${icon} ${iconColorClass} mt-1 fa-fw"></i>
                <div class="flex-1">
                    <p class="text-sm text-gray-800">${message}</p>
                    <p class="text-xs text-gray-500">${time}</p>
                </div>
            </div>`;
        container.insertAdjacentHTML('afterbegin', activityHTML);
        if (container.children.length > 7) container.removeChild(container.lastChild); // Keep last 7
    }

    updatePredictions() {
        this.playSound('click');
        this.showNotification('AI 예측 모델 업데이트 중...', 'info');
        
        const heatmapContainer = document.querySelector('#riskHeatmap');
        if (heatmapContainer) heatmapContainer.classList.add('heatmap-updating');

        setTimeout(() => {
            if (this.predictionChart) {
                this.predictionChart.data.datasets[0].data = this.predictionChart.data.datasets[0].data.map(() => Math.random() * 60 + 20);
                this.predictionChart.update();
            }
            this.updateHeatmapData();
            this.updateHighRiskAreasUI();
            if (heatmapContainer) heatmapContainer.classList.remove('heatmap-updating');
            this.showNotification('AI 예측 모델 업데이트 완료', 'success');
        }, 1500);
    }
    
    updateHeatmapData() {
        if (!this.heatLayer || !this.riskMap) return;
    
        // Slightly randomize existing data for visual change
        const updatedHeatData = this.currentHeatmapData.map(p => {
            let newIntensity = p[2] + (Math.random() * 0.2 - 0.1); // Add/subtract up to 0.1
            newIntensity = Math.max(0, Math.min(1, newIntensity)); // Clamp between 0 and 1
            return [p[0], p[1], newIntensity];
        });
        this.currentHeatmapData = updatedHeatData; // Store updated data
    
        this.heatLayer.setLatLngs(this.currentHeatmapData);
    }

    updateHighRiskAreasUI() {
        const container = document.getElementById('highRiskAreas');
        if (!container) return;
        container.innerHTML = ''; // Clear previous

        // Sort current heatmap data by intensity (desc) and take top 3
        const sortedRisks = [...this.currentHeatmapData].sort((a, b) => b[2] - a[2]);
        const topRisks = sortedRisks.slice(0, 3);

        const areaNames = ['의정부역 일대', '고양 화정지구', '파주 운정신도시', '남양주 별내지구', '구리 돌다리'];

        topRisks.forEach((riskPoint, index) => {
            const riskPercent = (riskPoint[2] * 100).toFixed(0);
            let bgColor = 'bg-yellow-100'; let textColor = 'text-yellow-800';
            if (riskPoint[2] >= 0.8) { bgColor = 'bg-red-100'; textColor = 'text-red-800'; }
            else if (riskPoint[2] >= 0.5) { bgColor = 'bg-orange-100'; textColor = 'text-orange-800'; }
            
            const areaName = areaNames[index % areaNames.length]; // Cycle through names
            const details = ['야간 유흥가', '상업 밀집지역', '공원 주변', '학교 근처', '교통 요충지'];

            const riskHTML = `
                <div class="bg-white rounded-lg p-3 border hover:shadow-sm transition-shadow">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-800">${areaName} (예시)</span>
                        <span class="text-xs ${bgColor} ${textColor} px-2 py-1 rounded-full">${riskPercent}%</span>
                    </div>
                    <p class="text-xs text-gray-600">${details[index % details.length]} 관련 위험요소 증가</p>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', riskHTML);
        });
    }


    selectReportCategory(event) {
        document.querySelectorAll('.report-category').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100');
            if(btn.classList.contains('bg-red-50')) btn.classList.replace('hover:bg-red-100','hover:bg-red-100') // restore original hover
            // Add similar for other colors if needed
        });
        const currentBtn = event.currentTarget;
        currentBtn.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100');
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
            document.querySelectorAll('.report-category.ring-2').forEach(btn => {
                btn.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100');
            });
            this.addLiveReport(selectedCategory.querySelector('div').textContent, description);
            
            const todayReportsEl = document.getElementById('todayReports');
            todayReportsEl.textContent = parseInt(todayReportsEl.textContent) + 1;

            let avgTime = parseFloat(document.getElementById('avgResponseTimeReport').textContent);
            avgTime = Math.max(3, avgTime - Math.random() * 0.5).toFixed(1); // Slightly improve
            document.getElementById('avgResponseTimeReport').textContent = avgTime;


            setTimeout(() => {
                reportStatus.textContent = '신고 준비 완료';
                reportStatus.className = 'text-center text-sm text-gray-500 h-5';
            }, 3000);
        }, 2000);
        this.showNotification('신고가 성공적으로 접수되었습니다.', 'success');
    }

    addLiveReport(category, details) {
        const container = document.getElementById('liveReports');
        if (!container) return;
        if (container.querySelector('p')) container.innerHTML = '';

        const locations = ['의정부시 가능동', '고양시 일산서구', '파주시 운정1동', '구리시 교문동', '남양주시 다산동'];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const time = new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'});
        const statusColors = { "처리중": "bg-orange-100 text-orange-800", "대응완료": "bg-green-100 text-green-800" };
        const currentStatus = Math.random() > 0.3 ? "처리중" : "대응완료";

        const reportHTML = `
            <div class="flex justify-between items-center p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                <div>
                    <div class="text-sm font-medium text-gray-800">${category}</div>
                    <p class="text-xs text-gray-600 truncate" style="max-width:150px;" title="${details}">${details}</p>
                    <div class="text-xs text-gray-500">${location} &bull; ${time}</div>
                </div>
                <span class="text-xs ${statusColors[currentStatus]} px-2 py-1 rounded-full whitespace-nowrap">${currentStatus}</span>
            </div>`;
        container.insertAdjacentHTML('afterbegin', reportHTML);
        if (container.children.length > 5) container.removeChild(container.lastChild);
        
        if(this.simulationRunning && currentStatus === "처리중") {
            const processed = parseInt(document.getElementById('processedReports').textContent) + 1;
            document.getElementById('processedReports').textContent = processed;
        }

    }

    startRealTimeUpdates() {
        this.updateMonitorStats(); // Initial call
        setInterval(() => {
            if (Math.random() < 0.5) this.updateSystemAlerts();
            if (Math.random() < 0.3) this.updateActivePatrolsListMonitor();
            if (this.performanceChart && Math.random() < 0.7) this.updatePerformanceChartData();
            this.updateLastUpdateTime();
            this.updateMonitorStats();
        }, 5000); // Update every 5 seconds
    }
    
    updateMonitorStats() {
        document.getElementById('totalPatrolsMonitor').textContent = this.patrolUnitsData.length;
        const activeIncidents = Math.floor(Math.random() * 5); // 0-4
        document.getElementById('activeIncidentsMonitor').textContent = activeIncidents;

        const riskLevels = ['낮음', '보통', '높음', '매우높음'];
        const riskProgress = [25, 50, 75, 90];
        const randomRiskIndex = Math.floor(Math.random() * riskLevels.length);
        document.getElementById('riskLevelMonitor').textContent = riskLevels[randomRiskIndex];
        const riskBar = document.querySelector('#riskLevelMonitor + p + div div.bg-white');
        if(riskBar) riskBar.style.width = `${riskProgress[randomRiskIndex]}%`;

        let health = parseFloat(document.getElementById('systemHealth').textContent);
        health += (Math.random() * 0.2 - 0.1); // Fluctuate
        health = Math.max(98.0, Math.min(99.9, health)).toFixed(1);
        document.getElementById('systemHealth').textContent = `${health}%`;
    }

    updateSystemAlerts() {
        const container = document.getElementById('systemAlerts');
        if (!container) return;
        if (container.querySelector('p')) container.innerHTML = '';

        const alertTypes = [
            { type: 'info', icon: 'fa-info-circle', color: 'border-blue-400', message: 'AI 모델 정확도 87.5% 유지 중' },
            { type: 'warning', icon: 'fa-exclamation-triangle', color: 'border-yellow-400', message: '고양시 일산동구 야간 위험도 소폭 상승 예상' },
            { type: 'success', icon: 'fa-check-circle', color: 'border-green-400', message: '순찰대 P-005, 신고 사건 (#S1204) 처리 완료' },
            { type: 'info', icon: 'fa-traffic-light', color: 'border-blue-400', message: '교통정보 시스템 연동 데이터 업데이트됨' }
        ];
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const time = new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'});
        
        const alertHTML = `
            <div class="flex items-center space-x-3 p-2.5 bg-gray-800 rounded-md border-l-4 ${alert.color} hover:bg-gray-700 transition-colors">
                <i class="fas ${alert.icon} ${alert.color.replace('border-', 'text-')} fa-fw"></i>
                <div class="flex-1">
                    <p class="text-sm text-gray-100">${alert.message}</p>
                    <p class="text-xs text-gray-400">${time}</p>
                </div>
            </div>`;
        container.insertAdjacentHTML('afterbegin', alertHTML);
        if (container.children.length > 6) container.removeChild(container.lastChild);
    }

    updateActivePatrolsListMonitor() {
        const container = document.getElementById('activePatrolsList');
        if (!container) return;
        if (container.querySelector('p')) container.innerHTML = '';
        container.innerHTML = ''; // Clear old

        this.patrolUnitsData.slice(0, 4).forEach(unit => { // Show 4 units for monitor
            const statuses = ['대기중', '순찰중', '출동중', '현장도착'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const statusColor = status === '대기중' ? 'bg-green-500' : status === '순찰중' ? 'bg-blue-500' : status === '출동중' ? 'bg-orange-500' : 'bg-red-500';
            
            container.innerHTML += `
                <div class="flex justify-between items-center p-2.5 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div>
                        <div class="text-sm font-medium text-gray-800">${unit.unit} <span class="text-xs text-gray-500">(${unit.name})</span></div>
                        <div class="text-xs text-gray-600">배정사건: ${Math.random() > 0.5 ? `#S${Math.floor(Math.random()*1000)+1000}` : '없음'}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="w-2.5 h-2.5 ${statusColor} rounded-full mr-2"></div>
                        <span class="text-xs text-gray-700">${status}</span>
                    </div>
                </div>`;
        });
    }
    
    updatePerformanceChartData() {
        if (!this.performanceChart) return;
        // Shift old data
        this.performanceChart.data.labels.shift();
        this.performanceChart.data.datasets.forEach(dataset => dataset.data.shift());
        // Add new data
        const newTime = new Date();
        this.performanceChart.data.labels.push(`${String(newTime.getHours()).padStart(2, '0')}:00`);
        this.performanceChart.data.datasets[0].data.push(Math.random() * 10 + 5); // 대응시간
        this.performanceChart.data.datasets[1].data.push(Math.random() * 20 + 75); // 순찰 효율성
        this.performanceChart.update('quiet'); // 'quiet' for no animation
    }

    updateLastUpdateTime() {
        const element = document.getElementById('lastUpdate');
        if (element) element.textContent = new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    }

    generateInitialData() {
        for (let i = 0; i < 3; i++) this.addLiveReport('초기 신고 유형', '초기 신고 상세 내용');
        for (let i = 0; i < 3; i++) this.updateSystemAlerts();
        this.updateActivePatrolsListMonitor();
    }

    showNotification(message, type = 'info') {
        if (type === 'success') this.playSound('success');
        else if (type === 'error' || type === 'warning') this.playSound('alert');
        else this.playSound('notification');

        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-[10000] p-4 rounded-lg shadow-xl notification max-w-sm`;
        
        const icons = { info: 'fa-info-circle', success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle' };
        const colors = { 
            info: 'bg-blue-500 text-white', 
            success: 'bg-green-500 text-white', 
            warning: 'bg-orange-500 text-white', 
            error: 'bg-red-600 text-white'
        };
        
        notification.classList.add(...colors[type].split(' '));
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${icons[type]} mr-3 text-xl"></i>
                <span class="text-sm font-medium">${message}</span>
            </div>`;
        document.body.appendChild(notification);
        setTimeout(() => { notification.remove(); }, 3500);
    }
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.demoApp = new DemoController(); // Make instance globally accessible if needed for inline event handlers (though we avoid them)
});