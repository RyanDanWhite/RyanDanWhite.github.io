/**
 * Dashboard Augmentation - Utility Modules
 * ========================================
 * 
 * Initializes market ticker, weather & moon phase, news headlines, and persistent scratchpad.
 * New layout: 2-column (2/3 left with weather/scratchpad/flyout menus, 1/3 right with search/news/stocks)
 */

// Bookmark data structure
const bookmarkData = {
	'about-ryan-white': {
		label: 'About Ryan White',
		links: []
	},
	'shopping': {
		label: 'Shopping',
		links: []
	},
	'tech': {
		label: 'Tech',
		links: []
	},
	'the-googles': {
		label: 'The Googles',
		links: []
	}
};

/* Ensure DOM elements exist and integrate with script.js output */
function ensureElements() {
	// Check and create left panel
	if (!document.getElementById('left-panel')) {
		const leftPanel = document.createElement('div');
		leftPanel.id = 'left-panel';
		document.getElementById('main-container').insertBefore(leftPanel, document.getElementById('main-container').firstChild);
	}

	const leftPanel = document.getElementById('left-panel');

	// Ensure weather widget exists in left panel
	if (!document.getElementById('weather-widget')) {
		const weatherWidget = document.createElement('div');
		weatherWidget.id = 'weather-widget';
		weatherWidget.className = 'utility-panel';
		weatherWidget.innerHTML = '<div id="weather-content"></div>';
		leftPanel.appendChild(weatherWidget);
	}

	// Ensure scratchpad widget exists in left panel
	if (!document.getElementById('scratchpad-widget')) {
		const scratchpadWidget = document.createElement('div');
		scratchpadWidget.id = 'scratchpad-widget';
		scratchpadWidget.className = 'utility-panel';
		scratchpadWidget.innerHTML = `
			<h2>Scratchpad</h2>
			<textarea id="scratchpad-input" placeholder="Quick notes..."></textarea>
			<button id="scratchpad-copy">Copy</button>
		`;
		leftPanel.appendChild(scratchpadWidget);
	}

	// Ensure flyout menu exists
	if (!document.getElementById('flyout-menu')) {
		const flyoutMenu = document.createElement('div');
		flyoutMenu.id = 'flyout-menu';
		const buttons = [
			{ id: 'about-ryan-white', label: 'About Ryan White' },
			{ id: 'shopping', label: 'Shopping' },
			{ id: 'tech', label: 'Tech' },
			{ id: 'the-googles', label: 'The Googles' }
		];
		buttons.forEach(btn => {
			const button = document.createElement('button');
			button.className = 'flyout-toggle';
			button.setAttribute('data-section', btn.id);
			button.textContent = btn.label;
			flyoutMenu.appendChild(button);
		});
		leftPanel.appendChild(flyoutMenu);
	}

	// Ensure flyout panels container exists
	if (!document.getElementById('flyout-panels')) {
		const flyoutPanels = document.createElement('div');
		flyoutPanels.id = 'flyout-panels';
		leftPanel.appendChild(flyoutPanels);
	}

	// Ensure right sidebar exists
	if (!document.getElementById('right-sidebar')) {
		const rightSidebar = document.createElement('div');
		rightSidebar.id = 'right-sidebar';
		document.getElementById('main-container').appendChild(rightSidebar);
	}

	const rightSidebar = document.getElementById('right-sidebar');

	// Ensure search boxes container exists
	if (!document.getElementById('search-boxes')) {
		const searchBoxes = document.createElement('div');
		searchBoxes.id = 'search-boxes';
		rightSidebar.insertBefore(searchBoxes, rightSidebar.firstChild);
	}

	// Ensure news widget exists
	if (!document.getElementById('news-widget')) {
		const newsWidget = document.createElement('div');
		newsWidget.id = 'news-widget';
		newsWidget.className = 'utility-panel';
		newsWidget.innerHTML = '<h2>News</h2><ul id="news-list"></ul>';
		rightSidebar.appendChild(newsWidget);
	}

	// Ensure market ticker exists
	if (!document.getElementById('market-ticker')) {
		const ticker = document.createElement('div');
		ticker.id = 'market-ticker';
		ticker.className = 'ticker-panel';
		const tickerH2 = document.createElement('h2');
		tickerH2.textContent = 'Stocks';
		ticker.appendChild(tickerH2);
		rightSidebar.appendChild(ticker);
	}

	// Ensure game overlay exists
	if (!document.getElementById('game-overlay')) {
		const overlay = document.createElement('div');
		overlay.id = 'game-overlay';
		const canvas = document.createElement('canvas');
		canvas.id = 'breakout-canvas';
		canvas.width = 480;
		canvas.height = 320;
		overlay.appendChild(canvas);
		document.body.appendChild(overlay);
	}

	// Ensure easter-egg-trigger exists
	if (!document.getElementById('easter-egg-trigger')) {
		const trigger = document.createElement('div');
		trigger.id = 'easter-egg-trigger';
		trigger.setAttribute('aria-hidden', 'true');
		document.body.appendChild(trigger);
	}
}

