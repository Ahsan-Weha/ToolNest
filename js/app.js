/**
 * ToolNest — Central Application Module
 * Namespace: TN
 *
 * Includes: theme, toast, favorites, recent, nav, backToTop,
 *           scroll, loader, modal, glowCards, search, faq, categories, clipboard, categoryPage
 */

/* ==========================================================================
   EXPANDED TOOLS DATABASE (48 tools total, 6 per category)
   ========================================================================== */
const TN_TOOLS = [
    // === 1. PDF TOOLS ===
    {
        id: 'pdf-compressor',
        name: 'PDF Compressor',
        desc: 'Reduce PDF file sizes dramatically while keeping document layout and quality intact.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/pdf-compressor/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        popular: true, featured: true, keywords: ['pdf', 'compress', 'shrink', 'size']
    },
    {
        id: 'pdf-to-jpg',
        name: 'PDF to JPG',
        desc: 'Extract all pages from a PDF document and convert them into high-quality JPEG images.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/pdf-to-jpg/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'jpg', 'convert', 'extract', 'jpeg']
    },
    {
        id: 'jpg-to-pdf',
        name: 'JPG to PDF',
        desc: 'Convert JPG, PNG, and WebP images into a single clean PDF document offline.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/jpg-to-pdf/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'jpg', 'convert', 'png', 'merge']
    },
    {
        id: 'merge-pdf',
        name: 'Merge PDF Documents',
        desc: 'Combine multiple PDF files into one single document in any page order.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/merge-pdf/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v12m0-12l-4 4m4-4l4 4m0 6v7m0-7l-4 4m4-4l4 4"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'merge', 'combine', 'join']
    },
    {
        id: 'split-pdf',
        name: 'Split PDF Pages',
        desc: 'Extract specific page ranges or divide a PDF into separate single documents.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/split-pdf/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 2v20M16 2v20"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'split', 'extract', 'pages']
    },
    {
        id: 'rotate-pdf',
        name: 'Rotate PDF',
        desc: 'Rotate individual pages or entire PDF files and save them aligned properly.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/rotate-pdf/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 3v5h-5"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'rotate', 'orientation', 'align']
    },
    {
        id: 'unlock-pdf',
        name: 'Unlock PDF',
        desc: 'Remove password protection from PDF files instantly in your browser without uploading anywhere.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/unlock-pdf/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'unlock', 'password', 'decrypt', 'remove protection']
    },
    {
        id: 'protect-pdf',
        name: 'Protect PDF',
        desc: 'Add password protection to your PDF files to prevent unauthorized access or editing.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/protect-pdf/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'protect', 'password', 'encrypt', 'secure']
    },
    {
        id: 'add-watermark',
        name: 'Add Watermark to PDF',
        desc: 'Overlay a custom text or image watermark on all pages of a PDF document.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/add-watermark/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'watermark', 'stamp', 'overlay', 'brand']
    },
    {
        id: 'remove-pages',
        name: 'Remove PDF Pages',
        desc: 'Delete specific pages from a PDF document and download the cleaned version instantly.',
        category: 'pdf', categoryLabel: 'PDF Tools',
        url: 'tools/remove-pages/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        popular: false, featured: false, keywords: ['pdf', 'remove pages', 'delete pages', 'extract', 'trim']
    },

    // === 2. IMAGE TOOLS ===
    {
        id: 'image-compressor',
        name: 'Compress Image',
        desc: 'Compress JPG, PNG, and WebP images by adjusting quality levels to shrink file weights.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/image-compressor/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"/></svg>`,
        popular: false, featured: false, keywords: ['image', 'compress', 'optimize', 'quality', 'kb', 'reduce']
    },
    {
        id: 'image-resizer',
        name: 'Resize Image',
        desc: 'Change width and height dimensions of images, maintaining aspect ratio or scaling freely.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/image-resizer/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5"/></svg>`,
        popular: true, featured: false, keywords: ['image', 'resize', 'aspect-ratio', 'scale', 'dimensions']
    },
    {
        id: 'image-cropper',
        name: 'Crop Image',
        desc: 'Crop images dynamically using standard presets or custom boundary boxes.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/image-cropper/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v13h13M16 11v8H8"/></svg>`,
        popular: false, featured: false, keywords: ['image', 'crop', 'trim', 'dimensions', 'cut']
    },
    {
        id: 'rotate-image',
        name: 'Rotate Image',
        desc: 'Rotate images by 90 or 180 degrees, or flip them horizontally or vertically instantly.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/rotate-image/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 3v5h-5"/></svg>`,
        popular: false, featured: false, keywords: ['image', 'rotate', 'orientation', 'align', 'flip', 'mirror']
    },
    {
        id: 'png-to-jpg',
        name: 'PNG to JPG',
        desc: 'Convert transparent or solid PNG images to high-quality JPG format instantly.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/png-to-jpg/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
        popular: false, featured: false, keywords: ['png', 'jpg', 'jpeg', 'convert', 'format']
    },
    {
        id: 'jpg-to-png',
        name: 'JPG to PNG',
        desc: 'Convert JPG photos into transparent-ready PNG files losslessly.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/jpg-to-png/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
        popular: false, featured: false, keywords: ['jpg', 'png', 'jpeg', 'convert', 'format']
    },
    {
        id: 'webp-converter',
        name: 'WebP Converter',
        desc: 'Convert images (PNG, JPG) to WebP format, or WebP assets back to PNG or JPG.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/webp-converter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
        popular: false, featured: true, keywords: ['webp', 'convert', 'image', 'png', 'jpg', 'jpeg']
    },
    {
        id: 'png-to-webp',
        name: 'PNG to WebP',
        desc: 'Convert PNG images to WebP format with adjustable quality for smaller, web-optimized files.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/png-to-webp/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>`,
        popular: false, featured: false, keywords: ['png', 'webp', 'convert', 'compress', 'image', 'format']
    },
    {
        id: 'webp-to-png',
        name: 'WebP to PNG',
        desc: 'Convert WebP images back to standard PNG format for maximum compatibility.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/webp-to-png/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>`,
        popular: false, featured: false, keywords: ['webp', 'png', 'convert', 'image', 'format']
    },
    {
        id: 'svg-to-png',
        name: 'SVG to PNG',
        desc: 'Render SVG vector files into crisp PNG raster images at any resolution.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/svg-to-png/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z"/></svg>`,
        popular: false, featured: false, keywords: ['svg', 'png', 'vector', 'convert', 'render', 'image']
    },
    {
        id: 'svg-converter',
        name: 'SVG Converter',
        desc: 'Render vector SVG files or raw SVG code into PNG or JPG images with custom scale factors.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/svg-converter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM4 21a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z"/></svg>`,
        popular: false, featured: false, keywords: ['svg', 'png', 'vector', 'render', 'convert', 'jpg']
    },
    {
        id: 'image-upscaler',
        name: 'Image Upscaler',
        desc: 'Enlarge images up to 4x using high-quality local resizing filters or connected AI.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/image-upscaler/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M12 4v16"/></svg>`,
        popular: false, featured: false, keywords: ['upscale', 'enlarge', 'resize', 'sharpen', 'ai']
    },
    {
        id: 'background-remover',
        name: 'Background Remover',
        desc: 'Strip background colors using precise chroma-key ranges or connected AI models.',
        category: 'image', categoryLabel: 'Image Tools',
        url: 'tools/background-remover/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
        popular: false, featured: false, keywords: ['remove background', 'bg', 'transparent', 'chroma-key', 'ai']
    },

    // === 3. TEXT TOOLS ===
    {
        id: 'markdown-editor',
        name: 'Markdown Editor',
        desc: 'Live preview Markdown editor to format and write content quickly. Copy as HTML.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/markdown-editor/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
        popular: true, featured: true, keywords: ['markdown', 'editor', 'write', 'html', 'format']
    },
    {
        id: 'word-counter',
        name: 'Word Counter',
        desc: 'Calculate characters, words, sentences, and paragraphs in real time with reading times.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/word-counter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        popular: false, featured: false, keywords: ['word', 'counter', 'character', 'statistics', 'read-time']
    },
    {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum Generator',
        desc: 'Generate custom placeholder text paragraphs, list items, or sentences offline.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/lorem-ipsum/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>`,
        popular: false, featured: false, keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text']
    },
    {
        id: 'case-converter',
        name: 'Case Converter',
        desc: 'Change text case configurations instantly (uppercase, lowercase, title case, sentence case).',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/case-converter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 5v14M17 5h3m-1.5 0v14M15 19h4"/></svg>`,
        popular: false, featured: false, keywords: ['case', 'converter', 'uppercase', 'lowercase', 'title']
    },
    {
        id: 'text-diff',
        name: 'Text Diff Finder',
        desc: 'Compare two text strings side-by-side to highlight added, removed, or changed values.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/text-diff/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
        popular: false, featured: false, keywords: ['diff', 'compare', 'text', 'difference', 'match']
    },
    {
        id: 'regex-tester',
        name: 'Regex Tester',
        desc: 'Test regular expressions against sample strings with matched blocks highlighting.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/regex-tester/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
        popular: false, featured: false, keywords: ['regex', 'test', 'tester', 'expression', 'match']
    },
    {
        id: 'character-counter',
        name: 'Character Counter',
        desc: 'Count characters, words, and lines instantly with customized limits and progress meters.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/character-counter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10M7 16h10M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>`,
        popular: false, featured: false, keywords: ['character', 'counter', 'characters', 'count', 'limit']
    },
    {
        id: 'remove-duplicate-lines',
        name: 'Remove Duplicate Lines',
        desc: 'De-duplicate list items and clean up repetitive text lines using customizable matching options.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/remove-duplicate-lines/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
        popular: false, featured: false, keywords: ['duplicate', 'remove', 'dedup', 'lines', 'cleanup']
    },
    {
        id: 'remove-extra-spaces',
        name: 'Remove Extra Spaces',
        desc: 'Strip extra spacing, trailing whitespace, empty lines, and tabs from your copy.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/remove-extra-spaces/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>`,
        popular: false, featured: false, keywords: ['spaces', 'trim', 'whitespace', 'cleanup', 'tabs']
    },
    {
        id: 'text-sorter',
        name: 'Text Sorter',
        desc: 'Sort list rows alphabetically, numerically, by length, or shuffle them randomly.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/text-sorter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/></svg>`,
        popular: false, featured: false, keywords: ['sort', 'alphabetical', 'shuffle', 'reverse', 'numeric']
    },
    {
        id: 'text-reverser',
        name: 'Text Reverser',
        desc: 'Reverse text lines, words, individual letters, or flip text upside down.',
        category: 'text', categoryLabel: 'Text Tools',
        url: 'tools/text-reverser/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
        popular: false, featured: false, keywords: ['reverse', 'flip', 'letters', 'words', 'upside-down']
    },

    // === 4. DEVELOPER TOOLS ===
    {
        id: 'json-formatter',
        name: 'JSON Formatter & Validator',
        desc: 'Pretty-print JSON objects, validate syntax errors, and minify key spaces.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/json-formatter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
        popular: true, featured: true, keywords: ['json', 'format', 'minify', 'pretty', 'validate', 'developer']
    },
    {
        id: 'base64-codec',
        name: 'Base64 Encoder/Decoder',
        desc: 'Securely encode and decode strings and text data to and from Base64 format.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/base64-codec/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
        popular: false, featured: false, keywords: ['base64', 'encode', 'decode', 'developer', 'string']
    },
    {
        id: 'html-codec',
        name: 'HTML Encoder/Decoder',
        desc: 'Escape HTML entities to display code safely or unescape encoded entities.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/html-codec/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16M17 16l4-4-4-4M7 8L3 12l4 4"/></svg>`,
        popular: false, featured: false, keywords: ['html', 'entities', 'encode', 'decode', 'escape']
    },
    {
        id: 'xml-formatter',
        name: 'XML Formatter',
        desc: 'Beautify XML markup structures with clean indents or compress tag spaces.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/xml-formatter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`,
        popular: false, featured: false, keywords: ['xml', 'format', 'pretty', 'minify', 'beautify']
    },
    {
        id: 'yaml-json',
        name: 'YAML to JSON Converter',
        desc: 'Convert YAML structures into structured JSON output formats or vice versa.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/yaml-json/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 12l-3-3m3 3l3-3m3 3V4m0 12l-3-3m3 3l3-3"/></svg>`,
        popular: false, featured: false, keywords: ['yaml', 'json', 'convert', 'yaml2json']
    },
    {
        id: 'uuid-generator',
        name: 'UUID Generator',
        desc: 'Generate RFC 4122 compliant random UUID (Universally Unique Identifier) strings.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/uuid-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586A1 1 0 0113 4v5H9V5H7v14h10v-9h-4v9"/></svg>`,
        popular: false, featured: false, keywords: ['uuid', 'guid', 'generator', 'unique', 'id']
    },
    {
        id: 'html-formatter',
        name: 'HTML Formatter',
        desc: 'Beautify nested HTML code structures with custom tab indentation and tag alignment.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/html-formatter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16M17 16l4-4-4-4M7 8L3 12l4 4"/></svg>`,
        popular: false, featured: false, keywords: ['html', 'format', 'beautify', 'pretty-print']
    },
    {
        id: 'css-minifier',
        name: 'CSS Minifier',
        desc: 'Compress and optimize CSS files by stripping extra whitespace, line breaks, and comments.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/css-minifier/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16M12 6v12"/></svg>`,
        popular: false, featured: false, keywords: ['css', 'minify', 'compress', 'shrink']
    },
    {
        id: 'js-beautifier',
        name: 'JS Beautifier',
        desc: 'Format, align, and clean up messy Javascript scripts with customizable indentation.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/js-beautifier/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['js', 'javascript', 'beautify', 'format', 'pretty']
    },
    {
        id: 'url-codec',
        name: 'URL Encoder/Decoder',
        desc: 'Percent-encode or decode query strings, path variables, and full URLs safely.',
        category: 'developer', categoryLabel: 'Developer Tools',
        url: 'tools/url-codec/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
        popular: false, featured: false, keywords: ['url', 'encode', 'decode', 'percent-encode', 'escape']
    },

    // === 5. CALCULATORS ===
    {
        id: 'scientific-calculator',
        name: 'Scientific Calculator',
        desc: 'Advanced operations, logarithms, trigonometric tasks directly in your browser.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/scientific-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 12h.01M12 12h.01M15 12h.01M12 7v5M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['calculator', 'math', 'scientific', 'trig']
    },
    {
        id: 'loan-calculator',
        name: 'Loan & Mortgage Calculator',
        desc: 'Calculate monthly loan payments, interest charges, and amortization grids.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/loan-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 11v-1m0-1V9m0 10a9 9 0 110-18 9 9 0 010 18z"/></svg>`,
        popular: true, featured: false, keywords: ['loan', 'mortgage', 'calculator', 'interest', 'payment']
    },
    {
        id: 'percentage-calculator',
        name: 'Percentage Calculator',
        desc: 'Find percentage values, increase/decrease amounts, or calculations of ratios.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/percentage-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9h.01M15 15h.01M19 5L5 19"/></svg>`,
        popular: false, featured: false, keywords: ['percentage', 'ratio', 'math', 'increase']
    },
    {
        id: 'age-calculator',
        name: 'Age Calculator',
        desc: 'Calculate exact age intervals in years, months, weeks, and days relative to dates.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/age-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m9-.3C22 17.5 17.5 22 12 22S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z"/></svg>`,
        popular: false, featured: false, keywords: ['age', 'date', 'calculator', 'birthday', 'diff']
    },
    {
        id: 'gpa-calculator',
        name: 'GPA Calculator',
        desc: 'Input course units and semester grades to evaluate standard cumulative GPAs.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/gpa-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6M6 10.5V17a3 3 0 003 3h6a3 3 0 003-3v-6.5"/></svg>`,
        popular: false, featured: false, keywords: ['gpa', 'grades', 'college', 'semester', 'grade']
    },
    {
        id: 'binary-calculator',
        name: 'Binary Calculator',
        desc: 'Perform calculations (addition, subtraction, XOR) directly on binary numbers.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/binary-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-3-3v6M9 17h6m-3-3v6"/></svg>`,
        popular: false, featured: false, keywords: ['binary', 'calculator', 'math', 'bit', 'bytes']
    },
    {
        id: 'bmi-calculator',
        name: 'BMI Calculator',
        desc: 'Calculate Body Mass Index (BMI) instantly using metric or imperial measurements.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/bmi-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
        popular: false, featured: false, keywords: ['bmi', 'body mass index', 'health', 'fitness', 'weight']
    },
    {
        id: 'emi-calculator',
        name: 'EMI Calculator',
        desc: 'Calculate Equated Monthly Installments (EMI) and breakdown total interest payable.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/emi-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 12h.01M12 12h.01M15 12h.01M12 7v5M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['emi', 'repayment', 'calculator', 'loans', 'installments']
    },
    {
        id: 'currency-converter',
        name: 'Currency Converter',
        desc: 'Convert standard global currencies using real-time open exchange rate APIs.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/currency-converter/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 11v-1m0-1V9m0 10a9 9 0 110-18 9 9 0 010 18z"/></svg>`,
        popular: false, featured: false, keywords: ['currency', 'exchange', 'rates', 'converter', 'usd', 'eur']
    },
    {
        id: 'time-calculator',
        name: 'Time Calculator',
        desc: 'Add, subtract, or find precise differences between dates, hours, and minutes.',
        category: 'calculator', categoryLabel: 'Calculators',
        url: 'tools/time-calculator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m9-.3C22 17.5 17.5 22 12 22S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z"/></svg>`,
        popular: false, featured: false, keywords: ['time', 'date', 'difference', 'add time', 'subtract time']
    },

    // === 6. SECURITY TOOLS ===
    {
        id: 'password-generator',
        name: 'Password Generator',
        desc: 'Create secure random passwords offline using alphanumeric and special characters.',
        category: 'security', categoryLabel: 'Security Tools',
        url: 'tools/password-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
        popular: true, featured: false, keywords: ['password', 'generate', 'security', 'secure']
    },
    {
        id: 'sha256-hash',
        name: 'SHA256 Hash Generator',
        desc: 'Generate secure cryptographically secure SHA-256 strings from text parameters.',
        category: 'security', categoryLabel: 'Security Tools',
        url: 'tools/sha256-hash/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['sha256', 'hash', 'encrypt', 'security', 'string']
    },
    {
        id: 'md5-hash',
        name: 'MD5 Hash Generator',
        desc: 'Compile standard MD5 cryptographic hash keys from raw text inputs.',
        category: 'security', categoryLabel: 'Security Tools',
        url: 'tools/md5-hash/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586"/></svg>`,
        popular: false, featured: false, keywords: ['md5', 'hash', 'encrypt', 'crypto']
    },
    {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        desc: 'Decode JSON Web Token (JWT) payloads to reveal header information and parameters.',
        category: 'security', categoryLabel: 'Security Tools',
        url: 'tools/jwt-decoder/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['jwt', 'decoder', 'token', 'auth', 'security']
    },
    {
        id: 'password-strength',
        name: 'Password Strength Meter',
        desc: 'Input strings to evaluate complexity markers and structural entropy scores.',
        category: 'security', categoryLabel: 'Security Tools',
        url: 'tools/password-strength/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
        popular: false, featured: false, keywords: ['password', 'strength', 'entropy', 'security', 'validate']
    },
    {
        id: 'htpasswd-generator',
        name: 'Htpasswd Generator',
        desc: 'Build htpasswd formatted login details using MD5, SHA1, or Bcrypt hashes.',
        category: 'security', categoryLabel: 'Security Tools',
        url: 'tools/htpasswd-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        popular: false, featured: false, keywords: ['htpasswd', 'apache', 'hash', 'bcrypt', 'generate']
    },

    // === 7. COLOR TOOLS ===
    {
        id: 'color-picker',
        name: 'Color Picker & Palette',
        desc: 'Interactive selector to extract HEX/RGBA values and build harmonious palettes.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/color-picker/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`,
        popular: false, featured: false, keywords: ['color', 'picker', 'palette', 'hex', 'rgb']
    },
    {
        id: 'hex-rgba',
        name: 'HEX to RGBA Converter',
        desc: 'Convert HEX color codes into RGBA arrays with customizable transparency thresholds.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/hex-rgba/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
        popular: false, featured: false, keywords: ['hex', 'rgba', 'color', 'convert']
    },
    {
        id: 'contrast-checker',
        name: 'Contrast Checker',
        desc: 'Evaluate background and text color contrasts based on WCAG accessibility limits.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/contrast-checker/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18m0-18a9 9 0 00-9 9m9-9a9 9 0 019 9m-9 9a9 9 0 01-9-9m9 9a9 9 0 009-9"/></svg>`,
        popular: true, featured: false, keywords: ['contrast', 'checker', 'wcag', 'accessibility', 'colors']
    },
    {
        id: 'gradient-generator',
        name: 'CSS Gradient Generator',
        desc: 'Design beautiful linear and radial CSS gradient backgrounds and copy code snippets.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/gradient-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['gradient', 'css', 'generator', 'linear', 'radial']
    },
    {
        id: 'color-extractor',
        name: 'Image Color Extractor',
        desc: 'Upload images to extract dominant colors and compile matching hex palettes.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/color-extractor/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        popular: false, featured: false, keywords: ['color', 'extractor', 'image', 'palette', 'palette-generator']
    },
    {
        id: 'hsl-hex',
        name: 'HSL to HEX Converter',
        desc: 'Convert HSL values into HEX color code strings instantly.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/hsl-hex/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
        popular: false, featured: false, keywords: ['hsl', 'hex', 'color', 'convert']
    },
    {
        id: 'rgb-hex',
        name: 'RGB to HEX Converter',
        desc: 'Convert RGB or RGBA color coordinates into clean 6-digit or 8-digit HEX code values.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/rgb-hex/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
        popular: false, featured: false, keywords: ['rgb', 'rgba', 'hex', 'color', 'convert']
    },
    {
        id: 'color-palette-generator',
        name: 'Color Palette Generator',
        desc: 'Generate gorgeous color schemes based on color harmony rules or random seeds. Lock and export variables.',
        category: 'color', categoryLabel: 'Color Tools',
        url: 'tools/color-palette-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM4 21a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z"/></svg>`,
        popular: true, featured: true, keywords: ['palette', 'color', 'generator', 'harmonies', 'theme', 'design']
    },

    // === 8. SEO TOOLS ===
    {
        id: 'meta-tag-generator',
        name: 'Meta Tag Generator',
        desc: 'Create highly optimized SEO title and meta descriptions for search rankings.',
        category: 'seo', categoryLabel: 'SEO Tools',
        url: 'tools/meta-tag-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
        popular: false, featured: true, keywords: ['seo', 'meta', 'tags', 'generator', 'keywords', 'ranking']
    },
    {
        id: 'redirect-checker',
        name: 'Redirect Link Checker',
        desc: 'Inspect redirection pathways (301, 302, JS redirect) to verify landing endpoints.',
        category: 'seo', categoryLabel: 'SEO Tools',
        url: 'tools/redirect-checker/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
        popular: false, featured: false, keywords: ['redirect', 'seo', 'link', 'status', '301']
    },
    {
        id: 'robots-generator',
        name: 'Robots.txt Generator',
        desc: 'Construct clean compliant robots.txt crawler instruction files.',
        category: 'seo', categoryLabel: 'SEO Tools',
        url: 'tools/robots-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
        popular: false, featured: false, keywords: ['robots', 'seo', 'crawler', 'crawler-rules']
    },
    {
        id: 'sitemap-generator',
        name: 'XML Sitemap Generator',
        desc: 'Compile sitemap index structures locally to inform search crawlers of page arrays.',
        category: 'seo', categoryLabel: 'SEO Tools',
        url: 'tools/sitemap-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        popular: false, featured: false, keywords: ['sitemap', 'xml', 'seo', 'generator', 'pages']
    },
    {
        id: 'url-slug',
        name: 'URL Slug Generator',
        desc: 'Clean dynamic title strings into lowercase search-engine-friendly url paths.',
        category: 'seo', categoryLabel: 'SEO Tools',
        url: 'tools/url-slug/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
        popular: false, featured: false, keywords: ['slug', 'url', 'seo', 'title', 'slugify']
    },
    {
        id: 'keyword-density',
        name: 'Keyword Density Checker',
        desc: 'Parse body content strings to report repeating vocabulary percentages.',
        category: 'seo', categoryLabel: 'SEO Tools',
        url: 'tools/keyword-density/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
        popular: false, featured: false, keywords: ['seo', 'keywords', 'density', 'density-checker']
    },
    {
        id: 'og-generator',
        name: 'Open Graph Generator',
        desc: 'Build complete Open Graph and Twitter Card meta tags for rich social media link previews.',
        category: 'seo', categoryLabel: 'SEO Tools',
        url: 'tools/og-generator/index.html',
        icon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>`,
        popular: true, featured: true, keywords: ['open-graph', 'og', 'twitter', 'social', 'meta', 'preview', 'seo']
    }
];

/* ==========================================================================
   TN NAMESPACE DEFINITIONS
   ========================================================================== */
const TN = {
    theme: {
        _storageKey: 'toolnest-theme',
        init() {
            const stored = localStorage.getItem(this._storageKey);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = stored || (prefersDark ? 'dark' : 'dark');
            this.apply(theme);
            document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
                btn.addEventListener('click', () => this.toggle());
            });
        },
        apply(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(this._storageKey, theme);
            document.querySelectorAll('.theme-icon-sun').forEach(el => el.style.display = theme === 'dark' ? 'block' : 'none');
            document.querySelectorAll('.theme-icon-moon').forEach(el => el.style.display = theme === 'light' ? 'block' : 'none');
            document.querySelectorAll('.theme-text-label').forEach(el => el.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode');
        },
        toggle() {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            this.apply(current === 'dark' ? 'light' : 'dark');
        },
        current() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
    },

    toast: {
        _container: null,
        _icons: {
            success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            error:   `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            info:    `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        },
        _ensureContainer() {
            if (!this._container) {
                this._container = document.getElementById('tn-toast-container');
                if (!this._container) {
                    this._container = document.createElement('div');
                    this._container.id = 'tn-toast-container';
                    document.body.appendChild(this._container);
                }
            }
            return this._container;
        },
        show(message, type = 'success', duration = 3000) {
            const container = this._ensureContainer();
            const id = `toast-${Date.now()}`;
            const toast = document.createElement('div');
            toast.className = `tn-toast toast-${type}`;
            toast.id = id;
            toast.setAttribute('role', 'alert');
            toast.innerHTML = `
                ${this._icons[type] || this._icons.info}
                <span>${message}</span>
                <span class="toast-dismiss" aria-label="Dismiss">&times;</span>
            `;
            toast.querySelector('.toast-dismiss').addEventListener('click', () => this.dismiss(toast));
            toast.addEventListener('click', () => this.dismiss(toast));
            container.appendChild(toast);
            if (duration > 0) {
                setTimeout(() => this.dismiss(toast), duration);
            }
            return toast;
        },
        dismiss(toastEl) {
            if (!toastEl || toastEl.classList.contains('is-leaving')) return;
            toastEl.classList.add('is-leaving');
            setTimeout(() => toastEl.remove(), 280);
        },
        success(msg, dur) { return this.show(msg, 'success', dur); },
        error(msg, dur)   { return this.show(msg, 'error', dur); },
        warning(msg, dur) { return this.show(msg, 'warning', dur); },
        info(msg, dur)    { return this.show(msg, 'info', dur); }
    },

    favorites: {
        _key: 'toolnest-favorites',
        getAll() {
            try { return JSON.parse(localStorage.getItem(this._key)) || []; }
            catch { return []; }
        },
        isFavorited(toolId) { return this.getAll().includes(toolId); },
        toggle(toolId) {
            const favs = this.getAll();
            const idx = favs.indexOf(toolId);
            if (idx === -1) {
                favs.push(toolId);
                TN.toast.show('Added to favorites', 'success', 2000);
            } else {
                favs.splice(idx, 1);
                TN.toast.show('Removed from favorites', 'info', 2000);
            }
            localStorage.setItem(this._key, JSON.stringify(favs));
            this._updateButtons(toolId);
            this.renderPanel();
        },
        _updateButtons(toolId) {
            document.querySelectorAll(`[data-fav-id="${toolId}"]`).forEach(btn => {
                btn.classList.toggle('is-favorited', this.isFavorited(toolId));
            });
        },
        init() {
            document.querySelectorAll('[data-fav-id]').forEach(btn => {
                const id = btn.getAttribute('data-fav-id');
                if (this.isFavorited(id)) btn.classList.add('is-favorited');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggle(id);
                });
            });
            this.renderPanel();
        },
        renderPanel() {
            const panel = document.getElementById('favorites-panel');
            if (!panel) return;
            const favIds = this.getAll();
            const favTools = TN_TOOLS.filter(t => favIds.includes(t.id));
            const scroll = panel.querySelector('.panel-scroll');
            const empty = panel.querySelector('.panel-empty');
            if (!scroll) return;
            scroll.innerHTML = '';
            if (favTools.length === 0) {
                if (empty) empty.style.display = 'block';
                scroll.style.display = 'none';
                return;
            }
            if (empty) empty.style.display = 'none';
            scroll.style.display = 'flex';
            favTools.forEach(tool => {
                const el = document.createElement('a');
                el.href = tool.url;
                el.className = 'panel-tool-card';
                el.innerHTML = `
                    <div class="icon-wrapper" style="background:var(--primary-glow);border-radius:var(--radius-sm);width:2rem;height:2rem">
                        ${tool.icon}
                    </div>
                    <span class="panel-tool-name">${tool.name}</span>
                    <span class="panel-tool-cat">${tool.categoryLabel}</span>
                `;
                scroll.appendChild(el);
            });
        }
    },

    recent: {
        _key: 'toolnest-recent',
        _max: 6,
        getAll() {
            try { return JSON.parse(localStorage.getItem(this._key)) || []; }
            catch { return []; }
        },
        track(toolId) {
            let recent = this.getAll();
            recent = recent.filter(id => id !== toolId);
            recent.unshift(toolId);
            recent = recent.slice(0, this._max);
            localStorage.setItem(this._key, JSON.stringify(recent));
        },
        renderPanel() {
            const panel = document.getElementById('recently-used-panel');
            if (!panel) return;
            const recentIds = this.getAll();
            const recentTools = recentIds
                .map(id => TN_TOOLS.find(t => t.id === id))
                .filter(Boolean);
            const scroll = panel.querySelector('.panel-scroll');
            const empty = panel.querySelector('.panel-empty');
            if (!scroll) return;
            scroll.innerHTML = '';
            if (recentTools.length === 0) {
                if (empty) empty.style.display = 'block';
                scroll.style.display = 'none';
                return;
            }
            if (empty) empty.style.display = 'none';
            scroll.style.display = 'flex';
            recentTools.forEach(tool => {
                const el = document.createElement('a');
                el.href = tool.url;
                el.className = 'panel-tool-card';
                el.innerHTML = `
                    <div class="icon-wrapper" style="background:var(--primary-glow);border-radius:var(--radius-sm);width:2rem;height:2rem">
                        ${tool.icon}
                    </div>
                    <span class="panel-tool-name">${tool.name}</span>
                    <span class="panel-tool-cat">${tool.categoryLabel}</span>
                `;
                scroll.appendChild(el);
            });
        },
        init() {
            const toolId = document.body.getAttribute('data-tool-id');
            if (toolId) this.track(toolId);
            this.renderPanel();
        }
    },

    nav: {
        _overlay: null,
        _drawer: null,
        _hamburger: null,
        _isOpen: false,
        init() {
            this._overlay   = document.getElementById('mobile-menu-overlay');
            this._drawer    = document.getElementById('mobile-drawer');
            this._hamburger = document.getElementById('hamburger-btn');
            if (!this._overlay || !this._drawer || !this._hamburger) return;
            this._hamburger.addEventListener('click', () => this.toggle());
            this._overlay.addEventListener('click', () => this.close());
            document.getElementById('mobile-drawer-close')?.addEventListener('click', () => this.close());
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && this._isOpen) this.close();
            });
            const header = document.querySelector('.main-nav');
            if (header) {
                window.addEventListener('scroll', () => {
                    header.style.boxShadow = window.scrollY > 10 ? 'var(--shadow-md)' : 'none';
                }, { passive: true });
            }
        },
        open() {
            this._isOpen = true;
            this._drawer.classList.add('is-open');
            this._overlay.style.display = 'block';
            requestAnimationFrame(() => this._overlay.classList.add('visible'));
            this._hamburger.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        },
        close() {
            this._isOpen = false;
            this._drawer.classList.remove('is-open');
            this._overlay.classList.remove('visible');
            this._hamburger.classList.remove('is-open');
            document.body.style.overflow = '';
            setTimeout(() => { this._overlay.style.display = 'none'; }, 300);
        },
        toggle() { this._isOpen ? this.close() : this.open(); }
    },

    backToTop: {
        init() {
            const btn = document.getElementById('back-to-top');
            if (!btn) return;
            window.addEventListener('scroll', () => {
                btn.classList.toggle('visible', window.scrollY > 300);
            }, { passive: true });
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    },

    scroll: {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(link => {
                link.addEventListener('click', (e) => {
                    const target = document.querySelector(link.getAttribute('href'));
                    if (!target) return;
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (TN.nav._isOpen) TN.nav.close();
                });
            });
        }
    },

    loader: {
        show(containerEl) {
            let overlay = containerEl.querySelector('.tool-loading-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'tool-loading-overlay';
                overlay.innerHTML = `<div class="loader-ring"></div>`;
                containerEl.style.position = 'relative';
                containerEl.appendChild(overlay);
            }
            requestAnimationFrame(() => overlay.classList.add('active'));
        },
        hide(containerEl) {
            const overlay = containerEl?.querySelector('.tool-loading-overlay');
            if (overlay) overlay.classList.remove('active');
        },
        skeleton(containerEl, lines = 3) {
            containerEl.innerHTML = `
                <div class="skeleton-card">
                    <div class="flex items-center gap-1-5">
                        <div class="skeleton skeleton-circle"></div>
                        <div class="skeleton skeleton-line" style="width:40%"></div>
                    </div>
                    ${Array.from({length: lines}, () => `<div class="skeleton skeleton-line" style="width:${60 + Math.random()*35|0}%"></div>`).join('')}
                    <div class="skeleton skeleton-block"></div>
                </div>`;
        }
    },

    modal: {
        _root: null,
        _ensure() {
            this._root = document.getElementById('tn-modal-root');
            if (!this._root) {
                this._root = document.createElement('div');
                this._root.id = 'tn-modal-root';
                document.body.appendChild(this._root);
            }
            return this._root;
        },
        open({ title = '', body = '', confirmLabel = 'OK', cancelLabel = '', onConfirm = null } = {}) {
            const root = this._ensure();
            root.innerHTML = `
                <div class="modal-backdrop" id="modal-backdrop"></div>
                <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div class="modal-header">
                        <span id="modal-title" class="modal-title">${title}</span>
                        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body">${body}</div>
                    ${(confirmLabel || cancelLabel) ? `
                    <div class="modal-footer">
                        ${cancelLabel ? `<button class="btn btn-secondary" id="modal-cancel">${cancelLabel}</button>` : ''}
                        ${confirmLabel ? `<button class="btn btn-primary" id="modal-confirm">${confirmLabel}</button>` : ''}
                    </div>` : ''}
                </div>`;
            root.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            root.querySelector('#modal-close-btn')?.addEventListener('click', () => this.close());
            root.querySelector('#modal-backdrop')?.addEventListener('click', () => this.close());
            root.querySelector('#modal-cancel')?.addEventListener('click', () => this.close());
            root.querySelector('#modal-confirm')?.addEventListener('click', () => {
                if (onConfirm) onConfirm();
                this.close();
            });
            document.addEventListener('keydown', this._escHandler);
        },
        close() {
            if (!this._root) return;
            this._root.classList.remove('is-open');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', this._escHandler);
        },
        _escHandler(e) { if (e.key === 'Escape') TN.modal.close(); },
        confirm({ title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm }) {
            this.open({ title, body, confirmLabel, cancelLabel, onConfirm });
        }
    },

    glowCards: {
        init() {
            document.querySelectorAll('.card-glow').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const r = card.getBoundingClientRect();
                    card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
                    card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
                });
            });
        }
    },

    clipboard: {
        copy(text, onSuccess, onError) {
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => onSuccess && onSuccess())
                    .catch(() => this._fallback(text, onSuccess, onError));
            } else {
                this._fallback(text, onSuccess, onError);
            }
        },
        _fallback(text, onSuccess, onError) {
            const ta = document.createElement('textarea');
            ta.value = text;
            Object.assign(ta.style, { position: 'fixed', top: 0, left: 0, opacity: 0 });
            document.body.appendChild(ta);
            ta.focus(); ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok && onSuccess) onSuccess();
            else if (!ok && onError) onError();
        }
    },

    search: {
        _overlay: null, _input: null, _results: null,
        init() {
            this._overlay = document.getElementById('search-overlay');
            this._input   = document.getElementById('overlay-search-input');
            this._results = document.getElementById('overlay-search-results');
            document.querySelectorAll('[data-search-open]').forEach(btn => {
                btn.addEventListener('click', () => this.open());
            });
            document.getElementById('search-overlay-close')?.addEventListener('click', () => this.close());
            this._overlay?.addEventListener('click', e => { if (e.target === this._overlay) this.close(); });
            this._input?.addEventListener('input', () => this._filter());
            document.addEventListener('keydown', e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); this.toggle(); }
                if (e.key === 'Escape' && this._overlay?.classList.contains('is-open')) this.close();
            });
        },
        open() {
            this._overlay?.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            setTimeout(() => this._input?.focus(), 50);
            this._render(TN_TOOLS);
        },
        close() {
            this._overlay?.classList.remove('is-open');
            document.body.style.overflow = '';
            if (this._input) this._input.value = '';
            if (this._results) this._results.innerHTML = '';
        },
        toggle() { this._overlay?.classList.contains('is-open') ? this.close() : this.open(); },
        _filter() {
            const q = this._input.value.toLowerCase().trim();
            if (!q) { this._render(TN_TOOLS); return; }
            const matches = TN_TOOLS.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.desc.toLowerCase().includes(q) ||
                t.keywords.some(kw => kw.includes(q))
            );
            this._render(matches, q);
        },
        _render(tools, query = '') {
            if (!this._results) return;
            this._results.innerHTML = '';
            if (tools.length === 0) {
                this._results.innerHTML = `<div style="padding:var(--spacing-3);text-align:center;color:var(--text-muted)">No tools found for "<strong>${query}</strong>"</div>`;
                return;
            }
            tools.forEach(tool => {
                const item = document.createElement('a');
                item.href = tool.url.startsWith('tools/') ? '../' + tool.url : tool.url;
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div class="icon-wrapper" style="border-radius:var(--radius-sm)">${tool.icon}</div>
                    <div>
                        <div class="search-result-title">${tool.name}</div>
                        <div class="search-result-desc">${tool.desc}</div>
                    </div>
                    <span class="badge badge-secondary" style="margin-left:auto;flex-shrink:0">${tool.categoryLabel}</span>
                `;
                item.addEventListener('click', () => {
                    TN.recent.track(tool.id);
                    this.close();
                });
                this._results.appendChild(item);
            });
        }
    },

    faq: {
        init(scope = document) {
            scope.querySelectorAll('.faq-accordion').forEach(acc => {
                const trigger = acc.querySelector('.faq-trigger');
                const content = acc.querySelector('.faq-content');
                if (!trigger || !content) return;
                trigger.addEventListener('click', () => {
                    const isActive = acc.classList.contains('active');
                    acc.closest('.faq-list')?.querySelectorAll('.faq-accordion').forEach(other => {
                        if (other !== acc) {
                            other.classList.remove('active');
                            const c = other.querySelector('.faq-content');
                            if (c) c.style.maxHeight = null;
                            other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
                        }
                    });
                    if (isActive) {
                        acc.classList.remove('active');
                        content.style.maxHeight = null;
                        trigger.setAttribute('aria-expanded', 'false');
                    } else {
                        acc.classList.add('active');
                        content.style.maxHeight = content.scrollHeight + 'px';
                        trigger.setAttribute('aria-expanded', 'true');
                    }
                });
            });
        }
    },

    categories: {
        init() {
            const tabs = document.querySelectorAll('.category-chip');
            const grid = document.getElementById('explore-tools-grid');
            if (!grid) return;
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this._render(tab.getAttribute('data-category'), grid);
                });
            });
            this._render('all', grid);
        },
        _render(category, container) {
            container.innerHTML = '';
            const list = category === 'all' ? TN_TOOLS : TN_TOOLS.filter(t => t.category === category);
            if (list.length === 0) {
                container.innerHTML = `<div class="text-muted p-4 text-center" style="grid-column:1/-1">No tools in this category yet — stay tuned!</div>`;
                return;
            }
            list.forEach(tool => {
                const isFav = TN.favorites.isFavorited(tool.id);
                const card = document.createElement('a');
                card.href = tool.url;
                card.className = 'card card-interactive anim-scale-up';
                card.style.position = 'relative';
                card.innerHTML = `
                    <button class="favorite-btn card-fav-indicator ${isFav ? 'is-favorited' : ''}"
                        data-fav-id="${tool.id}" aria-label="Favorite ${tool.name}">
                        <svg class="fav-icon-fill" width="14" height="14" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        <svg class="fav-icon-outline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    </button>
                    <div class="card-header" style="margin-bottom:var(--spacing-2)">
                        <div class="icon-wrapper" style="background:var(--primary-glow);border-radius:var(--radius-md)">${tool.icon}</div>
                        ${tool.popular ? '<span class="badge badge-success">Popular</span>' : ''}
                    </div>
                    <h4 class="title-4 mb-15" style="font-weight:var(--weight-bold)">${tool.name}</h4>
                    <p class="text-muted text-sm" style="line-height:var(--lh-relaxed)">${tool.desc}</p>
                `;
                card.querySelector('[data-fav-id]').addEventListener('click', e => {
                    e.preventDefault(); e.stopPropagation();
                    TN.favorites.toggle(tool.id);
                    card.querySelector('[data-fav-id]').classList.toggle('is-favorited', TN.favorites.isFavorited(tool.id));
                });
                card.addEventListener('click', (e) => { if (!e.target.closest('.favorite-btn')) TN.recent.track(tool.id); });
                container.appendChild(card);
            });
            TN.glowCards.init();
        }
    },

    /* -----------------------------------------------------------------------
       15. LOCAL CATEGORY PAGE SYSTEM
    ----------------------------------------------------------------------- */
    categoryPage: {
        init() {
            const pageCat = document.body.getAttribute('data-category-page');
            const grid = document.getElementById('category-tools-grid');
            const searchInput = document.getElementById('category-tool-search');
            
            if (!pageCat || !grid) return;

            const categoryTools = TN_TOOLS.filter(t => t.category === pageCat);

            const render = (list) => {
                grid.innerHTML = '';
                if (list.length === 0) {
                    grid.innerHTML = `<div class="text-muted p-4 text-center" style="grid-column: 1/-1">No tools found matching your search query.</div>`;
                    return;
                }

                list.forEach(tool => {
                    const isFav = TN.favorites.isFavorited(tool.id);
                    const card = document.createElement('a');
                    card.href = '../' + tool.url;
                    card.className = 'card card-interactive anim-scale-up';
                    card.style.position = 'relative';
                    card.innerHTML = `
                        <button class="favorite-btn card-fav-indicator ${isFav ? 'is-favorited' : ''}"
                            data-fav-id="${tool.id}" aria-label="Favorite ${tool.name}">
                            <svg class="fav-icon-fill" width="14" height="14" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                            <svg class="fav-icon-outline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        </button>
                        <div class="card-header" style="margin-bottom:var(--spacing-2)">
                            <div class="icon-wrapper" style="background:var(--primary-glow);border-radius:var(--radius-md)">${tool.icon}</div>
                            ${tool.popular ? '<span class="badge badge-success">Popular</span>' : ''}
                        </div>
                        <h4 class="title-4 mb-15" style="font-weight:var(--weight-bold)">${tool.name}</h4>
                        <p class="text-muted text-sm" style="line-height:var(--lh-relaxed)">${tool.desc}</p>
                    `;

                    card.querySelector('[data-fav-id]').addEventListener('click', e => {
                        e.preventDefault(); e.stopPropagation();
                        TN.favorites.toggle(tool.id);
                        card.querySelector('[data-fav-id]').classList.toggle('is-favorited', TN.favorites.isFavorited(tool.id));
                    });

                    card.addEventListener('click', (e) => {
                        if (!e.target.closest('.favorite-btn')) TN.recent.track(tool.id);
                    });

                    grid.appendChild(card);
                });

                TN.glowCards.init();
            };

            render(categoryTools);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    if (!query) {
                        render(categoryTools);
                        return;
                    }
                    const filtered = categoryTools.filter(t => 
                        t.name.toLowerCase().includes(query) ||
                        t.desc.toLowerCase().includes(query) ||
                        t.keywords.some(kw => kw.includes(query))
                    );
                    render(filtered);
                });
            }
        }
    },

    init() {
        TN.theme.init();
        TN.nav.init();
        TN.backToTop.init();
        TN.scroll.init();
        TN.glowCards.init();
        TN.favorites.init();
        TN.recent.init();
        TN.search.init();
        TN.faq.init();
        TN.categories.init();
        TN.categoryPage.init();
    }
};

/* ==========================================================================
   GLOBAL HELPERS
   ========================================================================== */
function showToast(msg, type = 'success') { TN.toast.show(msg, type); }
function copyToClipboard(text, cb)        { TN.clipboard.copy(text, cb); }
function fallbackCopyToClipboard(t, cb)   { TN.clipboard._fallback(t, cb); }

document.addEventListener('DOMContentLoaded', () => TN.init());
