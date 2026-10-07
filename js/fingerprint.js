"use strict";

/* ==========================================================================
   FINGERPRINT MIRROR
   ========================================================================== */

const NOT_AVAILABLE = "not available";
const NOT_LOOKED_UP = "not looked up";

const fingerprintState = {
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

const fingerprintItems = [
    {
        number: 1,
        key: "browserAndVersion",
        label: "Browser and version"
    },
    {
        number: 2,
        key: "osAndVersion",
        label: "OS and version"
    },
    {
        number: 3,
        key: "cpuArchitecture",
        label: "CPU architecture"
    },
    {
        number: 4,
        key: "languages",
        label: "Languages"
    },
    {
        number: 5,
        key: "screenResolution",
        label: "Screen resolution"
    },
    {
        number: 6,
        key: "availableScreen",
        label: "Available screen"
    },
    {
        number: 7,
        key: "windowSize",
        label: "Window size"
    },
    {
        number: 8,
        key: "pixelRatio",
        label: "Pixel ratio"
    },
    {
        number: 9,
        key: "cpuCoreCount",
        label: "CPU core count"
    },
    {
        number: 10,
        key: "deviceMemory",
        label: "Device memory"
    },
    {
        number: 11,
        key: "gpuRenderer",
        label: "GPU renderer"
    },
    {
        number: 12,
        key: "touchSupport",
        label: "Touch support"
    },
    {
        number: 13,
        key: "timezoneAndOffset",
        label: "Timezone and UTC offset"
    },
    {
        number: 14,
        key: "canvasHash",
        label: "Canvas hash"
    },
    {
        number: 15,
        key: "audioHash",
        label: "Audio hash"
    },
    {
        number: 16,
        key: "privacySignals",
        label: "Do Not Track and Global Privacy Control"
    },
    {
        number: 17,
        key: "cookiesAndStorage",
        label: "Cookies and storage availability"
    },
    {
        number: 18,
        key: "publicIp",
        label: "Public IP"
    },
    {
        number: 19,
        key: "approximateLocation",
        label: "Approximate location"
    },
    {
        number: 20,
        key: "ispAndAsn",
        label: "ISP and ASN"
    }
];

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeFingerprintMirror
    );
} else {
    initializeFingerprintMirror();
}

function initializeFingerprintMirror() {
    const panel = document.getElementById(
        "fingerprint-panel"
    );

    if (!panel) {
        console.warn(
            "Fingerprint Mirror could not find #fingerprint-panel."
        );
        return;
    }

    const rescanButton = document.getElementById(
        "fingerprint-rescan"
    );

    const copyButton = document.getElementById(
        "fingerprint-copy"
    );

    const ipButton = document.getElementById(
        "fingerprint-ip-lookup"
    );

    if (rescanButton) {
        rescanButton.addEventListener(
            "click",
            scanFingerprint
        );
    }

    if (copyButton) {
        copyButton.addEventListener(
            "click",
            copyFingerprintAsJson
        );
    }

    if (ipButton) {
        ipButton.addEventListener(
            "click",
            lookUpPublicIp
        );
    }

    renderFingerprintState();
    scanFingerprint();
}

/* ==========================================================================
   MAIN LOCAL SCAN
   ========================================================================== */

