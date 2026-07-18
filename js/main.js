/**
 * ToolNest Homepage Controller
 */

// Tool database index
const tools = [
    {
        id: 'pdf-compressor',
        name: 'PDF Compressor',
        desc: 'Reduce PDF file sizes dramatically while keeping document layout and quality intact.',
        category: 'pdf',
        url: 'tools/pdf-compressor/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
        popular: true,
        featured: true,
        keywords: ['pdf', 'compress', 'shrink', 'size']
    },
    {
        id: 'pdf-to-jpg',
        name: 'PDF to JPG',
        desc: 'Extract all pages from a PDF document and convert them into high-quality JPEG images.',
        category: 'pdf',
        url: 'tools/pdf-to-jpg/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false,
        featured: false,
        keywords: ['pdf', 'jpg', 'convert', 'extract', 'jpeg']
    },
    {
        id: 'image-resizer',
        name: 'Image Resizer',
        desc: 'Change width and height dimensions of images in bulk. Save as WebP, PNG, or JPG.',
        category: 'image',
        url: 'tools/image-resizer/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5"/></svg>`,
        popular: true,
        featured: false,
        keywords: ['image', 'resize', 'dimensions', 'width', 'height', 'scale']
    },
    {
        id: 'png-to-webp',
        name: 'PNG to WebP Converter',
        desc: 'Convert PNG images to WebP format for optimal website speed and compression.',
        category: 'image',
        url: 'tools/png-to-webp/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M7 16V4m0 12l-3-3m3 3l3-3m3 3V4m0 12l-3-3m3 3l3-3m3-5h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false,
        featured: true,
        keywords: ['png', 'webp', 'convert', 'image', 'speed']
    },
    {
        id: 'markdown-editor',
        name: 'Markdown Editor',
        desc: 'Live preview Markdown editor to format and write content quickly. Copy as HTML.',
        category: 'text',
        url: 'tools/markdown-editor/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
        popular: true,
        featured: true,
        keywords: ['markdown', 'editor', 'write', 'html', 'format']
    },
    {
        id: 'word-counter',
        name: 'Word Counter',
        desc: 'Calculate characters, words, sentences, and paragraphs in real time with reading times.',
        category: 'text',
        url: 'tools/word-counter/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 12h.01M12 12h.01M15 12h.01M12 7v5M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false,
        featured: false,
        keywords: ['word', 'counter', 'character', 'statistics', 'read-time']
    },
    {
        id: 'json-formatter',
        name: 'JSON Formatter & Validator',
        desc: 'Pretty-print JSON objects, validate syntax errors, and minify key spaces.',
        category: 'developer',
        url: 'tools/json-formatter/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
        popular: true,
        featured: true,
        keywords: ['json', 'format', 'minify', 'pretty', 'validate', 'developer']
    },
    {
        id: 'base64-codec',
        name: 'Base64 Encoder/Decoder',
        desc: 'Securely encode and decode strings and text data to and from Base64 format.',
        category: 'developer',
        url: 'tools/base64-codec/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
        popular: false,
        featured: false,
        keywords: ['base64', 'encode', 'decode', 'developer', 'string']
    },
    {
        id: 'meta-tag-generator',
        name: 'Meta Tag Generator',
        desc: 'Create highly optimized SEO title and meta descriptions for search rankings.',
        category: 'seo',
        url: 'tools/meta-tag-generator/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
        popular: false,
        featured: true,
        keywords: ['seo', 'meta', 'tags', 'generator', 'keywords', 'ranking']
    },
    {
        id: 'scientific-calculator',
        name: 'Scientific Calculator',
        desc: 'Advanced operations, logarithms, trigonometric tasks directly in your browser.',
        category: 'calculator',
        url: 'tools/scientific-calculator/index.html',
        icon: `<svg class="icon text-gradient" viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 12h.01M12 12h.01M15 12h.01M12 7v5M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false,
        featured: false,
        keywords: ['calculator', 'math', 'scientific', 'trig']
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initCategoryTabs();
    initFaqAccordions();
});

/**
 * 1. SEARCH SYSTEM WITH FILTERING DROPDOWN
 */
function initSearch() {
    const searchInput = document.getElementById('tool-search');
    const searchDropdown = document.getElementById('search-results');
    
    if (!searchInput || !searchDropdown) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchDropdown.innerHTML = '';
            searchDropdown.classList.remove('active');
            return;
        }

        // Search algorithm
        const matches = tools.filter(tool => {
            return tool.name.toLowerCase().includes(query) || 
                   tool.desc.toLowerCase().includes(query) ||
                   tool.keywords.some(kw => kw.includes(query));
        });

        renderSearchResults(matches, searchDropdown);
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('active');
        }
    });

    // Show dropdown again on focus if query exists
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            searchDropdown.classList.add('active');
        }
    });
}

function renderSearchResults(results, container) {
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = `<div class="search-no-results">No tools found matching your search term.</div>`;
        container.classList.add('active');
        return;
    }

    results.forEach(tool => {
        const item = document.createElement('a');
        item.href = tool.url;
        item.className = 'search-result-item';
        item.innerHTML = `
            <div class="icon-wrapper" style="border-radius: var(--radius-sm)">
                ${tool.icon}
            </div>
            <div>
                <div class="search-result-title">${tool.name}</div>
                <div class="search-result-desc">${tool.desc}</div>
            </div>
        `;
        container.appendChild(item);
    });

    container.classList.add('active');
}

/**
 * 2. CATEGORY CHIP SELECTION & GRID RENDERING
 */
function initCategoryTabs() {
    const tabs = document.querySelectorAll('.category-chip');
    const exploreGrid = document.getElementById('explore-tools-grid');
    if (!exploreGrid) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active states
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const category = tab.getAttribute('data-category');
            renderCategoryTools(category, exploreGrid);
        });
    });

    // Initial render
    renderCategoryTools('all', exploreGrid);
}

function renderCategoryTools(category, container) {
    container.innerHTML = '';
    
    // Filter list
    const filteredTools = category === 'all' 
        ? tools 
        : tools.filter(t => t.category === category);
        
    if (filteredTools.length === 0) {
        container.innerHTML = `<div class="text-muted p-4 text-center" style="grid-column: 1/-1">No tools available in this category yet. Stay tuned!</div>`;
        return;
    }

    filteredTools.forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.url;
        card.className = 'card card-interactive anim-scale-up';
        card.innerHTML = `
            <div class="card-header" style="margin-bottom: var(--spacing-1)">
                <div class="icon-wrapper" style="background-color: var(--primary-glow); border-radius: var(--radius-md)">
                    ${tool.icon}
                </div>
                ${tool.popular ? '<span class="badge badge-success">Popular</span>' : ''}
            </div>
            <h4 class="title-4 mb-1" style="font-weight: var(--weight-bold);">${tool.name}</h4>
            <p class="text-muted text-sm" style="line-height: var(--lh-snug);">${tool.desc}</p>
        `;
        container.appendChild(card);
    });
}

/**
 * 3. FAQ ACCORDIONS (EXPANDABLE PANELS)
 */
function initFaqAccordions() {
    const accordions = document.querySelectorAll('.faq-accordion');
    
    accordions.forEach(acc => {
        const trigger = acc.querySelector('.faq-trigger');
        const content = acc.querySelector('.faq-content');
        
        trigger.addEventListener('click', () => {
            const isActive = acc.classList.contains('active');
            
            // Close other items
            accordions.forEach(other => {
                if (other !== acc) {
                    other.classList.remove('active');
                    other.querySelector('.faq-content').style.maxHeight = null;
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