/* Reorganize script.js output: extract links and populate bookmarks */
function reorganizeBookmarks() {
	const bookmarkColumns = document.getElementById('bookmark-columns');
	if (bookmarkColumns) {
		bookmarkColumns.remove();
	}

	// Extract bookmark blocks from script.js
	const blocks = document.querySelectorAll('body > .block');
	blocks.forEach(block => {
		const h1 = block.querySelector('h1');
		if (!h1) return;

		const title = h1.textContent.trim();
		let sectionId = null;

		// Map block titles to section IDs
		if (title === 'About Ryan White') sectionId = 'about-ryan-white';
		else if (title === 'Shopping') sectionId = 'shopping';
		else if (title === 'Tech') sectionId = 'tech';
		else if (title === 'The Googles') sectionId = 'the-googles';

		if (sectionId && bookmarkData[sectionId]) {
			// Extract links from this block
			const links = block.querySelectorAll('a');
			links.forEach(link => {
				bookmarkData[sectionId].links.push({
					href: link.href,
					text: link.textContent.trim()
				});
			});
		}

		// Remove the block element
		block.remove();
	});

	// Remove the searches div
	const searches = document.getElementById('searches');
	if (searches) {
		const searchBoxes = document.getElementById('search-boxes');
		if (searchBoxes) {
			const forms = searches.querySelectorAll('form');
			// Only keep Google (index 0) and Wikipedia (index 3)
			forms.forEach((form, index) => {
				if (index === 0 || index === 3) {
					searchBoxes.appendChild(form.cloneNode(true));
				}
			});
		}
		searches.remove();
	}

	// Populate flyout panels with bookmark links
	populateFlyoutPanels();
}

/* Create flyout panel HTML for each bookmark section */
function populateFlyoutPanels() {
	const flyoutPanels = document.getElementById('flyout-panels');
	if (!flyoutPanels) return;

	Object.keys(bookmarkData).forEach(sectionId => {
		const section = bookmarkData[sectionId];
		if (section.links.length === 0) return;

		const panel = document.createElement('div');
		panel.className = 'flyout-panel';
		panel.setAttribute('data-section', sectionId);

		const ul = document.createElement('ul');
		section.links.forEach(link => {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = link.href;
			a.textContent = link.text;
			a.target = '_blank';
			a.rel = 'noopener noreferrer';
			li.appendChild(a);
			ul.appendChild(li);
		});

		panel.appendChild(ul);
		flyoutPanels.appendChild(panel);
	});

	// Add flyout toggle listeners
	setupFlyoutToggle();
}

/* Setup flyout menu toggle functionality */
function setupFlyoutToggle() {
	const buttons = document.querySelectorAll('.flyout-toggle');
	const flyoutPanels = document.getElementById('flyout-panels');

	buttons.forEach(button => {
		button.addEventListener('click', function(e) {
			e.preventDefault();
			const sectionId = this.getAttribute('data-section');
			const isActive = this.classList.contains('active');

			// Remove active state from all buttons
			buttons.forEach(btn => btn.classList.remove('active'));

			// Remove active state from all panels
			const panels = document.querySelectorAll('.flyout-panel');
			panels.forEach(panel => panel.classList.remove('active'));

			// If clicking same button, just toggle off
			if (isActive) {
				this.classList.remove('active');
				flyoutPanels.classList.remove('active');
			} else {
				// Show the clicked section
				this.classList.add('active');
				const targetPanel = document.querySelector(`.flyout-panel[data-section="${sectionId}"]`);
				if (targetPanel) {
					targetPanel.classList.add('active');
					flyoutPanels.classList.add('active');
				}
			}
		});
	});

	// Close flyout when clicking outside
	document.addEventListener('click', function(e) {
		if (!e.target.closest('#flyout-menu') && !e.target.closest('#flyout-panels')) {
			buttons.forEach(btn => btn.classList.remove('active'));
			const panels = document.querySelectorAll('.flyout-panel');
			panels.forEach(panel => panel.classList.remove('active'));
			flyoutPanels.classList.remove('active');
		}
	});
}

/* Initialize Vanguard Market Ticker */
function initTicker() {
	const symbols = ['VOO', 'VTI', 'VOX', 'VCR', 'VDC', 'VDE', 'VFH', 'VHT', 'VIS', 'VGT', 'VAW', 'VNQ', 'VPU'];
	const ticker = document.getElementById('market-ticker');
	if (!ticker) return;

	// For now, show as dashes (placeholder)
	// In production, fetch from a financial API
	const tickerContent = document.createElement('div');
	tickerContent.id = 'ticker-content';

	symbols.forEach(symbol => {
		const item = document.createElement('div');
		item.className = 'ticker-item';
		item.innerHTML = `<span class="ticker-symbol">${symbol}</span><span class="ticker-price">--</span><span class="ticker-change">--</span>`;
		tickerContent.appendChild(item);
	});

	ticker.appendChild(tickerContent);
}