async function scanFingerprint() {
    const rescanButton = document.getElementById(
        "fingerprint-rescan"
    );

    if (rescanButton) {
        rescanButton.disabled = true;
        rescanButton.textContent = "Scanning...";
    }

    setFingerprintStatus(
        "Scanning browser and system..."
    );

    try {
        const browserData =
            await getBrowserAndSystemData();

        setFingerprintValue(
            "browserAndVersion",
            browserData.browserAndVersion
        );

        setFingerprintValue(
            "osAndVersion",
            browserData.osAndVersion
        );

        setFingerprintValue(
            "cpuArchitecture",
            browserData.cpuArchitecture
        );

        setFingerprintValue(
            "languages",
            getLanguages()
        );

        setFingerprintValue(
            "screenResolution",
            getScreenResolution()
        );

        setFingerprintValue(
            "availableScreen",
            getAvailableScreen()
        );

        setFingerprintValue(
            "windowSize",
            getWindowSize()
        );

        setFingerprintValue(
            "pixelRatio",
            getPixelRatio()
        );

        setFingerprintValue(
            "cpuCoreCount",
            getCpuCoreCount()
        );

        setFingerprintValue(
            "deviceMemory",
            getDeviceMemory()
        );

        setFingerprintValue(
            "gpuRenderer",
            getGpuRenderer()
        );

        setFingerprintValue(
            "touchSupport",
            getTouchSupport()
        );

        setFingerprintValue(
            "timezoneAndOffset",
            getTimezoneAndOffset()
        );

        setFingerprintValue(
            "privacySignals",
            getPrivacySignals()
        );

        setFingerprintValue(
            "cookiesAndStorage",
            getCookiesAndStorage()
        );

        setFingerprintValue(
            "canvasHash",
            "calculating..."
        );

        setFingerprintValue(
            "audioHash",
            "calculating..."
        );

        const hashResults =
            await Promise.allSettled([
                createCanvasHash(),
                createAudioHash()
            ]);

        const canvasResult = hashResults[0];
        const audioResult = hashResults[1];

        setFingerprintValue(
            "canvasHash",
            canvasResult.status === "fulfilled"
                ? canvasResult.value
                : NOT_AVAILABLE
        );

        setFingerprintValue(
            "audioHash",
            audioResult.status === "fulfilled"
                ? audioResult.value
                : NOT_AVAILABLE
        );

        setFingerprintStatus("Scan complete.");
    } catch (error) {
        console.error(
            "Fingerprint scan failed:",
            error
        );

        setFingerprintStatus(
            "The scan completed with unavailable values."
        );
    } finally {
        if (rescanButton) {
            rescanButton.disabled = false;
            rescanButton.textContent = "Rescan";
        }
    }
}

/* ==========================================================================
   BROWSER AND SYSTEM
   ========================================================================== */

async function getBrowserAndSystemData() {
    const fallback = parseUserAgent(
        navigator.userAgent || ""
    );

    const result = {
        browserAndVersion:
            fallback.browserAndVersion,

        osAndVersion:
            fallback.osAndVersion,

        cpuArchitecture:
            fallback.cpuArchitecture
    };

    const userAgentData = navigator.userAgentData;

    if (
        !userAgentData ||
        typeof userAgentData.getHighEntropyValues !==
            "function"
    ) {
        return result;
    }

    try {
        const values =
            await userAgentData.getHighEntropyValues([
                "architecture",
                "bitness",
                "fullVersionList",
                "platform",
                "platformVersion",
                "uaFullVersion",
                "wow64"
            ]);

        const browser =
            getBrowserFromClientHints(
                values,
                userAgentData
            );

        if (browser !== NOT_AVAILABLE) {
            result.browserAndVersion = browser;
        }

        const operatingSystem =
            formatClientHintOperatingSystem(
                values.platform ||
                    userAgentData.platform,
                values.platformVersion
            );

        if (operatingSystem !== NOT_AVAILABLE) {
            result.osAndVersion =
                operatingSystem;
        }

        const architecture =
            formatClientHintArchitecture(
                values.architecture,
                values.bitness,
                values.wow64
            );

        if (architecture !== NOT_AVAILABLE) {
            result.cpuArchitecture =
                architecture;
        }
    } catch (error) {
        console.warn(
            "User-Agent Client Hints were unavailable:",
            error
        );
    }

    return result;
}

