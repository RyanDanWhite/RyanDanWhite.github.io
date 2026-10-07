"use strict";

/* ==========================================================================
   WEATHER CONFIGURATION
   ========================================================================== */

const WEATHER_CONFIG = {
    defaultLocation: {
        name: "Toledo, OH",
        latitude: 41.6528,
        longitude: -83.5379
    },

    forecastDays: 5,
    cacheDuration: 30 * 60 * 1000,

    /*
     * This is a calculated garden-oriented frost-risk threshold.
     * It is separate from official National Weather Service alerts.
     */
    frostRiskTemperature: 36
};

/* ==========================================================================
   WEATHER CODE DESCRIPTIONS
   ========================================================================== */

const WEATHER_CODE_DESCRIPTIONS = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorms",
    96: "Thunderstorms with hail",
    99: "Severe thunderstorms"
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const weatherPanel = document.getElementById("weather-panel");

    /*
     * Do nothing if the weather HTML has not been added to index.html yet.
     */
    if (!weatherPanel) {
        return;
    }

    initializeWeather();
});

async function initializeWeather() {
    const locationButton = document.getElementById("weather-use-location");

    if (locationButton) {
        locationButton.addEventListener("click", useCurrentLocation);
    }

    await loadWeather(WEATHER_CONFIG.defaultLocation);
}

/* ==========================================================================
   MAIN WEATHER LOADER
   ========================================================================== */

async function loadWeather(location, forceRefresh = false) {
    setWeatherStatus("Loading weather...");

    updateMapLink(location.latitude, location.longitude);

    const cacheKey = createCacheKey(location.latitude, location.longitude);

    if (!forceRefresh) {
        const cachedWeather = getCachedWeather(cacheKey);

        if (cachedWeather) {
            renderWeather(cachedWeather.forecast, cachedWeather.alerts, location);
            setWeatherStatus("");
            return;
        }
    }

    let forecast = null;
    let alerts = [];

    try {
        forecast = await fetchForecast(
            location.latitude,
            location.longitude
        );
    } catch (error) {
        console.error("Unable to load forecast:", error);
    }

    /*
     * Alerts fail independently. A National Weather Service problem should
     * not prevent the Open-Meteo forecast from rendering.
     */
    try {
        alerts = await fetchWeatherAlerts(
            location.latitude,
            location.longitude
        );
    } catch (error) {
        console.warn("Unable to load official weather alerts:", error);
    }

    if (!forecast) {
        const expiredCache = getCachedWeather(cacheKey, true);

        if (expiredCache) {
            renderWeather(
                expiredCache.forecast,
                expiredCache.alerts,
                location
            );

            setWeatherStatus("Showing previously saved weather.");
            return;
        }

        setWeatherStatus("Weather is temporarily unavailable.");
        return;
    }

    const weatherData = {
        savedAt: Date.now(),
        forecast,
        alerts
    };

    saveCachedWeather(cacheKey, weatherData);
    renderWeather(forecast, alerts, location);
    setWeatherStatus("");
}

/* ==========================================================================
   OPEN-METEO FORECAST
   ========================================================================== */

