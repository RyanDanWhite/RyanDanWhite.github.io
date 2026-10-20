# RyanDanWhite.github.io

Personal browser start page, hosted on GitHub Pages.

A dark, dependency-free home page with grouped quick links, search, live Toledo weather with a garden frost-risk check, a browser fingerprint mirror, a few everyday utilities, and a hidden Easter egg.

## Features

- Grouped quick-link flyouts (hover or keyboard focus)
- Google and Wikipedia quick search
- Scratchpad that persists in `localStorage`, with Copy
- Live clock with **Copy ISO Date** and **Copy ISO Date/Time** (local time with UTC offset)
- Weather panel: current conditions, 5-day forecast, official NWS alerts, calculated frost risk, optional "Use my location"
- Fingerprint Mirror: shows what the browser and network reveal to any website
- Unit converter (data, temperature, length, weight, volume, speed)
- Subnet / CIDR calculator
- Breakout Easter egg

## Project Structure

```text
RyanDanWhite.github.io/
├── index.html            Page structure and all panels
├── README.md
├── style/
│   └── startpage.css     Dark theme, layout, panel and game styling
└── js/
    ├── startpage.js      Clock, ISO copy buttons, scratchpad, flyout ARIA state
    ├── weather.js        Weather, alerts, frost risk, location, caching
    ├── fingerprint.js    Fingerprint Mirror
    ├── units.js          Unit converter
    ├── subnet.js         Subnet / CIDR calculator
    └── breakout.js       Breakout Easter egg
```

## Quick Links

Links are grouped into flyouts in `index.html`:

About Ryan White · Mail, Calendar & Tasks · Dev · Linux & Homelab · Tools · Privacy · Garden & Weather · Money & Markets · Life

To add or change a link, edit the matching `.link-group` block.

## Weather

- **Forecast data:** [Open-Meteo](https://open-meteo.com/) (no API key).
- **Alerts:** [National Weather Service API](https://www.weather.gov/documentation/services-web-api) active alerts for the current point.
- **Frost risk:** a garden-oriented warning computed locally whenever a forecast low is at or below 36°F. It is separate from official NWS frost/freeze products.
- **Default location:** Toledo, OH. "Use my location" asks for browser geolocation.
- **Caching:** results are cached in `localStorage` for 30 minutes.
- **Map link:** opens Windy centered on the active location.

Settings live in `WEATHER_CONFIG` at the top of `js/weather.js`.

## Fingerprint Mirror

Shows visitors what their browser exposes to any site they load: device, browser, languages, display, time zone, and network details. Public IP, ISP, approximate location, and ASN come from a lookup to `ipapi.co` on page load. **Rescan** refreshes the values and **Copy as JSON** exports them.

Many values are deliberately reduced or withheld by modern browsers (Safari, Firefox and Brave in particular), so results vary by browser and settings.

## Utilities

- **Unit converter:** two-way conversion within a category; edit either side.
- **Subnet / CIDR calculator:** enter an IP with a CIDR or mask to get network, first/last usable, broadcast, and address counts. Result fields have Copy buttons; **Clear** resets the panel.

## Scratchpad

Temporary notes saved to the browser's `localStorage`. They survive refreshes but stay on that browser and device only.

## Breakout Easter Egg

A deliberately subtle trigger on the page launches a small canvas Breakout game.

- Mouse or Left/Right arrows: move paddle
- Space: restart after the game ends
- Escape: exit

## Design Goals

- HTML, CSS and vanilla JavaScript only: no frameworks, no jQuery, no build step, no backend.
- Every external data source is free and keyless, so the page runs directly from GitHub Pages.
- Fast, simple, and easy to maintain.

## Privacy Note

This repository is public. Do not commit machine-specific context dumps, credentials, or internal paths. `*-context.txt` files are ignored by `.gitignore`.