function getBrowserFromClientHints(
    values,
    userAgentData
) {
    const brands =
        values.fullVersionList ||
        userAgentData.brands ||
        [];

    const usableBrands = brands.filter(
        (entry) => {
            return (
                entry &&
                entry.brand &&
                !/not.?a.?brand/i.test(
                    entry.brand
                )
            );
        }
    );

    const edge = usableBrands.find(
        (entry) => {
            return /microsoft edge/i.test(
                entry.brand
            );
        }
    );

    if (edge) {
        return `Microsoft Edge ${edge.version}`;
    }

    const opera = usableBrands.find(
        (entry) => {
            return /opera/i.test(
                entry.brand
            );
        }
    );

    if (opera) {
        return `Opera ${opera.version}`;
    }

    const chrome = usableBrands.find(
        (entry) => {
            return /google chrome/i.test(
                entry.brand
            );
        }
    );

    if (chrome) {
        return `Google Chrome ${chrome.version}`;
    }

    const chromium = usableBrands.find(
        (entry) => {
            return /^chromium$/i.test(
                entry.brand
            );
        }
    );

    if (chromium) {
        return `Chromium ${chromium.version}`;
    }

    return NOT_AVAILABLE;
}

function formatClientHintOperatingSystem(
    platform,
    platformVersion
) {
    if (!platform) {
        return NOT_AVAILABLE;
    }

    if (platform === "Windows") {
        if (!platformVersion) {
            return "Windows";
        }

        const majorVersion = Number.parseInt(
            platformVersion.split(".")[0],
            10
        );

        if (Number.isFinite(majorVersion)) {
            if (majorVersion >= 13) {
                return "Windows 11";
            }

            if (majorVersion > 0) {
                return "Windows 10";
            }
        }

        return "Windows";
    }

    if (!platformVersion) {
        return platform;
    }

    return `${platform} ${platformVersion}`;
}

function formatClientHintArchitecture(
    architecture,
    bitness,
    wow64
) {
    const parts = [];

    if (architecture) {
        parts.push(architecture);
    }

    if (bitness) {
        parts.push(`${bitness}-bit`);
    }

    if (wow64 === true) {
        parts.push("WOW64");
    }

    return parts.length
        ? parts.join(" · ")
        : NOT_AVAILABLE;
}

function parseUserAgent(userAgent) {
    return {
        browserAndVersion:
            getBrowserFromUserAgent(userAgent),

        osAndVersion:
            getOperatingSystemFromUserAgent(
                userAgent
            ),

        cpuArchitecture:
            getArchitectureFromUserAgent(
                userAgent
            )
    };
}

function getBrowserFromUserAgent(userAgent) {
    const browserPatterns = [
        {
            name: "Microsoft Edge",
            expression: /Edg\/([\d.]+)/
        },
        {
            name: "Opera",
            expression: /OPR\/([\d.]+)/
        },
        {
            name: "Firefox",
            expression: /Firefox\/([\d.]+)/
        },
        {
            name: "Google Chrome",
            expression: /Chrome\/([\d.]+)/
        },
        {
            name: "Safari",
            expression:
                /Version\/([\d.]+).*Safari/
        }
    ];

    for (const browser of browserPatterns) {
        const match = userAgent.match(
            browser.expression
        );

        if (match) {
            return (
                `${browser.name} ` +
                `${match[1]}`
            );
        }
    }

    return NOT_AVAILABLE;
}

function getOperatingSystemFromUserAgent(
    userAgent
) {
    const androidMatch =
        userAgent.match(
            /Android ([\d.]+)/
        );

    if (androidMatch) {
        return `Android ${androidMatch[1]}`;
    }

    const iosMatch = userAgent.match(
        /(?:iPhone OS|CPU OS) ([\d_]+)/
    );

    if (iosMatch) {
        return (
            `iOS ` +
            `${iosMatch[1].replaceAll(
                "_",
                "."
            )}`
        );
    }

    const windowsMatch =
        userAgent.match(
            /Windows NT ([\d.]+)/
        );

    if (windowsMatch) {
        const windowsVersions = {
            "10.0": "Windows 10 or later",
            "6.3": "Windows 8.1",
            "6.2": "Windows 8",
            "6.1": "Windows 7"
        };

        return (
            windowsVersions[
                windowsMatch[1]
            ] ||
            `Windows NT ${
                windowsMatch[1]
            }`
        );
    }

    const macMatch =
        userAgent.match(
            /Mac OS X ([\d_]+)/
        );

    if (macMatch) {
        return (
            `macOS ` +
            `${macMatch[1].replaceAll(
                "_",
                "."
            )}`
        );
    }

    if (/Linux/i.test(userAgent)) {
        return "Linux";
    }

    return NOT_AVAILABLE;
}

