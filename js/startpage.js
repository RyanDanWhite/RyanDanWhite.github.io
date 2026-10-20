"use strict";

/* ==========================================================================
   START PAGE
   File: js/startpage.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================================
       CLOCK
       ====================================================================== */

    const clock = document.getElementById("clock");

    function updateClock() {
        if (!clock) {
            return;
        }

        const now = new Date();

        clock.textContent = now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    updateClock();
    setInterval(updateClock, 1000);


    /* ======================================================================
       COPY ISO DATE / DATE-TIME
       Uses local time with the UTC offset (e.g. 2026-10-20T10:03:00-04:00)
       rather than toISOString(), which converts to UTC.
       ====================================================================== */

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function localIsoDate(date) {
        return date.getFullYear() + "-" +
            pad(date.getMonth() + 1) + "-" +
            pad(date.getDate());
    }

    function localIsoDateTime(date) {
        const offsetMinutes = -date.getTimezoneOffset();
        const sign = offsetMinutes >= 0 ? "+" : "-";
        const absolute = Math.abs(offsetMinutes);

        return localIsoDate(date) + "T" +
            pad(date.getHours()) + ":" +
            pad(date.getMinutes()) + ":" +
            pad(date.getSeconds()) +
            sign + pad(Math.floor(absolute / 60)) + ":" + pad(absolute % 60);
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            const helper = document.createElement("textarea");
            helper.value = text;
            document.body.appendChild(helper);
            helper.select();
            document.execCommand("copy");
            helper.remove();
        }
    }

    function flashButton(button) {
        if (!button.dataset.label) {
            button.dataset.label = button.textContent.trim();
        }

        button.textContent = "Copied";

        clearTimeout(button.flashTimer);
        button.flashTimer = setTimeout(function () {
            button.textContent = button.dataset.label;
        }, 1000);
    }

    [
        ["clock-copy-date", localIsoDate],
        ["clock-copy-datetime", localIsoDateTime]
    ].forEach(function ([id, format]) {
        const button = document.getElementById(id);

        if (!button) {
            return;
        }

        button.addEventListener("click", async function () {
            await copyText(format(new Date()));
            flashButton(button);
        });
    });


    /* ======================================================================
       SCRATCHPAD
       ====================================================================== */

    const scratchpad = document.getElementById("scratchpad");
    const copyButton = document.getElementById("scratchpad-copy");

    if (scratchpad) {
        const savedText = localStorage.getItem("startpage-scratchpad");

        if (savedText !== null) {
            scratchpad.value = savedText;
        }

        scratchpad.addEventListener("input", function () {
            localStorage.setItem(
                "startpage-scratchpad",
                scratchpad.value
            );
        });
    }


    /* ======================================================================
       COPY SCRATCHPAD
       ====================================================================== */

    if (scratchpad && copyButton) {
        copyButton.addEventListener("click", async function () {
            try {
                await navigator.clipboard.writeText(scratchpad.value);

                copyButton.textContent = "Copied";

                setTimeout(function () {
                    copyButton.textContent = "Copy";
                }, 1000);
            } catch (error) {
                scratchpad.select();
                document.execCommand("copy");

                copyButton.textContent = "Copied";

                setTimeout(function () {
                    copyButton.textContent = "Copy";
                }, 1000);
            }
        });
    }


    /* ======================================================================
       FLYOUT ACCESSIBILITY STATE
       ====================================================================== */

    const linkGroups = document.querySelectorAll(".link-group");

    linkGroups.forEach(function (group) {
        const button = group.querySelector(".link-group-button");

        if (!button) {
            return;
        }

        group.addEventListener("mouseenter", function () {
            button.setAttribute("aria-expanded", "true");
        });

        group.addEventListener("mouseleave", function () {
            button.setAttribute("aria-expanded", "false");
        });

        group.addEventListener("focusin", function () {
            button.setAttribute("aria-expanded", "true");
        });

        group.addEventListener("focusout", function (event) {
            if (!group.contains(event.relatedTarget)) {
                button.setAttribute("aria-expanded", "false");
            }
        });
    });

});