/* Calculate moon phase */
function calculateMoonPhase() {
	const knownNewMoonEpoch = 947163600000; // January 6, 2000, 18:14 UTC
	const lunarCycle = 29.53058867; // days
	const now = Date.now();
	const daysSinceEpoch = (now - knownNewMoonEpoch) / 86400000;
	const daysInCycle = daysSinceEpoch % lunarCycle;
	const phaseIndex = Math.floor((daysInCycle / lunarCycle) * 8);

	const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
		'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
	return phases[phaseIndex] || 'Unknown';
}

/* Initialize Weather & Moon */
function initWeather() {
	const weatherContent = document.getElementById('weather-content');
	if (!weatherContent) return;

	const lat = 41.6528;
	const lon = -83.5379;
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=America%2FNew_York`;

	fetch(url)
		.then(r => r.json())
		.then(data => {
			if (!data.current) {
				weatherContent.textContent = 'Weather unavailable';
				return;
			}

			const current = data.current;
			const daily = data.daily;

			const wmoToText = (code) => {
				if (code === 0 || code === 1) return 'Clear';
				if (code === 2) return 'Cloudy';
				if (code === 3) return 'Overcast';
				if (code >= 45) return 'Foggy';
				if (code >= 80) return 'Rain';
				if (code >= 70) return 'Snow';
				return 'Unknown';
			};

			const now = new Date();
			const today = 0;
			const tomorrow = 1;

			let html = `
				<div class="weather-section">
					<span class="weather-label">Now:</span>
					<span>${current.temperature_2m}°F, ${wmoToText(current.weather_code)}</span>
				</div>
				<div class="weather-section">
					<span class="weather-label">Today:</span>
					<span>${daily.temperature_2m_max[today]}°/${daily.temperature_2m_min[today]}°, ${daily.precipitation_probability_max[today]}% rain</span>
				</div>
				<div class="weather-section">
					<span class="weather-label">Tomorrow:</span>
					<span>${daily.temperature_2m_max[tomorrow]}°/${daily.temperature_2m_min[tomorrow]}°, ${daily.precipitation_probability_max[tomorrow]}% rain</span>
				</div>
				<div class="weather-section">
					<span class="weather-label">Moon:</span>
					<span>${calculateMoonPhase()}</span>
				</div>
			`;

			weatherContent.innerHTML = html;
		})
		.catch(e => {
			console.error('Weather fetch error:', e);
			weatherContent.textContent = 'Weather unavailable';
		});
}

/* Initialize News Headlines */
function initNews() {
	const newsList = document.getElementById('news-list');
	if (!newsList) return;

	const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&hl=en-US&gl=US&ceid=US:en');
	const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

	fetch(proxyUrl)
		.then(r => r.json())
		.then(data => {
			console.log('News API Response:', data);

			if (!data.items || data.items.length === 0) {
				newsList.innerHTML = '<li>No headlines available</li>';
				return;
			}

			const headlines = data.items.slice(0, 3);
			let validCount = 0;

			newsList.innerHTML = '';
			headlines.forEach(item => {
				const title = item.title || item.description || '';
				const link = item.link || item.url || item.guid || '#';

				if (title.trim()) {
					// Clean up source suffix
					let cleanTitle = title.replace(/\s*-\s*AP News.*$/i, '').trim();
					cleanTitle = cleanTitle.replace(/\s*-\s*Google News.*$/i, '').trim();

					const li = document.createElement('li');
					const a = document.createElement('a');
					a.href = link;
					a.textContent = cleanTitle;
					a.target = '_blank';
					a.rel = 'noopener noreferrer';
					li.appendChild(a);
					newsList.appendChild(li);
					validCount++;
				}
			});

			if (validCount === 0) {
				newsList.innerHTML = '<li>No valid headlines found</li>';
			}
		})
		.catch(e => {
			console.error('News fetch error:', e);
			newsList.innerHTML = '<li>Headlines unavailable</li>';
		});
}

/* Initialize Persistent Scratchpad */
function initScratchpad() {
	const textarea = document.getElementById('scratchpad-input');
	const copyBtn = document.getElementById('scratchpad-copy');

	if (!textarea) return;

	// Load from localStorage
	const saved = localStorage.getItem('dash_scratchpad');
	if (saved) {
		textarea.value = saved;
	}

	// Save to localStorage on input
	textarea.addEventListener('input', (e) => {
		localStorage.setItem('dash_scratchpad', e.target.value);
	});

	// Copy button
	if (copyBtn) {
		copyBtn.addEventListener('click', () => {
			navigator.clipboard.writeText(textarea.value).then(() => {
				const originalText = copyBtn.textContent;
				copyBtn.textContent = 'Copied!';
				setTimeout(() => {
					copyBtn.textContent = originalText;
				}, 2000);
			});
		});
	}
}

/* Initialize all modules when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
	ensureElements();

	// Wait for script.js to finish, then reorganize
	setTimeout(() => {
		reorganizeBookmarks();
		initTicker();
		initWeather();
		initNews();
		initScratchpad();
	}, 50);
});