function getArchitectureFromUserAgent(
    userAgent
) {
    if (/arm64|aarch64/i.test(userAgent)) {
        return "ARM64";
    }

    if (/arm/i.test(userAgent)) {
        return "ARM";
    }

    if (
        /x86_64|win64|x64|amd64/i.test(
            userAgent
        )
    ) {
        return "x86-64";
    }

    if (/i[3-6]86|x86/i.test(userAgent)) {
        return "x86";
    }

    return NOT_AVAILABLE;
}

function getLanguages() {
    if (
        Array.isArray(navigator.languages) &&
        navigator.languages.length
    ) {
        return navigator.languages.join(", ");
    }

    return (
        navigator.language ||
        NOT_AVAILABLE
    );
}

/* ==========================================================================
   DISPLAY
   ========================================================================== */

function getScreenResolution() {
    if (
        !window.screen ||
        !Number.isFinite(
            window.screen.width
        ) ||
        !Number.isFinite(
            window.screen.height
        )
    ) {
        return NOT_AVAILABLE;
    }

    return (
        `${window.screen.width} × ` +
        `${window.screen.height}`
    );
}

function getAvailableScreen() {
    if (
        !window.screen ||
        !Number.isFinite(
            window.screen.availWidth
        ) ||
        !Number.isFinite(
            window.screen.availHeight
        )
    ) {
        return NOT_AVAILABLE;
    }

    return (
        `${window.screen.availWidth} × ` +
        `${window.screen.availHeight}`
    );
}

function getWindowSize() {
    if (
        !Number.isFinite(
            window.innerWidth
        ) ||
        !Number.isFinite(
            window.innerHeight
        )
    ) {
        return NOT_AVAILABLE;
    }

    return (
        `${window.innerWidth} × ` +
        `${window.innerHeight}`
    );
}

function getPixelRatio() {
    if (
        !Number.isFinite(
            window.devicePixelRatio
        )
    ) {
        return NOT_AVAILABLE;
    }

    return String(
        window.devicePixelRatio
    );
}

/* ==========================================================================
   HARDWARE
   ========================================================================== */

function getCpuCoreCount() {
    if (
        !Number.isFinite(
            navigator.hardwareConcurrency
        )
    ) {
        return NOT_AVAILABLE;
    }

    return String(
        navigator.hardwareConcurrency
    );
}

function getDeviceMemory() {
    if (
        !Number.isFinite(
            navigator.deviceMemory
        )
    ) {
        return NOT_AVAILABLE;
    }

    return (
        `Approximately ` +
        `${navigator.deviceMemory} GB`
    );
}

function getGpuRenderer() {
    const canvas =
        document.createElement("canvas");

    const context =
        canvas.getContext("webgl") ||
        canvas.getContext(
            "experimental-webgl"
        );

    if (!context) {
        return NOT_AVAILABLE;
    }

    try {
        const extension =
            context.getExtension(
                "WEBGL_debug_renderer_info"
            );

        if (extension) {
            const renderer =
                context.getParameter(
                    extension
                        .UNMASKED_RENDERER_WEBGL
                );

            if (renderer) {
                return String(renderer);
            }
        }

        const fallbackRenderer =
            context.getParameter(
                context.RENDERER
            );

        return fallbackRenderer
            ? String(fallbackRenderer)
            : NOT_AVAILABLE;
    } catch (error) {
        console.warn(
            "GPU renderer was unavailable:",
            error
        );

        return NOT_AVAILABLE;
    }
}

function getTouchSupport() {
    const touchPoints =
        Number.isFinite(
            navigator.maxTouchPoints
        )
            ? navigator.maxTouchPoints
            : 0;

    if (touchPoints > 0) {
        const suffix =
            touchPoints === 1
                ? ""
                : "s";

        return (
            `Supported · ` +
            `${touchPoints} ` +
            `touch point${suffix}`
        );
    }

    if ("ontouchstart" in window) {
        return "Supported";
    }

    return "Not detected";
}

