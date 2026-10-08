"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("unit-category");
    const valueAInput = document.getElementById("unit-value-a");
    const valueBInput = document.getElementById("unit-value-b");
    const unitASelect = document.getElementById("unit-a");
    const unitBSelect = document.getElementById("unit-b");

    // Stop cleanly if the Unit Converter HTML has not been added yet.
    if (
        !categorySelect ||
        !valueAInput ||
        !valueBInput ||
        !unitASelect ||
        !unitBSelect
    ) {
        return;
    }

    const categories = {
        data: {
            label: "Data",
            units: {
                B: {
                    label: "Bytes (B)",
                    toBase: value => value,
                    fromBase: value => value
                },
                KB: {
                    label: "Kilobytes (KB)",
                    toBase: value => value * 1000,
                    fromBase: value => value / 1000
                },
                MB: {
                    label: "Megabytes (MB)",
                    toBase: value => value * 1000 ** 2,
                    fromBase: value => value / 1000 ** 2
                },
                GB: {
                    label: "Gigabytes (GB)",
                    toBase: value => value * 1000 ** 3,
                    fromBase: value => value / 1000 ** 3
                },
                TB: {
                    label: "Terabytes (TB)",
                    toBase: value => value * 1000 ** 4,
                    fromBase: value => value / 1000 ** 4
                },
                KiB: {
                    label: "Kibibytes (KiB)",
                    toBase: value => value * 1024,
                    fromBase: value => value / 1024
                },
                MiB: {
                    label: "Mebibytes (MiB)",
                    toBase: value => value * 1024 ** 2,
                    fromBase: value => value / 1024 ** 2
                },
                GiB: {
                    label: "Gibibytes (GiB)",
                    toBase: value => value * 1024 ** 3,
                    fromBase: value => value / 1024 ** 3
                },
                TiB: {
                    label: "Tebibytes (TiB)",
                    toBase: value => value * 1024 ** 4,
                    fromBase: value => value / 1024 ** 4
                }
            }
        },

        temperature: {
            label: "Temperature",
            units: {
                C: {
                    label: "Celsius (°C)",
                    toBase: value => value,
                    fromBase: value => value
                },
                F: {
                    label: "Fahrenheit (°F)",
                    toBase: value => (value - 32) * 5 / 9,
                    fromBase: value => value * 9 / 5 + 32
                },
                K: {
                    label: "Kelvin (K)",
                    toBase: value => value - 273.15,
                    fromBase: value => value + 273.15
                }
            }
        },

        length: {
            label: "Length",
            units: {
                mm: {
                    label: "Millimeters (mm)",
                    toBase: value => value / 1000,
                    fromBase: value => value * 1000
                },
                cm: {
                    label: "Centimeters (cm)",
                    toBase: value => value / 100,
                    fromBase: value => value * 100
                },
                m: {
                    label: "Meters (m)",
                    toBase: value => value,
                    fromBase: value => value
                },
                km: {
                    label: "Kilometers (km)",
                    toBase: value => value * 1000,
                    fromBase: value => value / 1000
                },
                in: {
                    label: "Inches (in)",
                    toBase: value => value * 0.0254,
                    fromBase: value => value / 0.0254
                },
                ft: {
                    label: "Feet (ft)",
                    toBase: value => value * 0.3048,
                    fromBase: value => value / 0.3048
                },
                yd: {
                    label: "Yards (yd)",
                    toBase: value => value * 0.9144,
                    fromBase: value => value / 0.9144
                },
                mi: {
                    label: "Miles (mi)",
                    toBase: value => value * 1609.344,
                    fromBase: value => value / 1609.344
                }
            }
        },

        weight: {
            label: "Weight",
            units: {
                g: {
                    label: "Grams (g)",
                    toBase: value => value,
                    fromBase: value => value
                },
                kg: {
                    label: "Kilograms (kg)",
                    toBase: value => value * 1000,
                    fromBase: value => value / 1000
                },
                oz: {
                    label: "Ounces (oz)",
                    toBase: value => value * 28.349523125,
                    fromBase: value => value / 28.349523125
                },
                lb: {
                    label: "Pounds (lb)",
                    toBase: value => value * 453.59237,
                    fromBase: value => value / 453.59237
                }
            }
        },

        volume: {
            label: "Volume",
            units: {
                mL: {
                    label: "Milliliters (mL)",
                    toBase: value => value,
                    fromBase: value => value
                },
                L: {
                    label: "Liters (L)",
                    toBase: value => value * 1000,
                    fromBase: value => value / 1000
                },
                floz: {
                    label: "Fluid Ounces (US)",
                    toBase: value => value * 29.5735295625,
                    fromBase: value => value / 29.5735295625
                },
                cup: {
                    label: "Cups (US)",
                    toBase: value => value * 236.5882365,
                    fromBase: value => value / 236.5882365
                },
                pint: {
                    label: "Pints (US)",
                    toBase: value => value * 473.176473,
                    fromBase: value => value / 473.176473
                },
                quart: {
                    label: "Quarts (US)",
                    toBase: value => value * 946.352946,
                    fromBase: value => value / 946.352946
                },
                gallon: {
                    label: "Gallons (US)",
                    toBase: value => value * 3785.411784,
                    fromBase: value => value / 3785.411784
                }
            }
        },

        speed: {
            label: "Speed",
            units: {
                mps: {
                    label: "Meters/second (m/s)",
                    toBase: value => value,
                    fromBase: value => value
                },
                kph: {
                    label: "Kilometers/hour (km/h)",
                    toBase: value => value / 3.6,
                    fromBase: value => value * 3.6
                },
                mph: {
                    label: "Miles/hour (mph)",
                    toBase: value => value * 0.44704,
                    fromBase: value => value / 0.44704
                }
            }
        }
    };

    function populateCategories() {
        categorySelect.innerHTML = "";

        for (const [key, category] of Object.entries(categories)) {
            const option = document.createElement("option");

            option.value = key;
            option.textContent = category.label;

            categorySelect.appendChild(option);
        }
    }

    function populateUnits() {
        const category = categories[categorySelect.value];

        if (!category) {
            return;
        }

        unitASelect.innerHTML = "";
        unitBSelect.innerHTML = "";

        for (const [key, unit] of Object.entries(category.units)) {
            const optionA = document.createElement("option");
            const optionB = document.createElement("option");

            optionA.value = key;
            optionA.textContent = unit.label;

            optionB.value = key;
            optionB.textContent = unit.label;

            unitASelect.appendChild(optionA);
            unitBSelect.appendChild(optionB);
        }

        // Default the right-hand side to the second available unit.
        if (unitBSelect.options.length > 1) {
            unitBSelect.selectedIndex = 1;
        }
    }

    function formatResult(value) {
        if (!Number.isFinite(value)) {
            return "";
        }

        if (Object.is(value, -0)) {
            return "0";
        }

        const absoluteValue = Math.abs(value);

        // Scientific notation keeps extremely large/small results readable.
        if (
            absoluteValue !== 0 &&
            (absoluteValue >= 1e12 || absoluteValue < 1e-8)
        ) {
            return value.toExponential(8);
        }

        return Number.parseFloat(value.toFixed(10)).toString();
    }

    function convert(value, fromUnitKey, toUnitKey) {
        const category = categories[categorySelect.value];

        if (!category) {
            return null;
        }

        const fromUnit = category.units[fromUnitKey];
        const toUnit = category.units[toUnitKey];

        if (!fromUnit || !toUnit) {
            return null;
        }

        const baseValue = fromUnit.toBase(value);
        return toUnit.fromBase(baseValue);
    }

    function convertAToB() {
        const rawValue = valueAInput.value.trim();

        if (rawValue === "") {
            valueBInput.value = "";
            return;
        }

        const value = Number(rawValue);

        if (!Number.isFinite(value)) {
            valueBInput.value = "";
            return;
        }

        const result = convert(
            value,
            unitASelect.value,
            unitBSelect.value
        );

        if (result === null) {
            valueBInput.value = "";
            return;
        }

        valueBInput.value = formatResult(result);
    }

    function convertBToA() {
        const rawValue = valueBInput.value.trim();

        if (rawValue === "") {
            valueAInput.value = "";
            return;
        }

        const value = Number(rawValue);

        if (!Number.isFinite(value)) {
            valueAInput.value = "";
            return;
        }

        const result = convert(
            value,
            unitBSelect.value,
            unitASelect.value
        );

        if (result === null) {
            valueAInput.value = "";
            return;
        }

        valueAInput.value = formatResult(result);
    }

    categorySelect.addEventListener("change", () => {
        populateUnits();

        valueAInput.value = "";
        valueBInput.value = "";
    });

    valueAInput.addEventListener("input", convertAToB);
    valueBInput.addEventListener("input", convertBToA);

    unitASelect.addEventListener("change", () => {
        if (valueAInput.value.trim() !== "") {
            convertAToB();
        } else if (valueBInput.value.trim() !== "") {
            convertBToA();
        }
    });

    unitBSelect.addEventListener("change", () => {
        if (valueAInput.value.trim() !== "") {
            convertAToB();
        } else if (valueBInput.value.trim() !== "") {
            convertBToA();
        }
    });

    populateCategories();

    // Start with Data since that is likely to be useful on this site.
    categorySelect.value = "data";

    populateUnits();
});