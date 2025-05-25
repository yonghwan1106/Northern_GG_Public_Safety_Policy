// Demo Page JavaScript
class DemoController {
    constructor() {
        this.simulationRunning = false;
        this.simulationTimer = null;
        this.patrolUnits = [];
        this.reports = [];
        this.alerts = [];
        this.soundEnabled = true;
        this.sounds = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeMaps();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.generateInitialData();
        this.initializeAOS();
        this.initializeSounds();
        this.initializeOnboarding();
    }

    initializeOnboarding() {
        this.onboardingStep = 0;
        this.maxOnboardingSteps = 4;
        
        // Check if user has seen onboarding before
        const hasSeenOnboarding = localStorage.getItem('demoOnboardingSeen');
        if (!hasSeenOnboarding) {
            setTimeout(() => this.showOnboarding(), 1000);
        } else {
            document.getElementById('helpButton').style.display = 'block';
        }

        // Setup onboarding event listeners
        const onboardingSkip = document.getElementById('onboardingSkip');
        const onboardingNext = document.getElementById('onboardingNext');
        const onboardingPrev = document.getElementById('onboardingPrev');
        const helpButton = document.getElementById('helpButton');

        if (onboardingSkip) {
            onboardingSkip.addEventListener('click', () => this.closeOnboarding());
        }

        if (onboardingNext) {
            onboardingNext.addEventListener('click', () => this.nextOnboardingStep());
        }

        if (onboardingPrev) {
            onboardingPrev.addEventListener('click', () => this.prevOnboardingStep());
        }

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
            setTimeout(() => overlay.style.display = 'none', 300);
            localStorage.setItem('demoOnboardingSeen', 'true');
            document.getElementById('helpButton').style.display = 'block';
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
        // Update step indicator
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.onboardingStep);
        });

        // Update step content
        document.querySelectorAll('.onboarding-step').forEach((step, index) => {
            step.classList.toggle('active', index === this.onboardingStep);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('onboardingPrev');
        const nextBtn = document.getElementById('onboardingNext');

        if (prevBtn) {
            prevBtn.style.display = this.onboardingStep > 0 ? 'inline-block' : 'none';
        }

        if (nextBtn) {
            nextBtn.textContent = this.onboardingStep === this.maxOnboardingSteps - 1 ? '시작하기!' : '다음';
        }
    }

    initializeSounds() {
        // Initialize sound effects
        this.sounds = {
            click: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAIAAF8tAAGlGgABAABwAAAAZGF0YQoGAABBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLKH1//JBeEUuR3zXq3n7HX4yEJvczL6k3MdJgdgUIXf1r8YVICmB7PKjdvQOaVu4a5Pp2RJGGqP0nsjRoU3zK3LXFrJM7vEHZi8hGpK9kd4PLHM3VoZL1wPJD5vZUdxHt71PoDW3wIZ6PFRNwZBVrJd2AKONjNYy1vhw2WXEZ3r2RYgOdJPKMqj4b5MXgaU2xZ8hSfyh2UqcvvEXhfJiuMWL+Hj7K2yzqW3rg2vL7//kgczC'), 
            notification: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAIAAF8tAAGlGgABAABwAAAAZGF0YQoGAA=='),
            success: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAIAAF8tAAGlGgABAABwAAAAZGF0YQoGAABBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLKH1//JBeEUuR3zXq3n7HX4yEJvczL6k3MdJgdgUIXf1r8YVICmB7PKjdvQOaVu4a5Pp2RJGGqP0nsjRoU3zK3LXFrJM7vEHZi8hGpK9kd4PLHM3VoZL1wPJD5vZUdxHt71PoDW3wIZ6PFRNwZBVrJd2AKONjNYy1vhw2WXEZ3r2RYgOdJPKMqj4b5MXgaU2xZ8hSfyh2UqcvvEXhfJiuMWL+Hj7K2yzqW3rg2vL7//kgczC'),
            alert: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAIAAF8tAAGlGgABAABwAAAAZGF0YQoGAABBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLKH1//JBeEUuR3zXq3n7HX4yEJvczL6k3MdJgdgUIXf1r8YVICmB7PKjdvQOaVu4a5Pp2RJGGqP0nsjRoU3zK3LXFrJM7vEHZi8hGpK9kd4PLHM3VoZL1wPJD5vZUdxHt71PoDW3wIZ6PFRNwZBVrJd2AKONjNYy1vhw2XXEZ3r2RYgOdJPKMqj4b5MXgaU2xZ8hSfyh2UqcvvEXhfJiuMWL+Hj7K2yzqW3rg2vL7//kgczC'),
            start: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAIAAF8tAAGlGgABAABwAAAAZGF0YQoGAABBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLKH1//JBeEUuR3zXq3n7HX4yEJvczL6k3MdJgdgUIXf1r8YVICmB7PKjdvQOaVu4a5Pp2RJGGqP0nsjRoU3zK3LXFrJM7vEHZi8hGpK9kd4PLHM3VoZL1wPJD5vZUdxHt71PoDW3wIZ6PFRNwZBVrJd2AKONjNYy1vhw2XXEZ3r2RYgOdJPKMqj4b5MXgaU2xZ8hSfyh2UqcvvEXhfJiuMWL+Hj7K2yzqW3rg2vL7//kgczC')
        };
    }

    createSound(base64Data) {
        try {
            const audio = new Audio();
            audio.src = base64Data;
            audio.volume = 0.3;
            audio.preload = 'auto';
            return audio;
        } catch (e) {
            // Fallback to oscillator-based sounds
            return this.createOscillatorSound(440, 0.1);
        }
    }

    createOscillatorSound(frequency, duration) {
        return {
            play: () => {
                if (!this.soundEnabled) return;
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (e) {
                    console.log('Sound not supported');
                }
            }
        };
    }

    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            // Clone and play sound to allow overlapping
            const sound = this.sounds[soundName].cloneNode ? this.sounds[soundName].cloneNode() : this.sounds[soundName];
            if (sound.play) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Sound play failed:', e));
            } else if (sound.play && typeof sound.play === 'function') {
                sound.play();
            }
        } catch (e) {
            console.log('Sound error:', e);
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundIcon = document.getElementById('soundIcon');
        const soundToggle = document.getElementById('soundToggle');
        
        if (this.soundEnabled) {
            soundIcon.className = 'fas fa-volume-up';
            soundToggle.classList.remove('muted');
            this.playSound('click');
        } else {
            soundIcon.className = 'fas fa-volume-mute';
            soundToggle.classList.add('muted');
        }
        
        // Save preference
        localStorage.setItem('demoSoundEnabled', this.soundEnabled);
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                this.playSound('click');
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Sound toggle button
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => this.toggleSound());
        }

        // Patrol Simulator
        const startPatrolBtn = document.getElementById('startPatrol');
        const resetPatrolBtn = document.getElementById('resetPatrol');
        
        if (startPatrolBtn) {
            startPatrolBtn.addEventListener('click', () => {
                this.playSound('start');
                this.togglePatrolSimulation();
            });
        }
        
        if (resetPatrolBtn) {
            resetPatrolBtn.addEventListener('click', () => {
                this.playSound('click');
                this.resetPatrolSimulation();
            });
        }

        // Prediction Dashboard
        const updatePredictionBtn = document.getElementById('updatePrediction');
        if (updatePredictionBtn) {
            updatePredictionBtn.addEventListener('click', () => {
                this.playSound('click');
                this.updatePredictions();
            });
        }

        // Report System
        const submitReportBtn = document.getElementById('submitReport');
        if (submitReportBtn) {
            submitReportBtn.addEventListener('click', () => {
                this.playSound('alert');
                this.submitReport();
            });
        }

        // Report categories
        document.querySelectorAll('.report-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playSound('click');
                this.selectReportCategory(e);
            });
        });

        // Load sound preference
        const savedSoundSetting = localStorage.getItem('demoSoundEnabled');
        if (savedSoundSetting !== null) {
            this.soundEnabled = savedSoundSetting === 'true';
            const soundIcon = document.getElementById('soundIcon');
            const soundToggleEl = document.getElementById('soundToggle');
            if (!this.soundEnabled && soundIcon && soundToggleEl) {
                soundIcon.className = 'fas fa-volume-mute';
                soundToggleEl.classList.add('muted');
            }
        }
    }

    initializeMaps() {
        // Initialize Patrol Map with Naver Maps
        if (document.getElementById('patrolMap')) {
            this.patrolMap = new naver.maps.Map('patrolMap', {
                center: new naver.maps.LatLng(37.741, 127.047),
                zoom: 11,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: naver.maps.MapTypeControlStyle.BUTTON,
                    position: naver.maps.Position.TOP_RIGHT
                },
                zoomControl: true,
                zoomControlOptions: {
                    style: naver.maps.ZoomControlStyle.LARGE,
                    position: naver.maps.Position.TOP_LEFT
                }
            });

            // Add markers for key locations in Gyeonggi North
            this.addPatrolMarkers();
        }

        // Initialize Risk Heatmap
        if (document.getElementById('riskHeatmap')) {
            this.riskMap = new naver.maps.Map('riskHeatmap', {
                center: new naver.maps.LatLng(37.741, 127.047),
                zoom: 11,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: naver.maps.MapTypeControlStyle.BUTTON,
                    position: naver.maps.Position.TOP_RIGHT
                },
                zoomControl: true,
                zoomControlOptions: {
                    style: naver.maps.ZoomControlStyle.LARGE,
                    position: naver.maps.Position.TOP_LEFT
                }
            });

            this.addRiskOverlay();
        }
    }

    addPatrolMarkers() {
        const patrolPoints = [
            { lat: 37.741, lng: 127.047, name: '의정부시청', unit: 'P-001' },
            { lat: 37.658, lng: 126.834, name: '고양시청', unit: 'P-002' },
            { lat: 37.767, lng: 126.780, name: '파주시청', unit: 'P-003' },
            { lat: 37.593, lng: 127.130, name: '구리시청', unit: 'P-004' },
            { lat: 37.636, lng: 127.224, name: '남양주시청', unit: 'P-005' },
            { lat: 37.826, lng: 127.045, name: '양주시청', unit: 'P-006' },
            { lat: 37.903, lng: 127.060, name: '동두천시청', unit: 'P-007' },
            { lat: 38.146, lng: 127.200, name: '포천시청', unit: 'P-008' }
        ];

        patrolPoints.forEach((point, index) => {
            const marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(point.lat, point.lng),
                map: this.patrolMap,
                title: point.name,
                icon: {
                    content: '<div class="patrol-marker"><i class="fas fa-shield-alt" style="color: #1e3a8a; font-size: 20px;"></i></div>',
                    size: new naver.maps.Size(30, 30),
                    anchor: new naver.maps.Point(15, 15)
                }
            });

            const infoWindow = new naver.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 200px; text-align: center;">
                        <strong>${point.name}</strong><br>
                        순찰대: ${point.unit}<br>
                        <span style="color: #16a34a;">● 활성</span>
                    </div>
                `
            });

            naver.maps.Event.addListener(marker, 'click', function() {
                if (infoWindow.getMap()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(this.patrolMap, marker);
                }
            }.bind(this));

            // Store patrol unit info
            this.patrolUnits.push({
                id: point.unit,
                name: point.name,
                lat: point.lat,
                lng: point.lng,
                status: 'active',
                marker: marker,
                infoWindow: infoWindow
            });
        });
    }

    addRiskOverlay() {
        // Enhanced risk data with realistic crime hotspots
        const riskData = [
            // 의정부시 중앙로 (야간 유흥가 집중)
            { lat: 37.741, lng: 127.047, risk: 0.9, area: '의정부시 중앙로' },
            { lat: 37.742, lng: 127.048, risk: 0.85, area: '의정부시 중앙로' },
            { lat: 37.740, lng: 127.046, risk: 0.8, area: '의정부시 중앙로' },
            { lat: 37.743, lng: 127.049, risk: 0.75, area: '의정부시 중앙로' },
            
            // 고양시 일산동구 (대형 쇼핑몰 주변)
            { lat: 37.658, lng: 126.834, risk: 0.7, area: '고양시 일산동구' },
            { lat: 37.659, lng: 126.835, risk: 0.75, area: '고양시 일산동구' },
            { lat: 37.657, lng: 126.833, risk: 0.65, area: '고양시 일산동구' },
            { lat: 37.660, lng: 126.836, risk: 0.6, area: '고양시 일산동구' },
            
            // 파주시 금촌동 (대학가 주변)
            { lat: 37.767, lng: 126.780, risk: 0.6, area: '파주시 금촌동' },
            { lat: 37.768, lng: 126.781, risk: 0.55, area: '파주시 금촌동' },
            { lat: 37.766, lng: 126.779, risk: 0.5, area: '파주시 금촌동' },
            
            // 구리시 수택동 (주거 밀집 지역)
            { lat: 37.593, lng: 127.130, risk: 0.4, area: '구리시 수택동' },
            { lat: 37.594, lng: 127.131, risk: 0.35, area: '구리시 수택동' },
            { lat: 37.592, lng: 127.129, risk: 0.3, area: '구리시 수택동' },
            
            // 남양주시 화도읍 (외곽 지역)
            { lat: 37.636, lng: 127.224, risk: 0.45, area: '남양주시 화도읍' },
            { lat: 37.637, lng: 127.225, risk: 0.4, area: '남양주시 화도읍' },
            { lat: 37.635, lng: 127.223, risk: 0.35, area: '남양주시 화도읍' },
            
            // 양주시 덕계동 (산업 지역)
            { lat: 37.826, lng: 127.045, risk: 0.3, area: '양주시 덕계동' },
            { lat: 37.827, lng: 127.046, risk: 0.25, area: '양주시 덕계동' },
            
            // 동두천시 중앙동 (군부대 인근)
            { lat: 37.903, lng: 127.060, risk: 0.35, area: '동두천시 중앙동' },
            { lat: 37.904, lng: 127.061, risk: 0.3, area: '동두천시 중앙동' },
            
            // 포천시 소흘읍 (농촌 지역)
            { lat: 38.146, lng: 127.200, risk: 0.2, area: '포천시 소흘읍' },
            { lat: 38.147, lng: 127.201, risk: 0.15, area: '포천시 소흘읍' }
        ];

        // Create risk circles using Naver Maps
        riskData.forEach(point => {
            const riskLevel = point.risk;
            let color, strokeColor, description;
            
            if (riskLevel >= 0.8) {
                color = '#dc2626'; // 빨간색 (고위험)
                strokeColor = '#991b1b';
                description = '고위험';
            } else if (riskLevel >= 0.6) {
                color = '#f97316'; // 주황색 (위험)
                strokeColor = '#c2410c';
                description = '위험';
            } else if (riskLevel >= 0.4) {
                color = '#eab308'; // 노란색 (주의)
                strokeColor = '#a16207';
                description = '주의';
            } else {
                color = '#16a34a'; // 녹색 (안전)
                strokeColor = '#15803d';
                description = '안전';
            }

            const circle = new naver.maps.Circle({
                map: this.riskMap,
                center: new naver.maps.LatLng(point.lat, point.lng),
                radius: riskLevel * 800, // 위험도에 따른 반지름
                fillColor: color,
                fillOpacity: 0.3,
                strokeColor: strokeColor,
                strokeOpacity: 0.8,
                strokeWeight: 2
            });

            const infoWindow = new naver.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 150px;">
                        <strong>${point.area}</strong><br>
                        위험도: ${description} (${Math.round(riskLevel * 100)}%)<br>
                        <div style="width: 100%; height: 8px; background: #e5e5e5; border-radius: 4px; margin-top: 5px;">
                            <div style="width: ${riskLevel * 100}%; height: 100%; background: ${color}; border-radius: 4px;"></div>
                        </div>
                    </div>
                `
            });

            naver.maps.Event.addListener(circle, 'click', function() {
                if (infoWindow.getMap()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(this.riskMap, circle.getCenter());
                }
            }.bind(this));
        });

        // Add legend
        this.addRiskLegend();
    }

    addRiskLegend() {
        const legendContent = `
            <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">위험도 범례</h4>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #dc2626; border-radius: 50%;"></div>
                        <span style="font-size: 12px;">고위험 (80%+)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #f97316; border-radius: 50%;"></div>
                        <span style="font-size: 12px;">위험 (60-79%)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #eab308; border-radius: 50%;"></div>
                        <span style="font-size: 12px;">주의 (40-59%)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #16a34a; border-radius: 50%;"></div>
                        <span style="font-size: 12px;">안전 (39% 이하)</span>
                    </div>
                </div>
            </div>
        `;

        const legendControl = new naver.maps.CustomControl(legendContent, {
            position: naver.maps.Position.BOTTOM_LEFT
        });

        legendControl.setMap(this.riskMap);
    }
                1.0: '#7c2d12'   // 진한 빨간색 (매우 위험)
            }
        }).addTo(this.riskMap);

        // Add detailed risk area markers with enhanced popups
        const riskAreas = [
            { 
                lat: 37.741, lng: 127.047, risk: 0.9, area: '의정부시 중앙로',
                details: '야간 유흥가 집중 지역<br>• 주요 위험요소: 음주관련 사건<br>• 집중시간: 22:00-04:00<br>• 월평균 신고: 23건'
            },
            { 
                lat: 37.658, lng: 126.834, risk: 0.7, area: '고양시 일산동구',
                details: '대형 쇼핑몰 주변<br>• 주요 위험요소: 절도, 분실<br>• 집중시간: 14:00-20:00<br>• 월평균 신고: 18건'
            },
            { 
                lat: 37.767, lng: 126.780, risk: 0.6, area: '파주시 금촌동',
                details: '대학가 주변 지역<br>• 주요 위험요소: 소음, 질서<br>• 집중시간: 18:00-24:00<br>• 월평균 신고: 12건'
            },
            { 
                lat: 37.593, lng: 127.130, risk: 0.4, area: '구리시 수택동',
                details: '주거 밀집 지역<br>• 주요 위험요소: 생활소음<br>• 집중시간: 전 시간대<br>• 월평균 신고: 8건'
            },
            { 
                lat: 37.636, lng: 127.224, risk: 0.45, area: '남양주시 화도읍',
                details: '외곽 농촌 지역<br>• 주요 위험요소: 교통사고<br>• 집중시간: 07:00-09:00<br>• 월평균 신고: 6건'
            }
        ];

        riskAreas.forEach(area => {
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="
                    background: ${area.risk > 0.8 ? '#dc2626' : area.risk > 0.6 ? '#f97316' : area.risk > 0.4 ? '#eab308' : '#16a34a'};
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            const marker = L.marker([area.lat, area.lng], { icon: icon }).addTo(this.riskMap);
            
            marker.bindPopup(`
                <div class="p-2" style="min-width: 200px;">
                    <div class="font-bold text-sm mb-2">${area.area}</div>
                    <div class="text-xs mb-2">
                        위험도: <span style="color: ${area.risk > 0.8 ? '#dc2626' : area.risk > 0.6 ? '#f97316' : area.risk > 0.4 ? '#eab308' : '#16a34a'}; font-weight: bold;">
                            ${(area.risk * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div class="text-xs text-gray-600">${area.details}</div>
                    <div class="mt-2 text-xs">
                        <div style="width: 100%; background: #e5e7eb; border-radius: 6px; height: 6px;">
                            <div style="width: ${area.risk * 100}%; background: ${area.risk > 0.8 ? '#dc2626' : area.risk > 0.6 ? '#f97316' : area.risk > 0.4 ? '#eab308' : '#16a34a'}; height: 6px; border-radius: 6px;"></div>
                        </div>
                    </div>
                </div>
            `, {
                closeButton: true,
                autoClose: false,
                className: 'custom-popup'
            });
        });

        // Store heatmap data for real-time updates
        this.currentHeatmapData = heatmapData;
        
        // Add control to toggle heatmap
        const heatmapControl = L.control({ position: 'topright' });
        heatmapControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            div.style.backgroundColor = 'white';
            div.style.padding = '5px 10px';
            div.style.fontSize = '12px';
            div.style.cursor = 'pointer';
            div.innerHTML = '<i class="fas fa-fire"></i> 히트맵';
            div.onclick = function() {
                // Toggle heatmap visibility (to be implemented)
            };
            return div;
        };
        heatmapControl.addTo(this.riskMap);
    }

    initializeCharts() {
        this.initPredictionChart();
        this.initPerformanceChart();
    }

    initPredictionChart() {
        const ctx = document.getElementById('predictionChart');
        if (!ctx) return;

        const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
        const riskData = hours.map(() => Math.random() * 100);

        this.predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: '예측 위험도',
                    data: riskData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        const timeLabels = Array.from({length: 20}, (_, i) => {
            const time = new Date();
            time.setMinutes(time.getMinutes() - (19 - i) * 5);
            return time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        });

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: '대응시간',
                        data: Array.from({length: 20}, () => Math.random() * 15 + 5),
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: '순찰 효율성',
                        data: Array.from({length: 20}, () => Math.random() * 30 + 70),
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    togglePatrolSimulation() {
        const btn = document.getElementById('startPatrol');
        
        if (!this.simulationRunning) {
            this.startPatrolSimulation();
            btn.innerHTML = '<i class="fas fa-pause mr-2"></i>순찰 중지';
            btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            btn.classList.add('bg-red-600', 'hover:bg-red-700');
        } else {
            this.stopPatrolSimulation();
            btn.innerHTML = '<i class="fas fa-play mr-2"></i>순찰 시작';
            btn.classList.remove('bg-red-600', 'hover:bg-red-700');
            btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }
    }

    startPatrolSimulation() {
        this.simulationRunning = true;
        let seconds = 0;
        
        this.simulationTimer = setInterval(() => {
            seconds++;
            this.updateSimulationTime(seconds);
            this.updatePatrolStatus();
            this.generateRandomEvent();
        }, 1000);

        this.addActivity('시뮬레이션 시작', 'info');
    }

    stopPatrolSimulation() {
        this.simulationRunning = false;
        if (this.simulationTimer) {
            clearInterval(this.simulationTimer);
            this.simulationTimer = null;
        }
        this.addActivity('시뮬레이션 중지', 'warning');
    }

    resetPatrolSimulation() {
        this.stopPatrolSimulation();
        document.getElementById('simTime').textContent = '00:00:00';
        document.getElementById('processedReports').textContent = '0';
        document.getElementById('preventedIncidents').textContent = '0';
        document.getElementById('patrolUnits').innerHTML = '';
        document.getElementById('recentActivity').innerHTML = '';
        
        const btn = document.getElementById('startPatrol');
        btn.innerHTML = '<i class="fas fa-play mr-2"></i>순찰 시작';
        btn.classList.remove('bg-red-600', 'hover:bg-red-700');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');

        this.addActivity('시뮬레이션 초기화', 'info');
    }

    updateSimulationTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        document.getElementById('simTime').textContent = timeStr;
    }

    updatePatrolStatus() {
        // Update patrol units display
        const container = document.getElementById('patrolUnits');
        if (!container) return;

        container.innerHTML = '';
        this.patrolUnits.slice(0, 5).forEach(unit => {
            const status = Math.random() > 0.8 ? 'busy' : 'active';
            const statusColor = status === 'active' ? 'green' : 'orange';
            
            container.innerHTML += `
                <div class="flex justify-between items-center p-2 bg-white rounded border">
                    <span class="text-sm font-medium">${unit.id}</span>
                    <div class="flex items-center">
                        <div class="w-2 h-2 bg-${statusColor}-500 rounded-full mr-2"></div>
                        <span class="text-xs">${status === 'active' ? '대기' : '출동'}</span>
                    </div>
                </div>
            `;
        });

        // Update statistics
        const processedReports = parseInt(document.getElementById('processedReports').textContent) + Math.floor(Math.random() * 2);
        const preventedIncidents = parseInt(document.getElementById('preventedIncidents').textContent) + Math.floor(Math.random() * 1.5);
        
        document.getElementById('processedReports').textContent = processedReports;
        document.getElementById('preventedIncidents').textContent = preventedIncidents;

        // Update coverage rate
        const newCoverage = 75 + Math.random() * 10;
        document.getElementById('coverageRate').textContent = Math.round(newCoverage) + '%';

        // Update response time
        const newResponseTime = 8 + Math.random() * 8;
        document.getElementById('avgResponse').textContent = newResponseTime.toFixed(1);
    }

    generateRandomEvent() {
        if (Math.random() < 0.1) { // 10% chance per second
            const events = [
                '순찰대 P-001 의정부 중앙로 도착',
                '신고 접수: 고양시 일산동구 소음 신고',
                '예방 활동: 파주시 금촌동 순찰 강화',
                'AI 분석: 남양주시 위험도 상승 감지',
                '순찰대 P-003 교통사고 현장 대응 완료',
                '시민 신고: 구리시 수택동 수상한 인물 목격'
            ];
            
            const event = events[Math.floor(Math.random() * events.length)];
            this.addActivity(event, 'info');
        }
    }

    addActivity(message, type = 'info') {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const time = new Date().toLocaleTimeString('ko-KR');
        const iconClass = type === 'info' ? 'fa-info-circle text-blue-500' : 
                         type === 'warning' ? 'fa-exclamation-triangle text-orange-500' : 
                         'fa-check-circle text-green-500';

        const activityHTML = `
            <div class="flex items-start space-x-2 p-2 bg-white rounded border">
                <i class="fas ${iconClass} mt-1 flex-shrink-0"></i>
                <div class="flex-1">
                    <div class="text-sm">${message}</div>
                    <div class="text-xs text-gray-500">${time}</div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('afterbegin', activityHTML);

        // Keep only last 10 activities
        while (container.children.length > 10) {
            container.removeChild(container.lastChild);
        }
    }

    updatePredictions() {
        // Simulate prediction update
        this.showNotification('AI 예측 모델이 업데이트되었습니다', 'success');
        
        // Update prediction chart with new data
        if (this.predictionChart) {
            const newData = Array.from({length: 24}, () => Math.random() * 100);
            this.predictionChart.data.datasets[0].data = newData;
            this.predictionChart.update();
        }

        // Update heatmap with new risk data
        this.updateHeatmap();
    }

    updateHeatmap() {
        if (!this.heatLayer || !this.currentHeatmapData) return;

        // Generate new heatmap data based on time and conditions
        const currentHour = new Date().getHours();
        const isNightTime = currentHour >= 22 || currentHour <= 6;
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

        const updatedData = this.currentHeatmapData.map(point => {
            let intensity = point[2];
            
            // Increase intensity during night time
            if (isNightTime) {
                intensity *= 1.3;
            }
            
            // Increase intensity during weekends
            if (isWeekend) {
                intensity *= 1.2;
            }
            
            // Add some random variation
            intensity *= (0.8 + Math.random() * 0.4);
            
            // Cap at 1.0
            intensity = Math.min(intensity, 1.0);
            
            return [point[0], point[1], intensity];
        });

        // Update heatmap
        this.riskMap.removeLayer(this.heatLayer);
        this.heatLayer = L.heatLayer(updatedData, {
            radius: 50,
            blur: 35,
            maxZoom: 18,
            max: 1.0,
            gradient: {
                0.0: '#16a34a',
                0.3: '#eab308',
                0.6: '#f97316',
                0.8: '#dc2626',
                1.0: '#7c2d12'
            }
        }).addTo(this.riskMap);

        // Show update animation
        const heatmapContainer = document.querySelector('.heatmap-container');
        if (heatmapContainer) {
            heatmapContainer.style.transition = 'all 0.3s ease';
            heatmapContainer.style.transform = 'scale(1.02)';
            setTimeout(() => {
                heatmapContainer.style.transform = 'scale(1)';
            }, 300);
        }
    }

    selectReportCategory(event) {
        // Remove previous selection
        document.querySelectorAll('.report-category').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });

        // Add selection to clicked category
        event.currentTarget.classList.add('ring-2', 'ring-blue-500');
    }

    submitReport() {
        const description = document.getElementById('reportDescription').value;
        const selectedCategory = document.querySelector('.report-category.ring-2');
        
        if (!description.trim()) {
            this.showNotification('신고 내용을 입력해주세요', 'error');
            return;
        }

        if (!selectedCategory) {
            this.showNotification('신고 유형을 선택해주세요', 'error');
            return;
        }

        // Simulate report submission
        const reportStatus = document.getElementById('reportStatus');
        reportStatus.textContent = '신고 접수 중...';
        reportStatus.className = 'text-center text-sm text-orange-500';

        setTimeout(() => {
            reportStatus.textContent = '신고 접수 완료 - 순찰대 출동';
            reportStatus.className = 'text-center text-sm text-green-500';
            
            // Clear form
            document.getElementById('reportDescription').value = '';
            document.querySelectorAll('.report-category').forEach(btn => {
                btn.classList.remove('ring-2', 'ring-blue-500');
            });

            // Add to live reports
            this.addLiveReport();
            
            // Update statistics
            const todayReports = parseInt(document.getElementById('todayReports').textContent) + 1;
            document.getElementById('todayReports').textContent = todayReports;

            setTimeout(() => {
                reportStatus.textContent = '신고 준비 완료';
                reportStatus.className = 'text-center text-sm text-gray-500';
            }, 3000);
        }, 2000);

        this.showNotification('신고가 접수되었습니다', 'success');
    }

    addLiveReport() {
        const container = document.getElementById('liveReports');
        if (!container) return;

        const reportTypes = ['긴급신고', '교통사고', '사회적약자', '생활안전'];
        const locations = ['의정부시', '고양시', '파주시', '구리시', '남양주시'];
        
        const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const time = new Date().toLocaleTimeString('ko-KR');

        const reportHTML = `
            <div class="flex justify-between items-center p-3 bg-white rounded border">
                <div>
                    <div class="text-sm font-medium">${type}</div>
                    <div class="text-xs text-gray-600">${location} • ${time}</div>
                </div>
                <div class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">처리중</div>
            </div>
        `;

        container.insertAdjacentHTML('afterbegin', reportHTML);

        // Keep only last 5 reports
        while (container.children.length > 5) {
            container.removeChild(container.lastChild);
        }
    }

    startRealTimeUpdates() {
        // Update real-time monitor every 5 seconds
        setInterval(() => {
            this.updateSystemAlerts();
            this.updateActivePatrolsList();
            this.updatePerformanceChart();
            this.updateLastUpdateTime();
        }, 5000);

        // Initial population
        this.updateSystemAlerts();
        this.updateActivePatrolsList();
    }

    updateSystemAlerts() {
        const container = document.getElementById('systemAlerts');
        if (!container) return;

        const alertTypes = [
            { type: 'info', icon: 'fa-info-circle', color: 'text-blue-400', message: 'AI 모델 정확도 87.3% 유지' },
            { type: 'warning', icon: 'fa-exclamation-triangle', color: 'text-yellow-400', message: '고양시 일산동구 위험도 상승' },
            { type: 'success', icon: 'fa-check-circle', color: 'text-green-400', message: '순찰대 P-005 사건 해결 완료' },
            { type: 'info', icon: 'fa-sync-alt', color: 'text-blue-400', message: '데이터 동기화 완료' }
        ];

        if (Math.random() < 0.3) { // 30% chance to add new alert
            const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const time = new Date().toLocaleTimeString('ko-KR');
            
            const alertHTML = `
                <div class="flex items-center space-x-3 p-2 border-l-2 border-${alert.color.replace('text-', '')} bg-gray-800">
                    <i class="fas ${alert.icon} ${alert.color}"></i>
                    <div class="flex-1">
                        <div class="text-sm">${alert.message}</div>
                        <div class="text-xs text-gray-400">${time}</div>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML('afterbegin', alertHTML);

            // Keep only last 8 alerts
            while (container.children.length > 8) {
                container.removeChild(container.lastChild);
            }
        }
    }

    updateActivePatrolsList() {
        const container = document.getElementById('activePatrolsList');
        if (!container) return;

        container.innerHTML = '';
        this.patrolUnits.slice(0, 6).forEach(unit => {
            const status = Math.random() > 0.7 ? 'busy' : 'active';
            const statusText = status === 'active' ? '대기중' : '출동중';
            const statusColor = status === 'active' ? 'green' : 'orange';
            
            container.innerHTML += `
                <div class="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                        <div class="text-sm font-medium">${unit.id}</div>
                        <div class="text-xs text-gray-600">${unit.name}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="w-2 h-2 bg-${statusColor}-500 rounded-full mr-2"></div>
                        <span class="text-xs">${statusText}</span>
                    </div>
                </div>
            `;
        });
    }

    updateLastUpdateTime() {
        const element = document.getElementById('lastUpdate');
        if (element) {
            element.textContent = '방금 전';
        }
    }

    generateInitialData() {
        // Generate initial live reports
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.addLiveReport(), i * 1000);
        }

        // Generate initial system alerts
        for (let i = 0; i < 4; i++) {
            setTimeout(() => this.updateSystemAlerts(), i * 500);
        }
    }

    showNotification(message, type = 'info') {
        // Play appropriate sound
        if (type === 'success') {
            this.playSound('success');
        } else if (type === 'error') {
            this.playSound('alert');
        } else {
            this.playSound('notification');
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg notification max-w-sm`;
        
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 
                       type === 'warning' ? 'bg-orange-500' : 'bg-blue-500';
        
        notification.classList.add(bgColor);
        notification.innerHTML = `
            <div class="text-white">
                <div class="flex items-center">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-2"></i>
                    <span class="text-sm">${message}</span>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DemoController();
});