/* ==========================================================================
   LOCALE
   ========================================================================== */

function getTimezoneAndOffset() {
    let timezone = NOT_AVAILABLE;

    try {
        timezone =
            Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone ||
            NOT_AVAILABLE;
    } catch (error) {
        console.warn(
            "Timezone was unavailable:",
            error
        );
    }

    const offsetMinutes =
        -new Date().getTimezoneOffset();

    const offset =
        formatUtcOffset(offsetMinutes);

    return timezone === NOT_AVAILABLE
        ? offset
        : `${timezone} · ${offset}`;
}

function formatUtcOffset(offsetMinutes) {
    const sign =
        offsetMinutes >= 0 ? "+" : "-";

    const absoluteMinutes =
        Math.abs(offsetMinutes);

    const hours = String(
        Math.floor(
            absoluteMinutes / 60
        )
    ).padStart(2, "0");

    const minutes = String(
        absoluteMinutes % 60
    ).padStart(2, "0");

    return (
        `UTC${sign}${hours}:${minutes}`
    );
}

/* ==========================================================================
   CANVAS HASH
   ========================================================================== */

async function createCanvasHash() {
    const canvas =
        document.createElement("canvas");

    canvas.width = 320;
    canvas.height = 100;

    const context =
        canvas.getContext("2d");

    if (!context) {
        return NOT_AVAILABLE;
    }

    const gradient =
        context.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#4f81bd"
    );

    gradient.addColorStop(
        0.5,
        "#9bbb59"
    );

    gradient.addColorStop(
        1,
        "#c0504d"
    );

    context.fillStyle = gradient;

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.fillStyle =
        "rgba(20, 20, 20, 0.85)";

    context.fillRect(
        8,
        8,
        304,
        84
    );

    context.textBaseline =
        "alphabetic";

    context.font =
        '17px "Segoe UI", Arial, sans-serif';

    context.fillStyle = "#f2f2f2";

    context.fillText(
        "Fingerprint Mirror: Cwm fjord bank glyphs",
        15,
        40
    );

    context.fillStyle = "#9caebd";

    context.fillText(
        "0123456789 !@#$%^&*()",
        15,
        68
    );

    context.beginPath();

    context.arc(
        284,
        51,
        23,
        0,
        Math.PI * 2
    );

    context.strokeStyle =
        "rgba(255, 255, 255, 0.75)";

    context.lineWidth = 3;
    context.stroke();

    return createSha256Hash(
        canvas.toDataURL("image/png")
    );
}

/* ==========================================================================
   AUDIO HASH
   ========================================================================== */

async function createAudioHash() {
    const OfflineAudioContextClass =
        window.OfflineAudioContext ||
        window.webkitOfflineAudioContext;

    if (!OfflineAudioContextClass) {
        return NOT_AVAILABLE;
    }

    const sampleRate = 44100;
    const frameCount = 44100;

    const audioContext =
        new OfflineAudioContextClass(
            1,
            frameCount,
            sampleRate
        );

    const oscillator =
        audioContext.createOscillator();

    const compressor =
        audioContext
            .createDynamicsCompressor();

    oscillator.type = "triangle";
    oscillator.frequency.value = 10000;

    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);

    compressor.connect(
        audioContext.destination
    );

    oscillator.start(0);

    const renderedBuffer =
        await audioContext.startRendering();

    const sourceSamples =
        renderedBuffer.getChannelData(0);

    const copiedSamples =
        new Float32Array(
            sourceSamples.length
        );

    copiedSamples.set(sourceSamples);

    return createSha256Hash(
        copiedSamples.buffer
    );
}

/* ==========================================================================
   SHA-256
   ========================================================================== */

