(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // UI Elements
        const selectGradType = document.getElementById('grad-type');
        const groupAngle = document.getElementById('group-angle');
        const sliderAngle = document.getElementById('slider-angle');
        const labelAngle = document.getElementById('label-angle');

        const groupRadial = document.getElementById('group-radial');
        const selectRadialShape = document.getElementById('select-radial-shape');
        const selectRadialPos = document.getElementById('select-radial-pos');

        const stopSliderTrack = document.getElementById('stop-slider-track');
        const stopHandlesContainer = document.getElementById('stop-handles-container');

        const labelActiveStop = document.getElementById('label-active-stop');
        const btnDeleteStop = document.getElementById('btn-delete-stop');
        const activeStopColorNative = document.getElementById('active-stop-color-native');
        const activeStopColorHex = document.getElementById('active-stop-color-hex');
        const sliderStopPos = document.getElementById('slider-stop-pos');
        const labelStopPos = document.getElementById('label-stop-pos');

        const previewCanvas = document.getElementById('gradient-preview-canvas');
        const outputCss = document.getElementById('output-css');
        const btnDownloadCss = document.getElementById('btn-download-css');

        const resetBtn = document.getElementById('tool-reset');

        // Presets Database
        const PRESETS = {
            sunset: { type: 'linear', angle: 90, stops: [{ color: '#f12711', pos: 0 }, { color: '#f5af19', pos: 100 }] },
            ocean: { type: 'linear', angle: 90, stops: [{ color: '#2b5876', pos: 0 }, { color: '#4e4376', pos: 100 }] },
            neon: { type: 'linear', angle: 90, stops: [{ color: '#00f2fe', pos: 0 }, { color: '#4facfe', pos: 100 }] },
            lavender: { type: 'linear', angle: 90, stops: [{ color: '#a18cd1', pos: 0 }, { color: '#fbc2eb', pos: 100 }] },
            emerald: { type: 'linear', angle: 90, stops: [{ color: '#11998e', pos: 0 }, { color: '#38ef7d', pos: 100 }] }
        };

        // State variables
        let gradientType = 'linear';
        let angle = 90;
        let radialShape = 'circle';
        let radialPos = 'center';
        let stops = [
            { id: 1, color: '#6366f1', pos: 0 },
            { id: 2, color: '#a855f7', pos: 100 }
        ];
        let nextStopId = 3;
        let activeStopId = 1;

        // Toggle Type event
        selectGradType.addEventListener('change', (e) => {
            gradientType = e.target.value;
            if (gradientType === 'linear') {
                groupAngle.style.display = 'block';
                groupRadial.style.display = 'none';
            } else {
                groupAngle.style.display = 'none';
                groupRadial.style.display = 'grid';
            }
            updateGradient();
        });

        // Angle Slider events
        sliderAngle.addEventListener('input', (e) => {
            angle = e.target.value;
            labelAngle.textContent = `${angle}°`;
            updateGradient();
        });

        // Radial options events
        selectRadialShape.addEventListener('change', (e) => {
            radialShape = e.target.value;
            updateGradient();
        });
        selectRadialPos.addEventListener('change', (e) => {
            radialPos = e.target.value;
            updateGradient();
        });

        // Add stop by clicking track
        stopSliderTrack.addEventListener('click', (e) => {
            if (e.target !== stopSliderTrack) return; // ignore clicks on handles themselves
            const rect = stopSliderTrack.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.min(100, Math.max(0, Math.round((clickX / rect.width) * 100)));

            // Find closest color to inherit
            let closestStop = stops[0];
            let minDist = 999;
            stops.forEach(s => {
                const dist = Math.abs(s.pos - pct);
                if (dist < minDist) {
                    minDist = dist;
                    closestStop = s;
                }
            });

            // Create new stop
            const newStop = {
                id: nextStopId++,
                color: closestStop.color,
                pos: pct
            };

            stops.push(newStop);
            activeStopId = newStop.id;
            updateGradient();
            showToast('New color stop added');
        });

        // Edit Active Stop Color
        activeStopColorNative.addEventListener('input', (e) => {
            const stop = stops.find(s => s.id === activeStopId);
            if (stop) {
                stop.color = e.target.value;
                activeStopColorHex.value = e.target.value;
                updateGradient();
            }
        });
        activeStopColorHex.addEventListener('input', (e) => {
            const stop = stops.find(s => s.id === activeStopId);
            if (stop && isValidHex(e.target.value)) {
                stop.color = e.target.value;
                activeStopColorNative.value = e.target.value;
                updateGradient();
            }
        });

        // Edit Active Stop Position
        sliderStopPos.addEventListener('input', (e) => {
            const stop = stops.find(s => s.id === activeStopId);
            if (stop) {
                stop.pos = parseInt(e.target.value);
                labelStopPos.textContent = `${stop.pos}%`;
                updateGradient();
            }
        });

        // Delete Stop
        btnDeleteStop.addEventListener('click', () => {
            if (stops.length <= 2) {
                showToast('A gradient requires at least 2 color stops', 'warning');
                return;
            }
            stops = stops.filter(s => s.id !== activeStopId);
            activeStopId = stops[0].id;
            updateGradient();
            showToast('Color stop removed');
        });

        // Load Presets
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', () => {
                const name = card.getAttribute('data-preset');
                const preset = PRESETS[name];
                if (preset) {
                    gradientType = preset.type;
                    selectGradType.value = preset.type;
                    if (preset.type === 'linear') {
                        angle = preset.angle;
                        sliderAngle.value = preset.angle;
                        labelAngle.textContent = `${angle}°`;
                        groupAngle.style.display = 'block';
                        groupRadial.style.display = 'none';
                    }
                    stops = preset.stops.map((s, idx) => ({
                        id: idx + 1,
                        color: s.color,
                        pos: s.pos
                    }));
                    nextStopId = stops.length + 1;
                    activeStopId = 1;
                    updateGradient();
                    showToast(`${card.querySelector('span').textContent} loaded`);
                }
            });
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            gradientType = 'linear';
            selectGradType.value = 'linear';
            angle = 90;
            sliderAngle.value = 90;
            labelAngle.textContent = '90°';
            groupAngle.style.display = 'block';
            groupRadial.style.display = 'none';

            stops = [
                { id: 1, color: '#6366f1', pos: 0 },
                { id: 2, color: '#a855f7', pos: 100 }
            ];
            nextStopId = 3;
            activeStopId = 1;

            updateGradient();
            showToast('Reset completed.');
        });

        // Download CSS
        btnDownloadCss.addEventListener('click', () => {
            const cssContent = `/* CSS Generated via ToolNest Gradient Tool */\n.gradient-bg {\n    ${outputCss.value.trim()}\n}\n`;
            const blob = new Blob([cssContent], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gradient.css';
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSS file downloaded');
        });

        // Copy setup
        document.querySelectorAll('.copy-btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput && targetInput.value) {
                    navigator.clipboard.writeText(targetInput.value).then(() => {
                        showToast('Copied to clipboard!');
                    }).catch(() => {
                        showToast('Copy failed.', 'error');
                    });
                }
            });
        });

        // Core Gradient Update Engine
        function updateGradient() {
            // Sort stops by position
            const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);

            // Construct style string
            const stopsString = sortedStops.map(s => `${s.color} ${s.pos}%`).join(', ');
            let styleVal = '';

            if (gradientType === 'linear') {
                styleVal = `linear-gradient(${angle}deg, ${stopsString})`;
            } else {
                styleVal = `radial-gradient(${radialShape} at ${radialPos}, ${stopsString})`;
            }

            // Apply style to preview
            previewCanvas.style.background = styleVal;

            // Update track background (always horizontal linear for preview)
            const trackStopsString = sortedStops.map(s => `${s.color} ${s.pos}%`).join(', ');
            stopSliderTrack.style.background = `linear-gradient(to right, ${trackStopsString})`;

            // Update output value
            outputCss.value = `background: ${styleVal};\nbackground: -webkit-${styleVal};`;

            // Sync active stop controls
            syncActiveStopControls();

            // Re-render stop handle dragging cards
            renderHandles();
        }

        function syncActiveStopControls() {
            const stop = stops.find(s => s.id === activeStopId);
            if (stop) {
                labelActiveStop.textContent = `Active Stop: #${stops.indexOf(stop) + 1}`;
                activeStopColorNative.value = stop.color;
                activeStopColorHex.value = stop.color.toUpperCase();
                sliderStopPos.value = stop.pos;
                labelStopPos.textContent = `${stop.pos}%`;
                btnDeleteStop.disabled = stops.length <= 2;
                if (stops.length <= 2) {
                    btnDeleteStop.style.opacity = '0.5';
                    btnDeleteStop.style.cursor = 'not-allowed';
                } else {
                    btnDeleteStop.style.opacity = '1';
                    btnDeleteStop.style.cursor = 'pointer';
                }
            }
        }

        // Render Handles & Handle Drags
        function renderHandles() {
            stopHandlesContainer.innerHTML = '';
            const rect = stopSliderTrack.getBoundingClientRect();
            const trackWidth = rect.width || 320; // fallback if element not visible initially

            stops.forEach(stop => {
                const handle = document.createElement('div');
                handle.style.position = 'absolute';
                handle.style.width = '20px';
                handle.style.height = '20px';
                handle.style.borderRadius = '50%';
                handle.style.backgroundColor = stop.color;
                handle.style.border = stop.id === activeStopId ? '2px solid white' : '2px solid rgba(255,255,255,0.4)';
                handle.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
                handle.style.top = '9px';
                handle.style.left = `calc(${stop.pos}% - 10px + 10px)`; // Adjust offset due to padding margins
                handle.style.cursor = 'grab';
                handle.style.pointerEvents = 'auto'; // allow mouse actions
                handle.title = `Stop #${stops.indexOf(stop) + 1}: ${stop.pos}%`;

                // Handle click/selection
                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    activeStopId = stop.id;
                    updateGradient();

                    const onMouseMove = (moveEvent) => {
                        const trackRect = stopSliderTrack.getBoundingClientRect();
                        const dragX = moveEvent.clientX - trackRect.left;
                        let pct = Math.round((dragX / trackRect.width) * 100);
                        pct = Math.min(100, Math.max(0, pct));

                        stop.pos = pct;
                        updateGradient();
                    };

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });

                // Support mobile touch events
                handle.addEventListener('touchstart', (e) => {
                    activeStopId = stop.id;
                    updateGradient();

                    const onTouchMove = (moveEvent) => {
                        const trackRect = stopSliderTrack.getBoundingClientRect();
                        const touch = moveEvent.touches[0];
                        const dragX = touch.clientX - trackRect.left;
                        let pct = Math.round((dragX / trackRect.width) * 100);
                        pct = Math.min(100, Math.max(0, pct));

                        stop.pos = pct;
                        updateGradient();
                    };

                    const onTouchEnd = () => {
                        document.removeEventListener('touchmove', onTouchMove);
                        document.removeEventListener('touchend', onTouchEnd);
                    };

                    document.addEventListener('touchmove', onTouchMove, { passive: true });
                    document.addEventListener('touchend', onTouchEnd);
                });

                stopHandlesContainer.appendChild(handle);
            });
        }

        // Helpers
        function isValidHex(hex) {
            return /^#[0-9A-F]{6}$/i.test(hex) || /^#[0-9A-F]{3}$/i.test(hex);
        }

        function showToast(message, type = 'success') {
            if (window.TN && window.TN.toast) {
                window.TN.toast.show(message, type);
            } else {
                console.log(type + ": " + message);
            }
        }

        // Delay slightly to ensure layout rendering has correct DOM rect calculations
        setTimeout(() => {
            updateGradient();
        }, 100);
    });
})();
