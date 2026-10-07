"use strict";

(() => {
    const NOT_AVAILABLE = "not available";
    const NOT_LOOKED_UP = "not looked up";

    const state = {
        browserAndVersion: NOT_AVAILABLE,
        osAndVersion: NOT_AVAILABLE,
        cpuArchitecture: NOT_AVAILABLE,
        languages: NOT_AVAILABLE,
        screenResolution: NOT_AVAILABLE,
        availableScreen: NOT_AVAILABLE,
        windowSize: NOT_AVAILABLE,
        pixelRatio: NOT_AVAILABLE,
        cpuCoreCount: NOT_AVAILABLE,
        deviceMemory: NOT_AVAILABLE,
        gpuRenderer: NOT_AVAILABLE,
        touchSupport: NOT_AVAILABLE,
        timezoneAndOffset: NOT_AVAILABLE,
        canvasHash: NOT_AVAILABLE,
        audioHash: NOT_AVAILABLE,
        privacySignals: NOT_AVAILABLE,
        cookiesAndStorage: NOT_AVAILABLE,
        publicIp: NOT_LOOKED_UP,
        approximateLocation: NOT_LOOKED_UP,
        ispAndAsn: NOT_LOOKED_UP
    };

    const labels = {
        browserAndVersion: "Browser and version",
        osAndVersion: "OS and version",
        cpuArchitecture: "CPU architecture",
        languages: "Languages",
        screenResolution: "Screen resolution",
        availableScreen: "Available screen",
        windowSize: "Window size",
        pixelRatio: "Pixel ratio",
        cpuCoreCount: "CPU core count",
        deviceMemory: "Device memory",
        gpuRenderer: "GPU renderer",
        touchSupport: "Touch support",
        timezoneAndOffset: "Timezone and UTC offset",
        canvasHash: "Canvas hash",
        audioHash: "Audio hash",
        privacySignals: "Do Not Track and Global Privacy Control",
        cookiesAndStorage: "Cookies and storage availability",
        publicIp: "Public IP",
        approximateLocation: "Approximate location",
        ispAndAsn: "ISP and ASN"
    };

    function initialize() {
        const panel = document.getElementById("fingerprint-panel");

        if (!panel) {
            console.warn("Fingerprint Mirror panel was not found.");
            return;
        }

        document
            .getElementById("fingerprint-rescan")
            ?.addEventListener("click", scan);

        document
            .getElementById("fingerprint-copy")
            ?.addEventListener("click", copyAsJson);

        document
            .getElementById("fingerprint-ip-lookup")
            ?.addEventListener("click", lookupIp);

        renderAll();
        scan();
    }

    async function scan() {
        const button = document.getElementById("fingerprint-rescan");

        if (button) {
            button.disabled = true;
            button.textContent = "Scanning...";
        }

        setStatus("Scanning...");

        setValue("browserAndVersion", getBrowser());
        setValue("osAndVersion", getOperatingSystem());
        setValue("cpuArchitecture", getArchitecture());
        setValue("languages", getLanguages());

        setValue("screenResolution", getScreenResolution());
        setValue("availableScreen", getAvailableScreen());
        setValue("windowSize", getWindowSize());
        setValue("pixelRatio", getPixelRatio());

        setValue("cpuCoreCount", getCpuCoreCount());
        setValue("deviceMemory", getDeviceMemory());
        setValue("gpuRenderer", getGpuRenderer());
        setValue("touchSupport", getTouchSupport());

        setValue("timezoneAndOffset", getTimezone());
        setValue("privacySignals", getPrivacySignals());
        setValue("cookiesAndStorage", getStorageStatus());

        setValue("canvasHash", "calculating...");
        setValue("audioHash", "calculating...");

        const canvasHash = await safelyRun(createCanvasHash);
        const audioHash = await safelyRun(createAudioHash);

        setValue("canvasHash", canvasHash);
        setValue("audioHash", audioHash);

        setStatus("Scan complete.");

        if (button) {
            button.disabled = false;
            button.textContent = "Rescan";
        }
    }

    async function safelyRun(operation) {
        try {
            const result = await operation();
            return result || NOT_AVAILABLE;
        } catch (error) {
            console.warn("Fingerprint check unavailable:", error);
            return NOT_AVAILABLE;
        }
    }

    /* ======================================================================
       BROWSER AND SYSTEM
       ====================================================================== */

    function getBrowser() {
        const userAgent = navigator.userAgent || "";

        const patterns = [
            ["Microsoft Edge", /Edg\/([\d.]+)/],
            ["Opera", /OPR\/([\d.]+)/],
            ["Firefox", /Firefox\/([\d.]+)/],
            ["Google Chrome", /Chrome\/([\d.]+)/],
            ["Safari", /Version\/([\d.]+).*Safari/]
        ];

        for (const [name, pattern] of patterns) {
            const match = userAgent.match(pattern);

            if (match) {
                return `${name} ${match[1]}`;
            }
        }

        return NOT_AVAILABLE;
    }

    function getOperatingSystem() {
        const userAgent = navigator.userAgent || "";

        const android = userAgent.match(/Android ([\d.]+)/);

        if (android) {
            return `Android ${android[1]}`;
        }

        const ios = userAgent.match(
            /(?:iPhone OS|CPU OS) ([\d_]+)/
        );

        if (ios) {
            return `iOS ${ios[1].replaceAll("_", ".")}`;
        }

        const macOS = userAgent.match(/Mac OS X ([\d_]+)/);

        if (macOS) {
            return `macOS ${macOS[1].replaceAll("_", ".")}`;
        }

        if (/Windows NT 10\.0/.test(userAgent)) {
            return "Windows 10 or 11";
        }

        if (/Windows NT 6\.3/.test(userAgent)) {
            return "Windows 8.1";
        }

        if (/Windows NT 6\.1/.test(userAgent)) {
            return "Windows 7";
        }

        if (/Linux/.test(userAgent)) {
            return "Linux";
        }

        return NOT_AVAILABLE;
    }

    function getArchitecture() {
        const userAgent = navigator.userAgent || "";

        if (/arm64|aarch64/i.test(userAgent)) {
            return "ARM64";
        }

        if (/arm/i.test(userAgent)) {
            return "ARM";
        }

        if (/win64|x64|x86_64|amd64/i.test(userAgent)) {
            return "x86-64";
        }

        if (/i[3-6]86|x86/i.test(userAgent)) {
            return "x86";
        }

        return NOT_AVAILABLE;
    }

    function getLanguages() {
        if (navigator.languages?.length) {
            return navigator.languages.join(", ");
        }

        return navigator.language || NOT_AVAILABLE;
    }

    /* ======================================================================
       DISPLAY
       ====================================================================== */

    function getScreenResolution() {
        if (!window.screen) {
            return NOT_AVAILABLE;
        }

        return `${screen.width} × ${screen.height}`;
    }

    function getAvailableScreen() {
        if (!window.screen) {
            return NOT_AVAILABLE;
        }

        return `${screen.availWidth} × ${screen.availHeight}`;
    }

    function getWindowSize() {
        return `${window.innerWidth} × ${window.innerHeight}`;
    }

    function getPixelRatio() {
        return Number.isFinite(window.devicePixelRatio)
            ? String(window.devicePixelRatio)
            : NOT_AVAILABLE;
    }

    /* ======================================================================
       HARDWARE
       ====================================================================== */

    function getCpuCoreCount() {
        return Number.isFinite(navigator.hardwareConcurrency)
            ? String(navigator.hardwareConcurrency)
            : NOT_AVAILABLE;
    }

    function getDeviceMemory() {
        const memory = navigator["deviceMemory"];

        return Number.isFinite(memory)
            ? `Approximately ${memory} GB`
            : NOT_AVAILABLE;
    }

    function getGpuRenderer() {
        const canvas = document.createElement("canvas");

        const gl =
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");

        if (!gl) {
            return NOT_AVAILABLE;
        }

        const extension = gl.getExtension(
            "WEBGL_debug_renderer_info"
        );

        if (extension) {
            return (
                gl.getParameter(
                    extension.UNMASKED_RENDERER_WEBGL
                ) || NOT_AVAILABLE
            );
        }

        return gl.getParameter(gl.RENDERER) || NOT_AVAILABLE;
    }

    function getTouchSupport() {
        const points = navigator.maxTouchPoints || 0;

        if (points > 0) {
            return `${points} touch point${points === 1 ? "" : "s"}`;
        }

        return "Not detected";
    }

    /* ======================================================================
       LOCALE
       ====================================================================== */

    function getTimezone() {
        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        const offsetMinutes = -new Date().getTimezoneOffset();
        const sign = offsetMinutes >= 0 ? "+" : "-";
        const absoluteMinutes = Math.abs(offsetMinutes);

        const hours = String(
            Math.floor(absoluteMinutes / 60)
        ).padStart(2, "0");

        const minutes = String(
            absoluteMinutes % 60
        ).padStart(2, "0");

        const offset = `UTC${sign}${hours}:${minutes}`;

        return timezone
            ? `${timezone} · ${offset}`
            : offset;
    }

    /* ======================================================================
       PRIVACY AND STORAGE
       ====================================================================== */

    function getPrivacySignals() {
        const dntValue =
            navigator.doNotTrack ??
            window.doNotTrack;

        let dnt = NOT_AVAILABLE;

        if (dntValue === "1" || dntValue === 1) {
            dnt = "enabled";
        } else if (dntValue === "0" || dntValue === 0) {
            dnt = "not enabled";
        }

        const gpcValue = navigator["globalPrivacyControl"];

        const gpc =
            typeof gpcValue === "boolean"
                ? gpcValue
                    ? "enabled"
                    : "not enabled"
                : NOT_AVAILABLE;

        return `DNT: ${dnt} · GPC: ${gpc}`;
    }

    function getStorageStatus() {
        const cookies = navigator.cookieEnabled
            ? "enabled"
            : "disabled";

        const local = storageWorks("localStorage")
            ? "available"
            : NOT_AVAILABLE;

        const session = storageWorks("sessionStorage")
            ? "available"
            : NOT_AVAILABLE;

        return (
            `Cookies: ${cookies} · ` +
            `localStorage: ${local} · ` +
            `sessionStorage: ${session}`
        );
    }

    function storageWorks(storageName) {
        try {
            const storage = window[storageName];
            const key = "__fingerprint_test__";

            storage.setItem(key, "1");
            storage.removeItem(key);

            return true;
        } catch {
            return false;
        }
    }

    /* ======================================================================
       CANVAS HASH
       ====================================================================== */

    async function createCanvasHash() {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            return NOT_AVAILABLE;
        }

        canvas.width = 300;
        canvas.height = 60;

        context.fillStyle = "#121212";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = "18px Arial";
        context.fillStyle = "#ffffff";
        context.fillText(
            "Fingerprint Mirror 0123456789",
            10,
            34
        );

        return hashText(canvas.toDataURL());
    }

    /* ======================================================================
       AUDIO HASH
       ====================================================================== */

    async function createAudioHash() {
        const AudioContext =
            window.OfflineAudioContext ||
            window["webkitOfflineAudioContext"];

        if (!AudioContext) {
            return NOT_AVAILABLE;
        }

        const context = new AudioContext(1, 5000, 44100);
        const oscillator = context.createOscillator();

        oscillator.type = "triangle";
        oscillator.frequency.value = 1000;
        oscillator.connect(context.destination);
        oscillator.start();

        const buffer = await context.startRendering();
        const samples = buffer.getChannelData(0);

        let sampleText = "";

        for (let index = 0; index < samples.length; index += 100) {
            sampleText += samples[index].toFixed(8);
        }

        return hashText(sampleText);
    }

    /* ======================================================================
       SHA-256
       ====================================================================== */

    async function hashText(text) {
        if (!window.crypto?.subtle) {
            return NOT_AVAILABLE;
        }

        const bytes = new TextEncoder().encode(text);

        const digest = await crypto.subtle.digest(
            "SHA-256",
            bytes
        );

        return Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    /* ======================================================================
       PUBLIC IP LOOKUP
       ====================================================================== */

    async function lookupIp() {
        const button = document.getElementById(
            "fingerprint-ip-lookup"
        );

        if (button) {
            button.disabled = true;
            button.textContent = "Looking up...";
        }

        setStatus(
            "Requesting public IP and approximate location..."
        );

        try {
            const response = await fetch(
                "https://ipapi.co/json/"
            );

            if (!response.ok) {
                throw new Error(
                    `IP lookup returned ${response.status}`
                );
            }

            const data = await response.json();

            setValue(
                "publicIp",
                data.ip || NOT_AVAILABLE
            );

            const location = [
                data.city,
                data.region,
                data.country_name
            ]
                .filter(Boolean)
                .join(", ");

            setValue(
                "approximateLocation",
                location || NOT_AVAILABLE
            );

            const network = [
                data.org,
                data.asn
            ]
                .filter(Boolean)
                .join(" · ");

            setValue(
                "ispAndAsn",
                network || NOT_AVAILABLE
            );

            setStatus(
                "IP lookup complete. Location is approximate."
            );
        } catch (error) {
            console.error("IP lookup failed:", error);

            setValue("publicIp", "lookup unavailable");
            setValue(
                "approximateLocation",
                "lookup unavailable"
            );
            setValue("ispAndAsn", "lookup unavailable");

            setStatus(
                "IP lookup was blocked or unavailable."
            );
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Look up my IP";
            }
        }
    }

    /* ======================================================================
       COPY JSON
       ====================================================================== */

    async function copyAsJson() {
        const output = {};

        for (const key of Object.keys(state)) {
            output[labels[key]] = state[key];
        }

        const json = JSON.stringify(output, null, 2);

        try {
            await navigator.clipboard.writeText(json);
            setStatus("All 20 values copied as JSON.");
        } catch {
            setStatus("The browser could not copy the JSON.");
        }
    }

    /* ======================================================================
       UI HELPERS
       ====================================================================== */

    function setValue(key, value) {
        const safeValue =
            value === undefined ||
            value === null ||
            value === ""
                ? NOT_AVAILABLE
                : String(value);

        state[key] = safeValue;

        const element = document.getElementById(
            `fingerprint-${key}`
        );

        if (element) {
            element.textContent = safeValue;
            element.title = safeValue;
        }
    }

    function renderAll() {
        for (const key of Object.keys(state)) {
            setValue(key, state[key]);
        }
    }

    function setStatus(message) {
        const status = document.getElementById(
            "fingerprint-status"
        );

        if (status) {
            status.textContent = message;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }
})();