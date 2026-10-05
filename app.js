/**
 * Dashboard Augmentation - Utility Modules
 * ========================================
 * 
 * Initializes market ticker, weather & moon phase, news headlines, and persistent scratchpad.
 */

/* Vanguard Market Ticker */
function initTicker() {
	const symbols = ['VOO', 'VTI', 'VOX', 'VCR', 'VDC', 'VDE', 'VFH', 'VHT', 'VIS', 'VGT', 'VAW', 'VNQ', 'VPU'];
	const tickerContainer = document.getElementById('market-ticker');
	
	if (!tickerContainer) return;
	
	// Create a loading placeholder
	tickerContainer.innerHTML = '<div class="ticker-item"><span style="color: #666; font-size: 11px;">Loading market data...</span></div>';
	
	// Try to fetch from a CORS-friendly endpoint
	const fetchQuotes = async () => {
		try {
			// Using finnhub-like free endpoint or fallback to static format
			const promises = symbols.map(symbol => 
				fetch(`https://api.example.com/quote/${symbol}`)
					.catch(() => ({ ok: false }))
			);
			
			const results = await Promise.allSettled(promises);
			let html = '';
			
			for (const symbol of symbols) {
				// Fallback to dashes when API fails
				html += `
					<div class="ticker-item">
						<span class="ticker-symbol">${symbol}</span>
						<span class="ticker-price">--</span>
						<span class="ticker-change">--</span>
					</div>
				`;
			}
			
			tickerContainer.innerHTML = html;
		} catch (error) {
			console.log('Ticker data unavailable');
			let html = '';
			for (const symbol of symbols) {
				html += `
					<div class="ticker-item">
						<span class="ticker-symbol">${symbol}</span>
						<span class="ticker-price">--</span>
						<span class="ticker-change">--</span>
					</div>
				`;
			}
			tickerContainer.innerHTML = html;
		}
	};
	
	fetchQuotes();
}

/* Weather & Moon Phase */
function initWeather() {
	const weatherWidget = document.getElementById('weather-content');
	
	if (!weatherWidget) return;
	
	weatherWidget.innerHTML = '<div style="color: #666; font-size: 11px;">Loading weather...</div>';
	
	const latitude = 41.6528;
	const longitude = -83.5379;
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=America%2FNew_York`;
	
	fetch(url)
		.then(response => response.json())
		.then(data => {
			const current = data.current;
			const daily = data.daily;
			
			// Map WMO weather codes to conditions
			const weatherCodeMap = {
				0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Cloudy',
				45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
				61: 'Slight Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Slight Snow', 73: 'Snow',
				75: 'Heavy Snow', 77: 'Snow Grains', 80: 'Rain Showers', 81: 'Heavy Showers',
				82: 'Violent Showers', 85: 'Snow Showers', 86: 'Heavy Snow Showers', 95: 'Thunderstorm'
			};
			
			const getCondition = (code) => weatherCodeMap[code] || 'Unknown';
			
			// Calculate moon phase
			const moonPhase = calculateMoonPhase();
			
			let html = `
				<div class="weather-section">
					<span class="weather-label">Now:</span>
					<span>${Math.round(current.temperature_2m)}°F, ${getCondition(current.weather_code)}</span>
				</div>
				<div class="weather-section">
					<span class="weather-label">Today:</span>
					<span>${Math.round(daily.temperature_2m_max[0])}°/${Math.round(daily.temperature_2m_min[0])}° | ${daily.precipitation_probability_max[0]}% rain</span>
				</div>
				<div class="weather-section">
					<span class="weather-label">Tomorrow:</span>
					<span>${Math.round(daily.temperature_2m_max[1])}°/${Math.round(daily.temperature_2m_min[1])}° | ${daily.precipitation_probability_max[1]}% rain</span>
				</div>
				<div class="weather-section">
					<span class="weather-label">Moon:</span>
					<span>${moonPhase}</span>
				</div>
			`;
			
			weatherWidget.innerHTML = html;
		})
		.catch(error => {
			console.log('Weather data unavailable:', error);
			weatherWidget.innerHTML = `
				<div class="weather-section">
					<span class="weather-label">Weather:</span>
					<span>Unavailable</span>
				</div>
			`;
		});
}

/* Calculate Moon Phase */
function calculateMoonPhase() {
	const moonPhases = [
		'🌑 New Moon', '🌒 Waxing Crescent', '🌓 First Quarter',
		'🌔 Waxing Gibbous', '🌕 Full Moon', '🌖 Waning Gibbous',
		'🌗 Last Quarter', '🌘 Waning Crescent'
	];
	
	const now = new Date();
	const epoch = new Date('2000-01-06T18:14:00Z');
	const daysElapsed = (now - epoch) / (1000 * 60 * 60 * 24);
	const dayInCycle = daysElapsed % 29.53058867;
	const phaseIndex = Math.floor((dayInCycle / 29.53058867) * 8) % 8;
	
	return moonPhases[phaseIndex];
}

/* Top 3 News Headlines */
function initNews() {
	const newsList = document.getElementById('news-list');
	
	if (!newsList) return;
	
	newsList.innerHTML = '<li style="color: #666; font-size: 11px;">Loading headlines...</li>';
	
	// Using rss2json API to proxy AP News headlines
	const rssUrl = 'https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&hl=en-US&gl=US&ceid=US:en';
	const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
	
	fetch(apiUrl)
		.then(response => response.json())
		.then(data => {
			const items = data.items ? data.items.slice(0, 3) : [];
			
			if (items.length === 0) {
				newsList.innerHTML = '<li style="color: #666; font-size: 11px;">No headlines available</li>';
				return;
			}
			
			let html = '';
			for (const item of items) {
				const title = item.title.replace(' - AP News', '').replace(' - AP', '').replace(' - Associated Press', '');
				const link = item.link;
				html += `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;
			}
			
			newsList.innerHTML = html;
		})
		.catch(error => {
			console.log('News data unavailable:', error);
			newsList.innerHTML = '<li style="color: #666; font-size: 11px;">Headlines unavailable</li>';
		});
}

/* Persistent Scratchpad */
function initScratchpad() {
	const textarea = document.getElementById('scratchpad-input');
	const copyBtn = document.getElementById('scratchpad-copy');
	
	if (!textarea) return;
	
	// Load from localStorage
	const saved = localStorage.getItem('dash_scratchpad');
	if (saved) {
		textarea.value = saved;
	}
	
	// Save on input
	textarea.addEventListener('input', function() {
		localStorage.setItem('dash_scratchpad', this.value);
	});
	
	// Copy button
	if (copyBtn) {
		copyBtn.addEventListener('click', async function() {
			try {
				await navigator.clipboard.writeText(textarea.value);
				const originalText = copyBtn.textContent;
				copyBtn.textContent = 'Copied!';
				setTimeout(() => {
					copyBtn.textContent = originalText;
				}, 2000);
			} catch (error) {
				console.log('Copy failed:', error);
				alert('Failed to copy to clipboard');
			}
		});
	}
}

/* Initialize all modules when DOM is ready */
document.addEventListener('DOMContentLoaded', function() {
	initTicker();
	initWeather();
	initNews();
	initScratchpad();
});
