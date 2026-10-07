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