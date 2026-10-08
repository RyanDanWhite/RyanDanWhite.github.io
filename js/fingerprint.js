"use strict";

(() => {
    const STATUS = Object.freeze({
        PENDING: "Looking up...",
        NOT_EXPOSED: "Not exposed by browser",
        NOT_SUPPORTED: "Not supported by browser",
        LOOKUP_UNAVAILABLE: "Lookup unavailable",
        UNKNOWN: "Unknown"
    });

    const state = {
        deviceType: STATUS.UNKNOWN,

        browser: STATUS.UNKNOWN,
        browserVersion: STATUS.UNKNOWN,
        userAgent: STATUS.UNKNOWN,

        operatingSystem: STATUS.UNKNOWN,
        osVersion: STATUS.NOT_EXPOSED,
        platform: STATUS.UNKNOWN,

        cpuArchitecture: STATUS.NOT_EXPOSED,
        cpuBitness: STATUS.NOT_EXPOSED,
        logicalProcessors: STATUS.NOT_EXPOSED,
        approximateMemory: STATUS.NOT_EXPOSED,
        graphics: STATUS.NOT_EXPOSED,

        screenResolution: STATUS.UNKNOWN,
        availableScreenArea: STATUS.UNKNOWN,

        primaryLanguage: STATUS.UNKNOWN,
        preferredLanguages: STATUS.UNKNOWN,
        locale: STATUS.UNKNOWN,

        timeZone: STATUS.UNKNOWN,
        utcOffset: STATUS.UNKNOWN,

        doNotTrack: STATUS.NOT_EXPOSED,
        globalPrivacyControl: STATUS.NOT_EXPOSED,

        onlineStatus: STATUS.UNKNOWN,
        effectiveConnectionType: STATUS.NOT_EXPOSED,
        estimatedDownlink: STATUS.NOT_EXPOSED,
        estimatedRoundTripTime: STATUS.NOT_EXPOSED,
        dataSaver: STATUS.NOT_EXPOSED,

        publicIp: STATUS.PENDING,
        approximateCity: STATUS.PENDING,
        region: STATUS.PENDING,
        country: STATUS.PENDING,
        isp: STATUS.PENDING,
        asn: STATUS.PENDING,

        scanStatus: "Not started",
        lastUpdated: null
    };

    const subscribers = new Set();

    /* ======================================================================
       PUBLIC API
       ====================================================================== */

    window.FingerprintMirror = {
        data: state,
        status: STATUS,

        getData() {
            return { ...state };
        },

        scan,

        subscribe(callback) {
            if (typeof callback !== "function") {
                throw new TypeError(
                    "FingerprintMirror.subscribe requires a function."
                );
            }

            subscribers.add(callback);

            callback({ ...state });

            return () => {
                subscribers.delete(callback);
            };
        }
    };

    /* ======================================================================
       MAIN SCAN
       ====================================================================== */

    async function scan() {
        setValue("scanStatus", "Scanning browser and device...");

        const browserInformation = safeGet(
            getBrowserInformation,
            {
                browser: STATUS.UNKNOWN,
                browserVersion: STATUS.UNKNOWN
            }
        );

        setValue("browser", browserInformation.browser);
        setValue(
            "browserVersion",
            browserInformation.browserVersion
        );

        setValue(
            "userAgent",
            navigator.userAgent || STATUS.NOT_EXPOSED
        );

        const operatingSystem = safeGet(
            getOperatingSystemInformation,
            {
                operatingSystem: STATUS.UNKNOWN,
                osVersion: STATUS.NOT_EXPOSED,
                platform: STATUS.UNKNOWN
            }
        );

        setValue(
            "operatingSystem",
            operatingSystem.operatingSystem
        );

        setValue(
            "osVersion",
            operatingSystem.osVersion
        );

        setValue(
            "platform",
            operatingSystem.platform
        );

        setValue(
            "deviceType",
            safeGet(getDeviceType)
        );

        setValue(
            "logicalProcessors",
            safeGet(getLogicalProcessors)
        );

        setValue(
            "approximateMemory",
            safeGet(getApproximateMemory)
        );

        setValue(
            "graphics",
            safeGet(getGraphicsInformation)
        );

        const display = safeGet(
            getDisplayInformation,
            {
                screenResolution: STATUS.UNKNOWN,
                availableScreenArea: STATUS.UNKNOWN
            }
        );

        setValue(
            "screenResolution",
            display.screenResolution
        );

        setValue(
            "availableScreenArea",
            display.availableScreenArea
        );

        const locale = safeGet(
            getLocaleInformation,
            {
                primaryLanguage: STATUS.UNKNOWN,
                preferredLanguages: STATUS.UNKNOWN,
                locale: STATUS.UNKNOWN
            }
        );

        setValue(
            "primaryLanguage",
            locale.primaryLanguage
        );

        setValue(
            "preferredLanguages",
            locale.preferredLanguages
        );

        setValue(
            "locale",
            locale.locale
        );

        const time = safeGet(
            getTimeInformation,
            {
                timeZone: STATUS.UNKNOWN,
                utcOffset: STATUS.UNKNOWN
            }
        );

        setValue("timeZone", time.timeZone);
        setValue("utcOffset", time.utcOffset);

        const privacy = safeGet(
            getPrivacyInformation,
            {
                doNotTrack: STATUS.NOT_EXPOSED,
                globalPrivacyControl: STATUS.NOT_EXPOSED
            }
        );

        setValue(
            "doNotTrack",
            privacy.doNotTrack
        );

        setValue(
            "globalPrivacyControl",
            privacy.globalPrivacyControl
        );

        const connection = safeGet(
            getConnectionInformation,
            {
                onlineStatus: STATUS.UNKNOWN,
                effectiveConnectionType:
                    STATUS.NOT_EXPOSED,
                estimatedDownlink:
                    STATUS.NOT_EXPOSED,
                estimatedRoundTripTime:
                    STATUS.NOT_EXPOSED,
                dataSaver:
                    STATUS.NOT_EXPOSED
            }
        );

        setValue(
            "onlineStatus",
            connection.onlineStatus
        );

        setValue(
            "effectiveConnectionType",
            connection.effectiveConnectionType
        );

        setValue(
            "estimatedDownlink",
            connection.estimatedDownlink
        );

        setValue(
            "estimatedRoundTripTime",
            connection.estimatedRoundTripTime
        );

        setValue(
            "dataSaver",
            connection.dataSaver
        );

        setValue(
            "scanStatus",
            "Requesting higher-detail system information..."
        );

        await collectHighEntropyInformation();

        setValue(
            "scanStatus",
            "Looking up public network information..."
        );

        await lookupPublicNetworkInformation();

        setValue(
            "lastUpdated",
            new Date().toISOString()
        );

        setValue(
            "scanStatus",
            "Scan complete"
        );

        return { ...state };
    }

    /* ======================================================================
       BROWSER
       ====================================================================== */

    function getBrowserInformation() {
        const userAgent = navigator.userAgent || "";

        const patterns = [
            {
                browser: "Microsoft Edge",
                expression: /EdgA?\/([\d.]+)/
            },
            {
                browser: "Opera",
                expression: /OPR\/([\d.]+)/
            },
            {
                browser: "Firefox",
                expression: /Firefox\/([\d.]+)/
            },
            {
                browser: "Google Chrome",
                expression: /(?:Chrome|CriOS)\/([\d.]+)/
            },
            {
                browser: "Safari",
                expression: /Version\/([\d.]+).*Safari/
            }
        ];

        for (const item of patterns) {
            const match = userAgent.match(item.expression);

            if (match) {
                return {
                    browser: item.browser,
                    browserVersion: match[1]
                };
            }
        }

        return {
            browser: STATUS.UNKNOWN,
            browserVersion: STATUS.UNKNOWN
        };
    }

    /* ======================================================================
       OPERATING SYSTEM
       ====================================================================== */

    function getOperatingSystemInformation() {
        const userAgent = navigator.userAgent || "";

        const result = {
            operatingSystem: STATUS.UNKNOWN,
            osVersion: STATUS.NOT_EXPOSED,
            platform:
                navigator.userAgentData?.platform ||
                navigator.platform ||
                STATUS.UNKNOWN
        };

        const windowsVersion = getWindowsVersion(userAgent);

        if (windowsVersion) {
            result.operatingSystem = "Windows";
            result.osVersion = windowsVersion;
            return result;
        }

        const android = userAgent.match(
            /Android\s+([\d.]+)/
        );

        if (android) {
            result.operatingSystem = "Android";
            result.osVersion = android[1];
            return result;
        }

        const ios = userAgent.match(
            /(?:iPhone OS|CPU OS)\s+([\d_]+)/
        );

        if (ios) {
            result.operatingSystem = "iOS";
            result.osVersion = ios[1].replaceAll("_", ".");
            return result;
        }

        const macOS = userAgent.match(
            /Mac OS X\s+([\d_]+)/
        );

        if (macOS) {
            result.operatingSystem = "macOS";
            result.osVersion =
                macOS[1].replaceAll("_", ".");
            return result;
        }

        if (/CrOS/i.test(userAgent)) {
            result.operatingSystem = "ChromeOS";
            return result;
        }

        if (/Linux/i.test(userAgent)) {
            result.operatingSystem = "Linux";
            return result;
        }

        return result;
    }

    function getWindowsVersion(userAgent) {
        if (/Windows NT 10\.0/i.test(userAgent)) {
            return "Windows 10 or 11";
        }

        if (/Windows NT 6\.3/i.test(userAgent)) {
            return "Windows 8.1";
        }

        if (/Windows NT 6\.2/i.test(userAgent)) {
            return "Windows 8";
        }

        if (/Windows NT 6\.1/i.test(userAgent)) {
            return "Windows 7";
        }

        return null;
    }

    /* ======================================================================
       USER-AGENT CLIENT HINTS
       ====================================================================== */

    async function collectHighEntropyInformation() {
        const userAgentData = navigator.userAgentData;

        if (!userAgentData) {
            collectArchitectureFallback();
            return;
        }

        if (userAgentData.platform) {
            setValue("platform", userAgentData.platform);

            const currentOs = state.operatingSystem;

            if (
                currentOs === STATUS.UNKNOWN &&
                userAgentData.platform
            ) {
                setValue(
                    "operatingSystem",
                    userAgentData.platform
                );
            }
        }

        if (typeof userAgentData.mobile === "boolean") {
            setValue(
                "deviceType",
                userAgentData.mobile
                    ? "Mobile device"
                    : "Desktop or laptop"
            );
        }

        if (
            typeof userAgentData.getHighEntropyValues !==
            "function"
        ) {
            collectArchitectureFallback();
            return;
        }

        try {
            const hints =
                await userAgentData.getHighEntropyValues([
                    "architecture",
                    "bitness",
                    "model",
                    "platformVersion",
                    "fullVersionList"
                ]);

            if (hints.architecture) {
                setValue(
                    "cpuArchitecture",
                    normalizeArchitecture(
                        hints.architecture
                    )
                );
            }

            if (hints.bitness) {
                setValue(
                    "cpuBitness",
                    `${hints.bitness}-bit`
                );
            }

            if (hints.platformVersion) {
                setValue(
                    "osVersion",
                    interpretPlatformVersion(
                        userAgentData.platform,
                        hints.platformVersion
                    )
                );
            }

            const browser =
                getBrowserFromVersionList(
                    hints.fullVersionList
                );

            if (browser) {
                setValue("browser", browser.browser);
                setValue(
                    "browserVersion",
                    browser.version
                );
            }

            if (
                hints.model &&
                hints.model.trim() !== ""
            ) {
                setValue(
                    "deviceType",
                    `${state.deviceType} (${hints.model})`
                );
            }
        } catch (error) {
            console.warn(
                "High-detail browser information was unavailable:",
                error
            );

            collectArchitectureFallback();
        }
    }

    function getBrowserFromVersionList(versionList) {
        if (!Array.isArray(versionList)) {
            return null;
        }

        const preferredBrands = [
            {
                brand: "Microsoft Edge",
                displayName: "Microsoft Edge"
            },
            {
                brand: "Google Chrome",
                displayName: "Google Chrome"
            },
            {
                brand: "Opera",
                displayName: "Opera"
            },
            {
                brand: "Chromium",
                displayName: "Chromium"
            }
        ];

        for (const preferred of preferredBrands) {
            const match = versionList.find(
                item =>
                    item.brand === preferred.brand
            );

            if (match) {
                return {
                    browser: preferred.displayName,
                    version: match.version
                };
            }
        }

        return null;
    }

    function interpretPlatformVersion(
        platform,
        platformVersion
    ) {
        if (!platformVersion) {
            return STATUS.NOT_EXPOSED;
        }

        if (
            String(platform).toLowerCase() ===
            "windows"
        ) {
            const majorVersion = Number.parseInt(
                platformVersion.split(".")[0],
                10
            );

            if (Number.isFinite(majorVersion)) {
                if (majorVersion >= 13) {
                    return `Windows 11 platform version ${platformVersion}`;
                }

                if (majorVersion > 0) {
                    return `Windows platform version ${platformVersion}`;
                }
            }
        }

        return platformVersion;
    }

    function collectArchitectureFallback() {
        const userAgent = navigator.userAgent || "";
        const platform = navigator.platform || "";

        const combined = `${userAgent} ${platform}`;

        if (/arm64|aarch64/i.test(combined)) {
            setValue("cpuArchitecture", "ARM64");
            setValue("cpuBitness", "64-bit");
            return;
        }

        if (/arm/i.test(combined)) {
            setValue("cpuArchitecture", "ARM");
            return;
        }

        if (/win64|x64|x86_64|amd64/i.test(combined)) {
            setValue("cpuArchitecture", "x86-64");
            setValue("cpuBitness", "64-bit");
            return;
        }

        if (/i[3-6]86|x86/i.test(combined)) {
            setValue("cpuArchitecture", "x86");
            setValue("cpuBitness", "32-bit");
        }
    }

    function normalizeArchitecture(value) {
        const architecture =
            String(value).toLowerCase();

        if (
            architecture === "x86" ||
            architecture === "x86_64"
        ) {
            return "x86";
        }

        if (
            architecture === "arm" ||
            architecture === "arm64"
        ) {
            return architecture.toUpperCase();
        }

        return value;
    }

    /* ======================================================================
       DEVICE AND HARDWARE
       ====================================================================== */

    function getDeviceType() {
        const userAgent = navigator.userAgent || "";

        if (
            /iPad|Tablet|PlayBook|Silk/i.test(userAgent)
        ) {
            return "Tablet";
        }

        if (
            /Mobi|Android|iPhone|iPod/i.test(userAgent)
        ) {
            return "Mobile device";
        }

        if (navigator.maxTouchPoints > 1) {
            if (/MacIntel/i.test(navigator.platform)) {
                return "Tablet";
            }
        }

        return "Desktop or laptop";
    }

    function getLogicalProcessors() {
        const processors =
            navigator.hardwareConcurrency;

        if (!Number.isFinite(processors)) {
            return STATUS.NOT_EXPOSED;
        }

        return String(processors);
    }

    function getApproximateMemory() {
        const memory = navigator.deviceMemory;

        if (!Number.isFinite(memory)) {
            return STATUS.NOT_EXPOSED;
        }

        return `Approximately ${memory} GB`;
    }

    function getGraphicsInformation() {
        const canvas = document.createElement("canvas");

        const gl =
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");

        if (!gl) {
            return STATUS.NOT_SUPPORTED;
        }

        const extension = gl.getExtension(
            "WEBGL_debug_renderer_info"
        );

        if (extension) {
            const vendor = gl.getParameter(
                extension.UNMASKED_VENDOR_WEBGL
            );

            const renderer = gl.getParameter(
                extension.UNMASKED_RENDERER_WEBGL
            );

            const details = [
                cleanGraphicsValue(vendor),
                cleanGraphicsValue(renderer)
            ].filter(Boolean);

            if (details.length > 0) {
                return [...new Set(details)].join(" · ");
            }
        }

        const genericVendor = cleanGraphicsValue(
            gl.getParameter(gl.VENDOR)
        );

        const genericRenderer = cleanGraphicsValue(
            gl.getParameter(gl.RENDERER)
        );

        const genericDetails = [
            genericVendor,
            genericRenderer
        ].filter(Boolean);

        return genericDetails.length > 0
            ? [...new Set(genericDetails)].join(" · ")
            : STATUS.NOT_EXPOSED;
    }

    function cleanGraphicsValue(value) {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return null;
        }

        return String(value).trim();
    }

    /* ======================================================================
       DISPLAY
       ====================================================================== */

    function getDisplayInformation() {
        if (!window.screen) {
            return {
                screenResolution: STATUS.NOT_EXPOSED,
                availableScreenArea: STATUS.NOT_EXPOSED
            };
        }

        return {
            screenResolution:
                `${screen.width} × ${screen.height}`,

            availableScreenArea:
                `${screen.availWidth} × ${screen.availHeight}`
        };
    }

    /* ======================================================================
       LANGUAGE AND LOCALE
       ====================================================================== */

    function getLocaleInformation() {
        const resolved =
            Intl.DateTimeFormat().resolvedOptions();

        return {
            primaryLanguage:
                navigator.language ||
                STATUS.NOT_EXPOSED,

            preferredLanguages:
                navigator.languages?.length
                    ? navigator.languages.join(", ")
                    : navigator.language ||
                      STATUS.NOT_EXPOSED,

            locale:
                resolved.locale ||
                navigator.language ||
                STATUS.NOT_EXPOSED
        };
    }

    /* ======================================================================
       TIME
       ====================================================================== */

    function getTimeInformation() {
        const resolved =
            Intl.DateTimeFormat().resolvedOptions();

        const timeZone =
            resolved.timeZone ||
            STATUS.NOT_EXPOSED;

        const offsetMinutes =
            -new Date().getTimezoneOffset();

        const sign =
            offsetMinutes >= 0 ? "+" : "-";

        const absoluteMinutes =
            Math.abs(offsetMinutes);

        const hours = String(
            Math.floor(absoluteMinutes / 60)
        ).padStart(2, "0");

        const minutes = String(
            absoluteMinutes % 60
        ).padStart(2, "0");

        return {
            timeZone,
            utcOffset:
                `UTC${sign}${hours}:${minutes}`
        };
    }

    /* ======================================================================
       PRIVACY SIGNALS
       ====================================================================== */

    function getPrivacyInformation() {
        const dntValue =
            navigator.doNotTrack ??
            window.doNotTrack ??
            navigator.msDoNotTrack;

        let doNotTrack = STATUS.NOT_EXPOSED;

        if (dntValue === "1" || dntValue === 1) {
            doNotTrack = "Enabled";
        } else if (
            dntValue === "0" ||
            dntValue === 0
        ) {
            doNotTrack = "Not enabled";
        } else if (dntValue === "unspecified") {
            doNotTrack = "Unspecified";
        }

        const gpcValue =
            navigator.globalPrivacyControl;

        const globalPrivacyControl =
            typeof gpcValue === "boolean"
                ? gpcValue
                    ? "Enabled"
                    : "Not enabled"
                : STATUS.NOT_EXPOSED;

        return {
            doNotTrack,
            globalPrivacyControl
        };
    }

    /* ======================================================================
       NETWORK INFORMATION FROM THE BROWSER
       ====================================================================== */

    function getConnectionInformation() {
        const connection =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        const result = {
            onlineStatus:
                navigator.onLine
                    ? "Online"
                    : "Offline",

            effectiveConnectionType:
                STATUS.NOT_EXPOSED,

            estimatedDownlink:
                STATUS.NOT_EXPOSED,

            estimatedRoundTripTime:
                STATUS.NOT_EXPOSED,

            dataSaver:
                STATUS.NOT_EXPOSED
        };

        if (!connection) {
            return result;
        }

        if (connection.effectiveType) {
            result.effectiveConnectionType =
                connection.effectiveType;
        }

        if (Number.isFinite(connection.downlink)) {
            result.estimatedDownlink =
                `${connection.downlink} Mbps`;
        }

        if (Number.isFinite(connection.rtt)) {
            result.estimatedRoundTripTime =
                `${connection.rtt} ms`;
        }

        if (
            typeof connection.saveData === "boolean"
        ) {
            result.dataSaver =
                connection.saveData
                    ? "Enabled"
                    : "Not enabled";
        }

        return result;
    }

    /* ======================================================================
       EXTERNAL IP AND LOCATION LOOKUP
       ====================================================================== */

    async function lookupPublicNetworkInformation() {
        setValue("publicIp", STATUS.PENDING);
        setValue("approximateCity", STATUS.PENDING);
        setValue("region", STATUS.PENDING);
        setValue("country", STATUS.PENDING);
        setValue("isp", STATUS.PENDING);
        setValue("asn", STATUS.PENDING);

        try {
            const response = await fetch(
                "https://ipapi.co/json/",
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    `IP lookup returned HTTP ${response.status}.`
                );
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(
                    data.reason ||
                    "The IP service returned an error."
                );
            }

            setValue(
                "publicIp",
                readLookupValue(data.ip)
            );

            setValue(
                "approximateCity",
                readLookupValue(data.city)
            );

            setValue(
                "region",
                readLookupValue(
                    data.region ||
                    data.region_code
                )
            );

            setValue(
                "country",
                readLookupValue(
                    data.country_name ||
                    data.country
                )
            );

            setValue(
                "isp",
                readLookupValue(
                    data.org ||
                    data.network
                )
            );

            setValue(
                "asn",
                readLookupValue(data.asn)
            );
        } catch (error) {
            console.error(
                "Public network lookup failed:",
                error
            );

            setValue(
                "publicIp",
                STATUS.LOOKUP_UNAVAILABLE
            );

            setValue(
                "approximateCity",
                STATUS.LOOKUP_UNAVAILABLE
            );

            setValue(
                "region",
                STATUS.LOOKUP_UNAVAILABLE
            );

            setValue(
                "country",
                STATUS.LOOKUP_UNAVAILABLE
            );

            setValue(
                "isp",
                STATUS.LOOKUP_UNAVAILABLE
            );

            setValue(
                "asn",
                STATUS.LOOKUP_UNAVAILABLE
            );
        }
    }

    function readLookupValue(value) {
        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return STATUS.NOT_EXPOSED;
        }

        return String(value).trim();
    }

    /* ======================================================================
       STATE AND EVENT HELPERS
       ====================================================================== */

    function safeGet(operation, fallback = STATUS.NOT_EXPOSED) {
        try {
            const result = operation();

            if (
                result === undefined ||
                result === null ||
                result === ""
            ) {
                return fallback;
            }

            return result;
        } catch (error) {
            console.warn(
                "Browser information check failed:",
                error
            );

            return fallback;
        }
    }

    function setValue(key, value) {
        const safeValue =
            value === undefined ||
            value === null ||
            value === ""
                ? STATUS.NOT_EXPOSED
                : value;

        state[key] = safeValue;

        updateExistingElement(key, safeValue);
        notifySubscribers(key, safeValue);
    }

    function updateExistingElement(key, value) {
        const element = document.getElementById(
            `fingerprint-${key}`
        );

        if (!element) {
            return;
        }

        element.textContent = String(value);
        element.title = String(value);
    }

    function notifySubscribers(key, value) {
        const snapshot = { ...state };

        for (const callback of subscribers) {
            try {
                callback(snapshot, key, value);
            } catch (error) {
                console.error(
                    "Fingerprint subscriber failed:",
                    error
                );
            }
        }

        document.dispatchEvent(
            new CustomEvent("fingerprint:updated", {
                detail: {
                    key,
                    value,
                    data: snapshot
                }
            })
        );
    }

    /* ======================================================================
       LIVE NETWORK STATUS
       ====================================================================== */

    window.addEventListener("online", () => {
        setValue("onlineStatus", "Online");
    });

    window.addEventListener("offline", () => {
        setValue("onlineStatus", "Offline");
    });

    const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

    connection?.addEventListener?.("change", () => {
        const result =
            safeGet(getConnectionInformation);

        if (typeof result !== "object") {
            return;
        }

        setValue(
            "onlineStatus",
            result.onlineStatus
        );

        setValue(
            "effectiveConnectionType",
            result.effectiveConnectionType
        );

        setValue(
            "estimatedDownlink",
            result.estimatedDownlink
        );

        setValue(
            "estimatedRoundTripTime",
            result.estimatedRoundTripTime
        );

        setValue(
            "dataSaver",
            result.dataSaver
        );
    });

    /* ======================================================================
       AUTOMATIC START
       ====================================================================== */

    function initialize() {
        scan().catch(error => {
            console.error(
                "Fingerprint scan failed:",
                error
            );

            setValue(
                "scanStatus",
                "Scan encountered an unexpected error"
            );
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();