async function createSha256Hash(value) {
    if (
        !window.crypto ||
        !window.crypto.subtle
    ) {
        return NOT_AVAILABLE;
    }

    let data;

    if (typeof value === "string") {
        data =
            new TextEncoder().encode(
                value
            );
    } else if (
        value instanceof ArrayBuffer
    ) {
        data = value;
    } else if (
        ArrayBuffer.isView(value)
    ) {
        data = value.buffer;
    } else {
        data =
            new TextEncoder().encode(
                JSON.stringify(value)
            );
    }

    const digest =
        await window.crypto.subtle.digest(
            "SHA-256",
            data
        );

    return Array.from(
        new Uint8Array(digest)
    )
        .map((byte) => {
            return byte
                .toString(16)
                .padStart(2, "0");
        })
        .join("");
}

/* ==========================================================================
   PRIVACY SETTINGS
   ========================================================================== */

function getPrivacySignals() {
    const doNotTrackValue =
        navigator.doNotTrack ??
        window.doNotTrack ??
        navigator.msDoNotTrack;

    const doNotTrack =
        formatDoNotTrack(
            doNotTrackValue
        );

    let globalPrivacyControl =
        NOT_AVAILABLE;

    if (
        typeof navigator
            .globalPrivacyControl ===
        "boolean"
    ) {
        globalPrivacyControl =
            navigator
                .globalPrivacyControl
                ? "enabled"
                : "not enabled";
    }

    return (
        `DNT: ${doNotTrack} · ` +
        `GPC: ${globalPrivacyControl}`
    );
}

function formatDoNotTrack(value) {
    if (
        value === "1" ||
        value === 1 ||
        value === "yes"
    ) {
        return "enabled";
    }

    if (
        value === "0" ||
        value === 0 ||
        value === "no"
    ) {
        return "not enabled";
    }

    return NOT_AVAILABLE;
}

function getCookiesAndStorage() {
    const cookies =
        navigator.cookieEnabled
            ? "enabled"
            : "disabled";

    const localStorageStatus =
        testStorageAvailability(
            "localStorage"
        )
            ? "available"
            : NOT_AVAILABLE;

    const sessionStorageStatus =
        testStorageAvailability(
            "sessionStorage"
        )
            ? "available"
            : NOT_AVAILABLE;

    const indexedDbStatus =
        "indexedDB" in window
            ? "available"
            : NOT_AVAILABLE;

    return (
        `Cookies: ${cookies} · ` +
        `localStorage: ${localStorageStatus} · ` +
        `sessionStorage: ${sessionStorageStatus} · ` +
        `IndexedDB: ${indexedDbStatus}`
    );
}

function testStorageAvailability(
    storageName
) {
    try {
        const storage =
            window[storageName];

        if (!storage) {
            return false;
        }

        const key =
            "__fingerprint_mirror_test__";

        storage.setItem(key, "1");
        storage.removeItem(key);

        return true;
    } catch (error) {
        return false;
    }
}

/* ==========================================================================
   PUBLIC IP LOOKUP
   ========================================================================== */

async function lookUpPublicIp() {
    const ipButton =
        document.getElementById(
            "fingerprint-ip-lookup"
        );

    if (ipButton) {
        ipButton.disabled = true;
        ipButton.textContent =
            "Looking up...";
    }

    setFingerprintStatus(
        "Requesting public IP and approximate location..."
    );

    setFingerprintValue(
        "publicIp",
        "looking up..."
    );

    setFingerprintValue(
        "approximateLocation",
        "looking up..."
    );

    setFingerprintValue(
        "ispAndAsn",
        "looking up..."
    );

    try {
        const response = await fetch(
            "https://ipapi.co/json/",
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `IP lookup failed: ` +
                `${response.status}`
            );
        }

        const data =
            await response.json();

        if (data.error) {
            throw new Error(
                data.reason ||
                "The IP service returned an error."
            );
        }

        setFingerprintValue(
            "publicIp",
            cleanExternalValue(data.ip)
        );

        setFingerprintValue(
            "approximateLocation",
            formatApproximateLocation(
                data
            )
        );

        setFingerprintValue(
            "ispAndAsn",
            formatIspAndAsn(data)
        );

        setFingerprintStatus(
            "IP lookup complete. Location is approximate."
        );
    } catch (error) {
        console.error(
            "Public IP lookup failed:",
            error
        );

        setFingerprintValue(
            "publicIp",
            "lookup unavailable"
        );

        setFingerprintValue(
            "approximateLocation",
            "lookup unavailable"
        );

        setFingerprintValue(
            "ispAndAsn",
            "lookup unavailable"
        );

        setFingerprintStatus(
            "IP lookup was blocked or unavailable."
        );
    } finally {
        if (ipButton) {
            ipButton.disabled = false;
            ipButton.textContent =
                "Look up my IP";
        }
    }
}