async function fetchForecast(latitude, longitude) {
    const parameters = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),

        current: [
            "temperature_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m"
        ].join(","),

        hourly: [
            "precipitation_probability",
            "cloud_cover"
        ].join(","),

        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "precipitation_sum"
        ].join(","),

        temperature_unit: "fahrenheit",
        wind_speed_unit: "mph",
        precipitation_unit: "inch",
        timezone: "auto",
        forecast_days: WEATHER_CONFIG.forecastDays.toString()
    });

    const requestUrl =
        `https://api.open-meteo.com/v1/forecast?${parameters.toString()}`;

    const response = await fetch(requestUrl);

    if (!response.ok) {
        throw new Error(`Forecast request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.current || !data.daily || !data.hourly) {
        throw new Error("Forecast response was incomplete.");
    }

    return data;
}

/* ==========================================================================
   NATIONAL WEATHER SERVICE ALERTS
   ========================================================================== */

async function fetchWeatherAlerts(latitude, longitude) {
    const parameters = new URLSearchParams({
        point: `${latitude.toFixed(4)},${longitude.toFixed(4)}`,
        status: "actual"
    });

    const requestUrl =
        `https://api.weather.gov/alerts/active?${parameters.toString()}`;

    const response = await fetch(requestUrl, {
        headers: {
            Accept: "application/geo+json"
        }
    });

    if (!response.ok) {
        throw new Error(`Alert request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.features)) {
        return [];
    }

    return data.features
        .map((feature) => feature.properties)
        .filter((alert) => alert && alert.event)
        .sort(compareAlertSeverity);
}

function compareAlertSeverity(firstAlert, secondAlert) {
    return getSeverityRank(firstAlert.severity) -
        getSeverityRank(secondAlert.severity);
}

function getSeverityRank(severity) {
    const ranks = {
        Extreme: 0,
        Severe: 1,
        Moderate: 2,
        Minor: 3,
        Unknown: 4
    };

    return ranks[severity] ?? ranks.Unknown;
}

/* ==========================================================================
   RENDERING
   ========================================================================== */

function renderWeather(forecast, alerts, location) {
    renderLocation(location);
    renderCurrentConditions(forecast);
    renderOfficialAlerts(alerts);
    renderFiveDayForecast(forecast);
    renderFrostRisk(forecast);
    updateMapLink(location.latitude, location.longitude);
}

function renderLocation(location) {
    setText("weather-location", location.name);
}

function renderCurrentConditions(forecast) {
    const current = forecast.current;
    const hourlyIndex = findCurrentHourlyIndex(
        forecast.hourly.time,
        current.time
    );

    const precipitationChance =
        hourlyIndex >= 0
            ? forecast.hourly.precipitation_probability[hourlyIndex]
            : null;

    setText(
        "weather-current-temp",
        formatTemperature(current.temperature_2m)
    );

    setText(
        "weather-current-condition",
        getWeatherDescription(current.weather_code)
    );

    const details = [
        `Feels ${formatTemperature(current.apparent_temperature)}`,
        `Wind ${formatWholeNumber(current.wind_speed_10m)} mph`,
        `Clouds ${formatPercentage(current.cloud_cover)}`,
        `Rain ${formatPercentage(precipitationChance)}`
    ];

    setText("weather-current-details", details.join(" · "));
}

function renderOfficialAlerts(alerts) {
    const alertsContainer = document.getElementById("weather-alerts");

    if (!alertsContainer) {
        return;
    }

    alertsContainer.replaceChildren();

    if (!alerts.length) {
        alertsContainer.classList.remove("active");
        return;
    }

    /*
     * Limit the panel to three active alerts so it remains compact.
     */
    alerts.slice(0, 3).forEach((alert) => {
        const alertElement = document.createElement("div");
        alertElement.className = "weather-alert";

        if (
            alert.severity === "Extreme" ||
            alert.severity === "Severe"
        ) {
            alertElement.classList.add("warning");
        }

        const titleElement = document.createElement("div");
        titleElement.className = "weather-alert-title";
        titleElement.textContent = alert.event;

        alertElement.appendChild(titleElement);

        const timeText = formatAlertTime(alert);

        if (timeText) {
            const timeElement = document.createElement("span");
            timeElement.className = "weather-alert-time";
            timeElement.textContent = timeText;
            alertElement.appendChild(timeElement);
        }

        alertsContainer.appendChild(alertElement);
    });

    alertsContainer.classList.add("active");
}

function renderFiveDayForecast(forecast) {
    const forecastContainer = document.getElementById("weather-forecast");

    if (!forecastContainer) {
        return;
    }

    forecastContainer.replaceChildren();

    const daily = forecast.daily;

    daily.time.forEach((dateString, index) => {
        const dayElement = document.createElement("div");
        dayElement.className = "weather-day";

        const nameElement = document.createElement("div");
        nameElement.className = "weather-day-name";
        nameElement.textContent = formatForecastDay(dateString, index);

        const temperatureElement = document.createElement("div");
        temperatureElement.className = "weather-day-temp";
        temperatureElement.textContent =
            `${formatWholeNumber(daily.temperature_2m_max[index])}° ` +
            `${formatWholeNumber(daily.temperature_2m_min[index])}°`;

        const conditionElement = document.createElement("div");
        conditionElement.className = "weather-day-condition";

        const averageCloudCover = getDailyAverageCloudCover(
            forecast.hourly,
            dateString
        );

        conditionElement.textContent = formatConditionAndCloudCover(
            daily.weather_code[index],
            averageCloudCover
        );

        const rainElement = document.createElement("div");
        rainElement.className = "weather-day-rain";
        rainElement.textContent = formatPercentage(
            daily.precipitation_probability_max[index]
        );

        const precipitationElement = document.createElement("div");
        precipitationElement.className = "weather-day-precip";
        precipitationElement.textContent = formatPrecipitation(
            daily.precipitation_sum[index]
        );

        dayElement.append(
            nameElement,
            temperatureElement,
            conditionElement,
            rainElement,
            precipitationElement
        );

        forecastContainer.appendChild(dayElement);
    });
}

function renderFrostRisk(forecast) {
    const frostElement = document.getElementById("weather-frost-risk");

    if (!frostElement) {
        return;
    }

    frostElement.classList.remove("active");
    frostElement.textContent = "";

    const daily = forecast.daily;

    let coldestIndex = -1;
    let coldestTemperature = Infinity;

    daily.temperature_2m_min.forEach((temperature, index) => {
        if (
            Number.isFinite(temperature) &&
            temperature <= WEATHER_CONFIG.frostRiskTemperature &&
            temperature < coldestTemperature
        ) {
            coldestIndex = index;
            coldestTemperature = temperature;
        }
    });

    if (coldestIndex < 0) {
        return;
    }

    const dayName = formatFrostDay(
        daily.time[coldestIndex],
        coldestIndex
    );

    frostElement.textContent =
        `Frost risk ${dayName} · Forecast low ` +
        `${formatTemperature(coldestTemperature)}`;

    frostElement.classList.add("active");
}

/* ==========================================================================
   CLOUD-COVER CALCULATION
   ========================================================================== */

function getDailyAverageCloudCover(hourly, dateString) {
    if (
        !hourly ||
        !Array.isArray(hourly.time) ||
        !Array.isArray(hourly.cloud_cover)
    ) {
        return null;
    }

    const values = [];

    hourly.time.forEach((time, index) => {
        if (!time.startsWith(dateString)) {
            return;
        }

        const cloudCover = hourly.cloud_cover[index];

        if (Number.isFinite(cloudCover)) {
            values.push(cloudCover);
        }
    });

    if (!values.length) {
        return null;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.round(total / values.length);
}

function formatConditionAndCloudCover(weatherCode, cloudCover) {
    const condition = getWeatherDescription(weatherCode);

    if (!Number.isFinite(cloudCover)) {
        return condition;
    }

    return `${condition} · ${Math.round(cloudCover)}%`;
}

/* ==========================================================================
   GEOLOCATION
   ========================================================================== */

function useCurrentLocation() {
    const locationButton = document.getElementById("weather-use-location");

    if (!navigator.geolocation) {
        setWeatherStatus("Location access is not supported by this browser.");
        return;
    }

    if (locationButton) {
        locationButton.disabled = true;
        locationButton.textContent = "Locating...";
    }

    setWeatherStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const location = {
                name: "Current location",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            try {
                await loadWeather(location, true);
            } finally {
                resetLocationButton();
            }
        },
        (error) => {
            console.warn("Location access failed:", error);

            setWeatherStatus(
                "Unable to use your location. Showing Toledo weather."
            );

            resetLocationButton();
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: WEATHER_CONFIG.cacheDuration
        }
    );
}

function resetLocationButton() {
    const locationButton = document.getElementById("weather-use-location");

    if (!locationButton) {
        return;
    }

    locationButton.disabled = false;
    locationButton.textContent = "Use my location";
}

/* ==========================================================================
   WINDY LIVE MAP
   ========================================================================== */

function updateMapLink(latitude, longitude) {
    const mapLink = document.getElementById("weather-map-link");

    if (!mapLink) {
        return;
    }

    const formattedLatitude = Number(latitude).toFixed(4);
    const formattedLongitude = Number(longitude).toFixed(4);

    mapLink.href =
        `https://www.windy.com/?radar,${formattedLatitude},` +
        `${formattedLongitude},8`;

    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
}

/* ==========================================================================
   CACHE
   ========================================================================== */

function createCacheKey(latitude, longitude) {
    const roundedLatitude = Number(latitude).toFixed(2);
    const roundedLongitude = Number(longitude).toFixed(2);

    return `startpage-weather-${roundedLatitude}-${roundedLongitude}`;
}

function getCachedWeather(cacheKey, allowExpired = false) {
    try {
        const cachedValue = localStorage.getItem(cacheKey);

        if (!cachedValue) {
            return null;
        }

        const cachedWeather = JSON.parse(cachedValue);

        if (
            !cachedWeather ||
            !cachedWeather.forecast ||
            !Number.isFinite(cachedWeather.savedAt)
        ) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        const cacheAge = Date.now() - cachedWeather.savedAt;

        if (
            !allowExpired &&
            cacheAge > WEATHER_CONFIG.cacheDuration
        ) {
            return null;
        }

        return cachedWeather;
    } catch (error) {
        console.warn("Unable to read weather cache:", error);
        return null;
    }
}

function saveCachedWeather(cacheKey, weatherData) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify(weatherData));
    } catch (error) {
        console.warn("Unable to save weather cache:", error);
    }
}

