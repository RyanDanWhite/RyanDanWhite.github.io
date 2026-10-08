"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const fields = {
        ip: document.getElementById("subnet-ip"),
        cidr: document.getElementById("subnet-cidr"),
        mask: document.getElementById("subnet-mask"),
        gateway: document.getElementById("subnet-gateway"),
        network: document.getElementById("subnet-network"),
        first: document.getElementById("subnet-first"),
        last: document.getElementById("subnet-last"),
        broadcast: document.getElementById("subnet-broadcast"),
        total: document.getElementById("subnet-total"),
        usable: document.getElementById("subnet-usable"),
        status: document.getElementById("subnet-status")
    };

    const clearButton = document.getElementById("subnet-clear");

    /*
     * Stop cleanly if the Subnet Calculator HTML
     * has not been added to the page yet.
     */
    if (
        !fields.ip ||
        !fields.cidr ||
        !fields.mask ||
        !fields.gateway ||
        !fields.network ||
        !fields.first ||
        !fields.last ||
        !fields.broadcast ||
        !fields.total ||
        !fields.usable
    ) {
        return;
    }

    let isUpdating = false;
    let activeAnchorField = null;

    const anchorFields = [
        fields.ip,
        fields.gateway,
        fields.network,
        fields.first,
        fields.last,
        fields.broadcast
    ];

    const resultFields = [
        fields.network,
        fields.first,
        fields.last,
        fields.broadcast,
        fields.total,
        fields.usable
    ];

    function setStatus(message, type = "") {
        if (!fields.status) {
            return;
        }

        fields.status.textContent = message;
        fields.status.dataset.type = type;
    }

    function clearStatus() {
        setStatus("");
    }

    function isValidIPv4(value) {
        const parts = value.trim().split(".");

        if (parts.length !== 4) {
            return false;
        }

        return parts.every(part => {
            if (!/^\d{1,3}$/.test(part)) {
                return false;
            }

            if (part.length > 1 && part.startsWith("0")) {
                return false;
            }

            const number = Number(part);

            return Number.isInteger(number) &&
                number >= 0 &&
                number <= 255;
        });
    }

    function ipToNumber(ipAddress) {
        const octets = ipAddress
            .trim()
            .split(".")
            .map(Number);

        return (
            octets[0] * 256 ** 3 +
            octets[1] * 256 ** 2 +
            octets[2] * 256 +
            octets[3]
        ) >>> 0;
    }

    function numberToIp(value) {
        const unsignedValue = value >>> 0;

        return [
            Math.floor(unsignedValue / 256 ** 3) % 256,
            Math.floor(unsignedValue / 256 ** 2) % 256,
            Math.floor(unsignedValue / 256) % 256,
            unsignedValue % 256
        ].join(".");
    }

    function prefixToMaskNumber(prefix) {
        if (prefix === 0) {
            return 0;
        }

        return (0xffffffff << (32 - prefix)) >>> 0;
    }

    function prefixToMask(prefix) {
        return numberToIp(prefixToMaskNumber(prefix));
    }

    function maskToPrefix(mask) {
        if (!isValidIPv4(mask)) {
            return null;
        }

        const maskNumber = ipToNumber(mask);
        let foundZero = false;
        let prefix = 0;

        for (let bit = 31; bit >= 0; bit -= 1) {
            const isOne = (
                maskNumber & Math.pow(2, bit)
            ) !== 0;

            if (isOne) {
                if (foundZero) {
                    return null;
                }

                prefix += 1;
            } else {
                foundZero = true;
            }
        }

        return prefix;
    }

    function parseCidr(value) {
        const cleanedValue = value
            .trim()
            .replace("/", "");

        if (!/^\d{1,2}$/.test(cleanedValue)) {
            return null;
        }

        const prefix = Number(cleanedValue);

        if (
            !Number.isInteger(prefix) ||
            prefix < 0 ||
            prefix > 32
        ) {
            return null;
        }

        return prefix;
    }

    function formatInteger(value) {
        return value.toLocaleString("en-US");
    }

    function clearCalculatedResults() {
        isUpdating = true;

        fields.network.value = "";
        fields.first.value = "";
        fields.last.value = "";
        fields.broadcast.value = "";
        fields.total.value = "";
        fields.usable.value = "";

        isUpdating = false;
    }

    function getPrefix() {
        const cidrValue = fields.cidr.value.trim();
        const maskValue = fields.mask.value.trim();

        if (cidrValue !== "") {
            const prefix = parseCidr(cidrValue);

            if (prefix === null) {
                setStatus(
                    "CIDR must be a number from 0 through 32.",
                    "error"
                );

                return null;
            }

            return prefix;
        }

        if (maskValue !== "") {
            const prefix = maskToPrefix(maskValue);

            if (prefix === null) {
                setStatus(
                    "Enter a valid contiguous IPv4 subnet mask.",
                    "error"
                );

                return null;
            }

            return prefix;
        }

        return null;
    }

    function getAnchorAddress() {
        if (
            activeAnchorField &&
            activeAnchorField.value.trim() !== ""
        ) {
            return {
                element: activeAnchorField,
                value: activeAnchorField.value.trim()
            };
        }

        for (const field of anchorFields) {
            const value = field.value.trim();

            if (value !== "") {
                activeAnchorField = field;

                return {
                    element: field,
                    value
                };
            }
        }

        return null;
    }

    function synchronizePrefixFields(prefix, source) {
        isUpdating = true;

        if (source !== fields.cidr) {
            fields.cidr.value = `/${prefix}`;
        }

        if (source !== fields.mask) {
            fields.mask.value = prefixToMask(prefix);
        }

        isUpdating = false;
    }

    function calculateSubnet(source = null) {
        if (isUpdating) {
            return;
        }

        clearStatus();

        const prefix = getPrefix();

        if (prefix === null) {
            clearCalculatedResults();

            if (
                fields.cidr.value.trim() === "" &&
                fields.mask.value.trim() === ""
            ) {
                setStatus(
                    "Enter a CIDR prefix or subnet mask.",
                    "info"
                );
            }

            return;
        }

        synchronizePrefixFields(prefix, source);

        const anchor = getAnchorAddress();

        if (!anchor) {
            clearCalculatedResults();

            setStatus(
                "Enter an IPv4 address, gateway, network, first usable, last usable, or broadcast address.",
                "info"
            );

            return;
        }

        if (!isValidIPv4(anchor.value)) {
            clearCalculatedResults();

            setStatus(
                "Enter a valid IPv4 address.",
                "error"
            );

            return;
        }

        const addressNumber = ipToNumber(anchor.value);
        const maskNumber = prefixToMaskNumber(prefix);
        const inverseMask = (0xffffffff ^ maskNumber) >>> 0;

        const networkNumber = (
            addressNumber & maskNumber
        ) >>> 0;

        const broadcastNumber = (
            networkNumber | inverseMask
        ) >>> 0;

        const totalAddresses = 2 ** (32 - prefix);

        let firstUsableNumber;
        let lastUsableNumber;
        let usableAddresses;

        /*
         * RFC 3021-style /31 behavior:
         * both addresses can be used for point-to-point links.
         */
        if (prefix === 31) {
            firstUsableNumber = networkNumber;
            lastUsableNumber = broadcastNumber;
            usableAddresses = 2;
        } else if (prefix === 32) {
            firstUsableNumber = networkNumber;
            lastUsableNumber = networkNumber;
            usableAddresses = 1;
        } else {
            firstUsableNumber = networkNumber + 1;
            lastUsableNumber = broadcastNumber - 1;
            usableAddresses = Math.max(
                totalAddresses - 2,
                0
            );
        }

        isUpdating = true;

        /*
         * Calculated fields are refreshed, except when that field
         * is being used as the user's current anchor value.
         */
        if (anchor.element !== fields.network) {
            fields.network.value = numberToIp(networkNumber);
        }

        if (anchor.element !== fields.first) {
            fields.first.value = numberToIp(firstUsableNumber);
        }

        if (anchor.element !== fields.last) {
            fields.last.value = numberToIp(lastUsableNumber);
        }

        if (anchor.element !== fields.broadcast) {
            fields.broadcast.value =
                numberToIp(broadcastNumber);
        }

        fields.total.value = formatInteger(totalAddresses);
        fields.usable.value = formatInteger(usableAddresses);

        isUpdating = false;

        validateAnchorRole(
            anchor.element,
            addressNumber,
            networkNumber,
            firstUsableNumber,
            lastUsableNumber,
            broadcastNumber
        );
    }

    function validateAnchorRole(
        anchorElement,
        addressNumber,
        networkNumber,
        firstUsableNumber,
        lastUsableNumber,
        broadcastNumber
    ) {
        if (
            anchorElement === fields.network &&
            addressNumber !== networkNumber
        ) {
            setStatus(
                `The entered network address belongs to ${numberToIp(networkNumber)}.`,
                "warning"
            );

            return;
        }

        if (
            anchorElement === fields.first &&
            addressNumber !== firstUsableNumber
        ) {
            setStatus(
                `The calculated first usable address is ${numberToIp(firstUsableNumber)}.`,
                "warning"
            );

            return;
        }

        if (
            anchorElement === fields.last &&
            addressNumber !== lastUsableNumber
        ) {
            setStatus(
                `The calculated last usable address is ${numberToIp(lastUsableNumber)}.`,
                "warning"
            );

            return;
        }

        if (
            anchorElement === fields.broadcast &&
            addressNumber !== broadcastNumber
        ) {
            setStatus(
                `The calculated broadcast address is ${numberToIp(broadcastNumber)}.`,
                "warning"
            );

            return;
        }

        if (
            anchorElement === fields.gateway &&
            (
                addressNumber < firstUsableNumber ||
                addressNumber > lastUsableNumber
            )
        ) {
            setStatus(
                "The gateway is not within the calculated usable address range.",
                "warning"
            );

            return;
        }

        setStatus(
            "Subnet calculated.",
            "success"
        );
    }

    function handleAnchorInput(event) {
        if (isUpdating) {
            return;
        }

        activeAnchorField = event.currentTarget;

        calculateSubnet(event.currentTarget);
    }

    function handleCidrInput() {
        if (isUpdating) {
            return;
        }

        const value = fields.cidr.value.trim();

        if (value === "") {
            fields.mask.value = "";
            clearCalculatedResults();
            clearStatus();
            return;
        }

        const prefix = parseCidr(value);

        if (prefix === null) {
            fields.mask.value = "";
            clearCalculatedResults();

            setStatus(
                "CIDR must be a number from 0 through 32.",
                "error"
            );

            return;
        }

        synchronizePrefixFields(prefix, fields.cidr);
        calculateSubnet(fields.cidr);
    }

    function handleMaskInput() {
        if (isUpdating) {
            return;
        }

        const value = fields.mask.value.trim();

        if (value === "") {
            fields.cidr.value = "";
            clearCalculatedResults();
            clearStatus();
            return;
        }

        const prefix = maskToPrefix(value);

        if (prefix === null) {
            fields.cidr.value = "";
            clearCalculatedResults();

            setStatus(
                "Enter a valid contiguous IPv4 subnet mask.",
                "error"
            );

            return;
        }

        synchronizePrefixFields(prefix, fields.mask);
        calculateSubnet(fields.mask);
    }

    async function copyText(value, button) {
        if (!value) {
            setStatus(
                "There is no value to copy.",
                "warning"
            );

            return;
        }

        try {
            await navigator.clipboard.writeText(value);

            setStatus(
                `Copied ${value}.`,
                "success"
            );

            if (button) {
                const originalText = button.textContent;

                button.textContent = "Copied";

                window.setTimeout(() => {
                    button.textContent = originalText;
                }, 1200);
            }
        } catch {
            setStatus(
                "The browser could not copy the value.",
                "error"
            );
        }
    }

    function handleCopyButton(event) {
        const button = event.currentTarget;
        const targetId = button.dataset.copyTarget;

        if (!targetId) {
            return;
        }

        const target = document.getElementById(targetId);

        if (!target) {
            return;
        }

        const value = "value" in target
            ? target.value.trim()
            : target.textContent.trim();

        copyText(value, button);
    }

    function clearCalculator() {
        isUpdating = true;

        for (const field of anchorFields) {
            field.value = "";
        }

        fields.cidr.value = "";
        fields.mask.value = "";
        fields.total.value = "";
        fields.usable.value = "";

        isUpdating = false;
        activeAnchorField = null;

        clearStatus();
        fields.ip.focus();
    }

    fields.ip.addEventListener("input", handleAnchorInput);
    fields.gateway.addEventListener("input", handleAnchorInput);
    fields.network.addEventListener("input", handleAnchorInput);
    fields.first.addEventListener("input", handleAnchorInput);
    fields.last.addEventListener("input", handleAnchorInput);
    fields.broadcast.addEventListener(
        "input",
        handleAnchorInput
    );

    fields.cidr.addEventListener("input", handleCidrInput);
    fields.mask.addEventListener("input", handleMaskInput);

    document
        .querySelectorAll("[data-copy-target]")
        .forEach(button => {
            button.addEventListener(
                "click",
                handleCopyButton
            );
        });

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearCalculator
        );
    }

    /*
     * If the HTML contains preset values, attempt an initial
     * calculation when the page loads.
     */
    const hasInitialPrefix =
        fields.cidr.value.trim() !== "" ||
        fields.mask.value.trim() !== "";

    const hasInitialAddress = anchorFields.some(
        field => field.value.trim() !== ""
    );

    if (hasInitialPrefix && hasInitialAddress) {
        calculateSubnet();
    }
});