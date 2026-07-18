/**
 * ToolNest Design System Controller
 * Handles interactions, theme toggling, card glow effects, and swatches.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCardGlowEffects();
    initColorSwatches();
    initFormDemo();
});

/**
 * 1. THEME MANAGEMENT (Light / Dark Mode Toggle)
 */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    // Check system preference or local storage
    const storedTheme = localStorage.getItem('toolnest-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark mode for premium look, override if light is stored
    let activeTheme = storedTheme || (prefersDark ? 'dark' : 'dark'); 
    
    if (storedTheme) {
        activeTheme = storedTheme;
    }

    setTheme(activeTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('toolnest-theme', theme);

    // Update toggle icons if they exist in the DOM
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    const textLabel = document.querySelector('.theme-text-label');

    if (theme === 'light') {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
        if (textLabel) textLabel.textContent = 'Dark Mode';
    } else {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
        if (textLabel) textLabel.textContent = 'Light Mode';
    }
}

/**
 * 2. PREMIUM MOUSE-TRACKING GLOW EFFECTS FOR CARDS
 * Dynamically updates custom mouse X/Y properties on cards
 */
function initCardGlowEffects() {
    const glowCards = document.querySelectorAll('.card-glow');
    
    glowCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/**
 * 3. COLOR PALETTE SWATCH COPIER WITH TOAST FEEDBACK
 */
function initColorSwatches() {
    const swatches = document.querySelectorAll('.swatch-card');
    
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const colorVal = swatch.getAttribute('data-color');
            if (!colorVal) return;

            copyToClipboard(colorVal, () => {
                showToast(`Copied: ${colorVal}`);
            });
        });
    });
}

function copyToClipboard(text, callback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(callback)
            .catch(err => {
                fallbackCopyToClipboard(text, callback);
            });
    } else {
        fallbackCopyToClipboard(text, callback);
    }
}

function fallbackCopyToClipboard(text, callback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful && callback) {
            callback();
        } else if (!successful) {
            console.error('Fallback: Copying text command was unsuccessful');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
}

/**
 * Toast Notification System
 */
function showToast(message) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast-notification card card-glass flex items-center gap-1-5 anim-slide-up';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.border = '1px solid var(--primary)';
    
    toast.innerHTML = `
        <svg class="icon text-gradient" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span style="font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--text-main);">${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.2s reverse forwards';
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

/**
 * 4. DEMO FORM SUBMISSION HANDLERS
 */
function initFormDemo() {
    const demoForm = document.getElementById('demo-form');
    if (!demoForm) return;

    demoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('demo-name');
        const emailInput = document.getElementById('demo-email');
        let isValid = true;

        // Simple validation visualization
        if (!nameInput.value.trim()) {
            nameInput.classList.add('input-error');
            const errorMsg = document.getElementById('name-error');
            if (errorMsg) errorMsg.style.display = 'block';
            isValid = false;
        } else {
            nameInput.classList.remove('input-error');
            nameInput.classList.add('input-success');
            const errorMsg = document.getElementById('name-error');
            if (errorMsg) errorMsg.style.display = 'none';
        }

        if (!emailInput.value.includes('@')) {
            emailInput.classList.add('input-error');
            const errorMsg = document.getElementById('email-error');
            if (errorMsg) errorMsg.style.display = 'block';
            isValid = false;
        } else {
            emailInput.classList.remove('input-error');
            emailInput.classList.add('input-success');
            const errorMsg = document.getElementById('email-error');
            if (errorMsg) errorMsg.style.display = 'none';
        }

        if (isValid) {
            showToast('Form submitted successfully!');
            demoForm.reset();
            setTimeout(() => {
                nameInput.classList.remove('input-success');
                emailInput.classList.remove('input-success');
            }, 3000);
        }
    });
}