function formatApproximateLocation(
    data
) {
    const parts = [
        cleanExternalValue(
            data.city,
            ""
        ),
        cleanExternalValue(
            data.region,
            ""
        ),
        cleanExternalValue(
            data.country_name ||
                data.country,
            ""
        )
    ].filter(Boolean);

    return parts.length
        ? parts.join(", ")
        : NOT_AVAILABLE;
}

function formatIspAndAsn(data) {
    const isp = cleanExternalValue(
        data.org ||
            data.organization ||
            data.isp,
        ""
    );

    const asn = cleanExternalValue(
        data.asn,
        ""
    );

    if (isp && asn) {
        return `${isp} · ${asn}`;
    }

    return (
        isp ||
        asn ||
        NOT_AVAILABLE
    );
}

function cleanExternalValue(
    value,
    fallback = NOT_AVAILABLE
) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return fallback;
    }

    return (
        String(value).trim() ||
        fallback
    );
}

/* ==========================================================================
   COPY AS JSON
   ========================================================================== */

async function copyFingerprintAsJson() {
    const copyButton =
        document.getElementById(
            "fingerprint-copy"
        );

    const output = {};

    fingerprintItems.forEach(
        (item) => {
            output[item.label] =
                fingerprintState[
                    item.key
                ];
        }
    );

    const json =
        JSON.stringify(
            output,
            null,
            2
        );

    try {
        await copyTextToClipboard(
            json
        );

        setFingerprintStatus(
            "All 20 values were copied as JSON."
        );

        if (copyButton) {
            copyButton.textContent =
                "Copied";

            window.setTimeout(() => {
                copyButton.textContent =
                    "Copy as JSON";
            }, 1200);
        }
    } catch (error) {
        console.error(
            "Unable to copy fingerprint JSON:",
            error
        );

        setFingerprintStatus(
            "The JSON could not be copied automatically."
        );
    }
}

async function copyTextToClipboard(
    text
) {
    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {
        await navigator.clipboard.writeText(
            text
        );
        return;
    }

    const textArea =
        document.createElement(
            "textarea"
        );

    textArea.value = text;

    textArea.setAttribute(
        "readonly",
        ""
    );

    textArea.style.position =
        "fixed";

    textArea.style.left =
        "-9999px";

    textArea.style.opacity =
        "0";

    document.body.appendChild(
        textArea
    );

    textArea.select();

    textArea.setSelectionRange(
        0,
        textArea.value.length
    );

    const copied =
        document.execCommand(
            "copy"
        );

    textArea.remove();

    if (!copied) {
        throw new Error(
            "The browser rejected the copy command."
        );
    }
}

/* ==========================================================================
   DISPLAY HELPERS
   ========================================================================== */

function renderFingerprintState() {
    fingerprintItems.forEach(
        (item) => {
            setFingerprintValue(
                item.key,
                fingerprintState[
                    item.key
                ]
            );
        }
    );
}

function setFingerprintValue(
    key,
    value
) {
    const safeValue =
        value === null ||
        value === undefined ||
        value === ""
            ? NOT_AVAILABLE
            : String(value);

    fingerprintState[key] =
        safeValue;

    const valueElement =
        document.getElementById(
            `fingerprint-${key}`
        );

    if (valueElement) {
        valueElement.textContent =
            safeValue;

        valueElement.title =
            safeValue;
    }
}

function setFingerprintStatus(
    message
) {
    const status =
        document.getElementById(
            "fingerprint-status"
        );

    if (status) {
        status.textContent =
            message;
    }
}