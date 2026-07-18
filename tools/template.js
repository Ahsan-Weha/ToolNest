/**
 * Reusable Tool Page Template Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    initTemplateFaqAccordions();
    initDemoActions();
});

/**
 * 1. DRAG AND DROP ZONE INTERACTIVES
 */
function initDragAndDrop() {
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectedFileDetails = document.getElementById('selected-file-details');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const conversionAlert = document.getElementById('conversion-success-alert');

    if (!dropzone || !fileInput) return;

    // Trigger file dialog on click
    dropzone.addEventListener('click', () => fileInput.click());

    // Sync input select
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            handleFileSelection(fileInput.files[0]);
        }
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    function handleFileSelection(file) {
        // Display file meta
        selectedFileDetails.style.display = 'block';
        selectedFileDetails.querySelector('.file-name').textContent = file.name;
        selectedFileDetails.querySelector('.file-size').textContent = formatBytes(file.size);
        
        // Hide previous alerts
        if (conversionAlert) conversionAlert.style.display = 'none';

        // Simulate conversion progress
        simulateConversion();
    }

    function simulateConversion() {
        if (!progressContainer || !progressBar) return;

        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';

        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    // Success state
                    progressContainer.style.display = 'none';
                    if (conversionAlert) {
                        conversionAlert.style.display = 'flex';
                        conversionAlert.classList.add('anim-fade-in');
                    }
                    showToast('File processed successfully!');
                }, 400);
            } else {
                width += 10;
                progressBar.style.width = width + '%';
            }
        }, 120);
    }
}

/**
 * 2. TEMPLATE ACCORDION EXPANSION
 */
function initTemplateFaqAccordions() {
    const accordions = document.querySelectorAll('.faq-accordion');
    
    accordions.forEach(acc => {
        const trigger = acc.querySelector('.faq-trigger');
        const content = acc.querySelector('.faq-content');
        
        if (!trigger || !content) return;

        trigger.addEventListener('click', () => {
            const isActive = acc.classList.contains('active');
            
            // Close other items
            accordions.forEach(other => {
                if (other !== acc) {
                    other.classList.remove('active');
                    const otherContent = other.querySelector('.faq-content');
                    if (otherContent) otherContent.style.maxHeight = null;
                }
            });
            
            // Toggle active state
            if (isActive) {
                acc.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                acc.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/**
 * 3. RESET & COPY ACTIONS
 */
function initDemoActions() {
    const resetBtn = document.getElementById('tool-reset');
    const copyBtn = document.getElementById('tool-copy');
    const fileInput = document.getElementById('file-input');
    const selectedFileDetails = document.getElementById('selected-file-details');
    const progressContainer = document.getElementById('progress-container');
    const conversionAlert = document.getElementById('conversion-success-alert');
    const textInput = document.getElementById('input-text');
    const textOutput = document.getElementById('output-text');

    // Reset button handler
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
            if (selectedFileDetails) selectedFileDetails.style.display = 'none';
            if (progressContainer) progressContainer.style.display = 'none';
            if (conversionAlert) conversionAlert.style.display = 'none';
            if (textInput) textInput.value = '';
            if (textOutput) textOutput.value = '';
            showToast('Tool configurations reset');
        });
    }

    // Copy text output handler
    if (copyBtn && textOutput) {
        copyBtn.addEventListener('click', () => {
            const outputVal = textOutput.value;
            if (!outputVal.trim()) {
                showToast('Output is empty!');
                return;
            }

            copyToClipboard(outputVal, () => {
                showToast('Output copied to clipboard!');
            });
        });
    }
}

/**
 * UTILITY HELPERS
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