/* ==========================================================================
   FORMATTING HELPERS
   ========================================================================== */

function findCurrentHourlyIndex(hourlyTimes, currentTime) {
    if (!Array.isArray(hourlyTimes) || !currentTime) {
        return -1;
    }

    const exactMatch = hourlyTimes.indexOf(currentTime);

    if (exactMatch >= 0) {
        return exactMatch;
    }

    const currentHour = currentTime.slice(0, 13);

    return hourlyTimes.findIndex((time) => {
        return time.slice(0, 13) === currentHour;
    });
}

function getWeatherDescription(weatherCode) {
    return WEATHER_CODE_DESCRIPTIONS[weatherCode] ?? "Conditions unavailable";
}

function formatForecastDay(dateString, index) {
    if (index === 0) {
        return "Today";
    }

    if (index === 1) {
        return "Tomorrow";
    }

    const date = createLocalDate(dateString);

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short"
    }).format(date);
}

function formatFrostDay(dateString, index) {
    if (index === 0) {
        return "tonight";
    }

    if (index === 1) {
        return "tomorrow night";
    }

    const date = createLocalDate(dateString);

    const weekday = new Intl.DateTimeFormat("en-US", {
        weekday: "long"
    }).format(date);

    return `${weekday} night`;
}

function createLocalDate(dateString) {
    /*
     * Adding a local midday time prevents date-only strings from shifting
     * backward because of UTC conversion.
     */
    return new Date(`${dateString}T12:00:00`);
}

function formatAlertTime(alert) {
    const endTime = alert.ends || alert.expires;

    if (!endTime) {
        return "";
    }

    const date = new Date(endTime);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const formattedTime = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);

    return `Until ${formattedTime}`;
}

function formatTemperature(value) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    return `${Math.round(value)}°`;
}

function formatWholeNumber(value) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    return Math.round(value).toString();
}

function formatPercentage(value) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    return `${Math.round(value)}%`;
}

function formatPrecipitation(value) {
    if (!Number.isFinite(value)) {
        return "—";
    }

    if (value === 0) {
        return "0.00″";
    }

    if (value < 0.01) {
        return "<0.01″";
    }

    return `${value.toFixed(2)}″`;
}

function setText(elementId, text) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = text;
    }
}

function setWeatherStatus(message) {
    setText("weather-status", message);
}