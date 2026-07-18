(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // ── Constants ──
        const API_URL = 'https://open.er-api.com/v6/latest/USD';
        const CACHE_KEY = 'tn_currency_rates';
        const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

        // Popular currencies list
        const CURRENCIES = [
            'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN',
            'BRL', 'KRW', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'NZD', 'ZAR', 'RUB',
            'TRY', 'AED', 'SAR', 'QAR', 'MYR', 'THB', 'IDR', 'PHP', 'PKR', 'BDT',
            'EGP', 'NGN', 'KES', 'GHS', 'ILS', 'CZK', 'PLN', 'HUF', 'RON', 'BGN',
            'HRK', 'UAH', 'VND', 'TWD', 'ARS', 'CLP', 'COP', 'PEN', 'VEF', 'UYU'
        ];

        const CURRENCY_NAMES = {
            USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
            CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
            CNY: 'Chinese Yuan', INR: 'Indian Rupee', MXN: 'Mexican Peso',
            BRL: 'Brazilian Real', KRW: 'Korean Won', SGD: 'Singapore Dollar',
            HKD: 'Hong Kong Dollar', NOK: 'Norwegian Krone', SEK: 'Swedish Krona',
            DKK: 'Danish Krone', NZD: 'New Zealand Dollar', ZAR: 'South African Rand',
            RUB: 'Russian Ruble', TRY: 'Turkish Lira', AED: 'UAE Dirham',
            SAR: 'Saudi Riyal', QAR: 'Qatari Riyal', MYR: 'Malaysian Ringgit',
            THB: 'Thai Baht', IDR: 'Indonesian Rupiah', PHP: 'Philippine Peso',
            PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka', EGP: 'Egyptian Pound',
            NGN: 'Nigerian Naira', KES: 'Kenyan Shilling', GHS: 'Ghanaian Cedi',
            ILS: 'Israeli Shekel', CZK: 'Czech Koruna', PLN: 'Polish Zloty',
            HUF: 'Hungarian Forint', RON: 'Romanian Leu', VND: 'Vietnamese Dong',
            TWD: 'Taiwan Dollar', ARS: 'Argentine Peso', CLP: 'Chilean Peso',
            COP: 'Colombian Peso', UYU: 'Uruguayan Peso'
        };

        const POPULAR_PAIRS = [
            ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'JPY'], ['USD', 'INR'],
            ['EUR', 'GBP'], ['GBP', 'USD'], ['USD', 'CNY'], ['USD', 'CAD']
        ];

        // Fallback rates (relative to USD, approximate)
        const FALLBACK_RATES = {
            USD:1, EUR:0.92, GBP:0.79, JPY:149.5, CAD:1.36, AUD:1.54, CHF:0.90,
            CNY:7.24, INR:83.5, MXN:17.1, BRL:4.97, KRW:1330, SGD:1.34, HKD:7.82,
            NOK:10.6, SEK:10.4, DKK:6.88, NZD:1.63, ZAR:18.6, RUB:90, TRY:32,
            AED:3.67, SAR:3.75, QAR:3.64, MYR:4.72, THB:35.1, IDR:15700, PHP:56.5,
            PKR:278, BDT:110, EGP:30.9, NGN:1550, KES:129, GHS:12.1, ILS:3.7,
            CZK:22.9, PLN:3.99, HUF:354, RON:4.59, VND:24400, TWD:32, ARS:870,
            CLP:925, COP:3950, UYU:38.8
        };

        // DOM Elements
        const amountInput = document.getElementById('amount-input');
        const fromSelect = document.getElementById('from-currency');
        const toSelect = document.getElementById('to-currency');
        const swapBtn = document.getElementById('swap-btn');
        const btnRefresh = document.getElementById('btn-refresh');
        const statusSpinner = document.getElementById('status-spinner');
        const statusText = document.getElementById('status-text');
        const resultLoading = document.getElementById('result-loading');
        const resultDisplay = document.getElementById('result-display');
        const resultError = document.getElementById('result-error');
        const resultAmount = document.getElementById('result-amount');
        const resultLabel = document.getElementById('result-label');
        const rateBadge1 = document.getElementById('rate-badge-1');
        const rateBadge2 = document.getElementById('rate-badge-2');
        const popularPairsContainer = document.getElementById('popular-pairs');
        const multiTableSection = document.getElementById('multi-table-section');
        const multiFromLabel = document.getElementById('multi-from-label');
        const multiTableBody = document.getElementById('multi-table-body');

        let rates = null; // rates relative to USD
        let usingFallback = false;
        let lastUpdated = null;

        // ── Populate dropdowns ──
        function populateSelects() {
            const allCodes = Object.keys(FALLBACK_RATES);
            allCodes.forEach(code => {
                const name = CURRENCY_NAMES[code] || code;
                const optionHTML = `<option value="${code}">${code} — ${name}</option>`;
                fromSelect.insertAdjacentHTML('beforeend', optionHTML);
                toSelect.insertAdjacentHTML('beforeend', optionHTML);
            });
            fromSelect.value = 'USD';
            toSelect.value = 'EUR';
        }

        // ── Popular pairs ──
        function buildPopularPairs() {
            POPULAR_PAIRS.forEach(([from, to]) => {
                const btn = document.createElement('button');
                btn.className = 'popular-pair-btn';
                btn.textContent = `${from}/${to}`;
                btn.addEventListener('click', function () {
                    fromSelect.value = from;
                    toSelect.value = to;
                    amountInput.value = '1';
                    convert();
                });
                popularPairsContainer.appendChild(btn);
            });
        }

        // ── Set API status ──
        function setStatus(state, msg) {
            statusSpinner.style.display = state === 'loading' ? 'inline-block' : 'none';
            statusText.textContent = msg;
            if (state === 'live') statusText.style.color = '#22c55e';
            else if (state === 'fallback') statusText.style.color = '#eab308';
            else if (state === 'error') statusText.style.color = 'var(--error)';
            else statusText.style.color = 'var(--text-muted)';
        }

        // ── Fetch rates from API ──
        async function fetchRates(forceRefresh = false) {
            // Check cache first
            if (!forceRefresh) {
                try {
                    const cached = sessionStorage.getItem(CACHE_KEY);
                    if (cached) {
                        const { data, timestamp } = JSON.parse(cached);
                        if (Date.now() - timestamp < CACHE_TTL) {
                            rates = data;
                            usingFallback = false;
                            lastUpdated = new Date(timestamp);
                            setStatus('live', `Live rates · Updated ${lastUpdated.toLocaleTimeString()}`);
                            convert();
                            return;
                        }
                    }
                } catch (e) { /* ignore cache errors */ }
            }

            setStatus('loading', 'Fetching live rates…');
            resultLoading.style.display = 'flex';
            resultDisplay.style.display = 'none';
            resultError.style.display = 'none';

            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                const response = await fetch(API_URL, { signal: controller.signal });
                clearTimeout(timeout);

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (!data || !data.rates) throw new Error('Invalid response format');

                rates = data.rates;
                usingFallback = false;
                lastUpdated = new Date();

                // Cache the rates
                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: rates, timestamp: Date.now() }));
                } catch (e) { /* ignore storage errors */ }

                setStatus('live', `Live rates · Updated ${lastUpdated.toLocaleTimeString()}`);
            } catch (err) {
                // Fallback to hardcoded rates
                rates = FALLBACK_RATES;
                usingFallback = true;
                const reason = err.name === 'AbortError' ? 'timeout' : 'API unavailable';
                setStatus('fallback', `⚠ Offline mode (${reason}) — using approximate rates`);
            }

            convert();
        }

        // ── Convert ──
        function convert() {
            if (!rates) return;

            const amount = parseFloat(amountInput.value);
            const from = fromSelect.value;
            const to = toSelect.value;

            resultLoading.style.display = 'none';
            resultError.style.display = 'none';

            if (isNaN(amount) || amount < 0) {
                resultError.textContent = 'Please enter a valid amount.';
                resultError.style.display = 'block';
                resultDisplay.style.display = 'none';
                return;
            }

            const rateFrom = rates[from];
            const rateTo = rates[to];

            if (!rateFrom || !rateTo) {
                resultError.textContent = 'Exchange rate not available for selected currencies.';
                resultError.style.display = 'block';
                resultDisplay.style.display = 'none';
                return;
            }

            // Convert: amount in FROM → USD → TO
            const amountInUSD = amount / rateFrom;
            const result = amountInUSD * rateTo;

            const fmtResult = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
            const rate = rateTo / rateFrom;
            const reverseRate = rateFrom / rateTo;

            resultAmount.textContent = `${fmtResult} ${to}`;
            resultLabel.textContent = `${amount.toLocaleString()} ${from} = ${fmtResult} ${to}`;
            rateBadge1.textContent = `1 ${from} = ${rate.toFixed(6)} ${to}`;
            rateBadge2.textContent = `1 ${to} = ${reverseRate.toFixed(6)} ${from}`;

            resultDisplay.style.display = 'block';

            // Multi-currency table
            updateMultiTable(amount, from);
        }

        const MULTI_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'];

        function updateMultiTable(amount, from) {
            if (!rates || !rates[from]) return;
            multiFromLabel.textContent = from;
            multiTableBody.innerHTML = '';
            const amountInUSD = amount / rates[from];

            MULTI_CURRENCIES.forEach(code => {
                if (code === from) return;
                if (!rates[code]) return;
                const convertedRate = rates[code] / rates[from];
                const convertedAmount = amountInUSD * rates[code];
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${code}</strong> <span class="text-muted" style="font-size:0.75rem;">${CURRENCY_NAMES[code] || ''}</span></td>
                    <td style="color:var(--primary)">${convertedRate.toFixed(4)}</td>
                    <td style="font-weight:var(--weight-semibold)">${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                `;
                tr.style.cursor = 'pointer';
                tr.title = `Click to convert to ${code}`;
                tr.addEventListener('click', () => { toSelect.value = code; convert(); });
                multiTableBody.appendChild(tr);
            });

            multiTableSection.style.display = 'block';
        }

        // ── Event Listeners ──
        amountInput.addEventListener('input', convert);
        fromSelect.addEventListener('change', convert);
        toSelect.addEventListener('change', convert);

        swapBtn.addEventListener('click', function () {
            const temp = fromSelect.value;
            fromSelect.value = toSelect.value;
            toSelect.value = temp;
            convert();
        });

        btnRefresh.addEventListener('click', function () {
            fetchRates(true);
        });

        // ── Init ──
        populateSelects();
        buildPopularPairs();
        fetchRates();
    });
})();
