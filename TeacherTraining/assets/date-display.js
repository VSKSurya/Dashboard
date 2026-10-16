// /* Presentation only: ISO values are retained for sorting, validation and persistence. */
// (function(root) {
//     'use strict';
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//     function format(value) {
//         return String(value || '').replace(/\b(\d{4})-(\d{2})-(\d{2})(?=\b|T\d{2}:)/g, (raw, y, m, d) => {
//             let date = new Date(Date.UTC(+y, +m - 1, +d));
//             return date.getUTCFullYear() === +y && date.getUTCMonth() === +m - 1 && date.getUTCDate() === +d ? d + '-' + months[+m - 1] + '-' + y : raw
//         })
//     }
//     if (typeof module !== 'undefined') module.exports = {
//         format
//     };
//     if (!root.document) return;
//     const doc = root.document;

//     function updateInput(input) {
//         let wrapper = input.closest('.date-display-control');
//         if (!wrapper) {
//             wrapper = doc.createElement('span');
//             wrapper.className = 'date-display-control';
//             input.parentNode.insertBefore(wrapper, input);
//             wrapper.appendChild(input);
//             let label = doc.createElement('span');
//             label.className = 'date-display-value';
//             label.setAttribute('aria-hidden', 'true');
//             wrapper.appendChild(label);
//             input.addEventListener('input', () => updateInput(input));
//             input.addEventListener('change', () => updateInput(input));
//         }
//         let display = wrapper.querySelector('.date-display-value'),
//             text = input.value ? format(input.value) : 'dd-MMM-yyyy';
//         if (display.textContent !== text) display.textContent = text;
//         input.title = input.value ? format(input.value) : 'Select date (dd-MMM-yyyy)';
//     }

//     function refresh() {
//         doc.querySelectorAll('input[type="date"]').forEach(updateInput);
//         let walker = doc.createTreeWalker(doc.body, root.NodeFilter.SHOW_TEXT);
//         let node;
//         while ((node = walker.nextNode())) {
//             if (node.parentElement?.closest('script,style,input,textarea,[contenteditable],.date-display-value')) continue;
//             let formatted = format(node.nodeValue);
//             if (formatted !== node.nodeValue) node.nodeValue = formatted;
//         }
//     }
//     let queued = false;

//     function schedule() {
//         if (queued) return;
//         queued = true;
//         queueMicrotask(() => {
//             queued = false;
//             refresh()
//         })
//     }
//     new MutationObserver(schedule).observe(doc.body, {
//         childList: true,
//         subtree: true,
//         characterData: true,
//         attributes: true,
//         attributeFilter: ['value']
//     });
//     doc.addEventListener('reset', () => setTimeout(refresh, 0));
//     refresh();
//     root.TrainingDates = {
//         format,
//         refresh
//     };
// })(typeof window === 'undefined' ? globalThis : window);



/*
 * Teacher Training POC - Date Format
 * Display Format : dd-MMM-yyyy (11-Oct-2026)
 * Internal Format: yyyy-MM-dd (2026-10-11)
 *
 * ISO values are retained for validation,
 * sorting, API calls and persistence.
 */

(function (root) {
    'use strict';

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Convert ISO date to dd-MMM-yyyy.
    function format(value) {
        return String(value ?? '').replace(
            /\b(\d{4})-(\d{2})-(\d{2})(?=\b|T\d{2}:)/g,
            function (raw, y, m, d) {
                const date = new Date(
                    Date.UTC(+y, +m - 1, +d)
                );

                if (
                    date.getUTCFullYear() !== +y ||
                    date.getUTCMonth() !== +m - 1 ||
                    date.getUTCDate() !== +d
                ) {
                    return raw;
                }

                return (
                    d + '-' +
                    months[+m - 1] + '-' +
                    y
                );
            }
        );
    }

    // Convert dd-MMM-yyyy back to ISO format.
    function toISO(value) {
        const text = String(value ?? '').trim();

        const match = text.match(
            /^(\d{2})-([A-Za-z]{3})-(\d{4})$/
        );

        if (!match) {
            return text;
        }

        const day = +match[1];
        const month = months.findIndex(
            m => m.toLowerCase() ===
                match[2].toLowerCase()
        );

        if (month === -1) {
            return text;
        }

        const year = +match[3];
        const iso = (
            year.toString().padStart(4, '0') +
            '-' +
            String(month + 1).padStart(2, '0') +
            '-' +
            String(day).padStart(2, '0')
        );

        // Reject invalid calendar dates.
        return format(iso) ===
            (
                String(day).padStart(2, '0') +
                '-' + months[month] + '-' +
                String(year).padStart(4, '0')
            )
            ? iso
            : text;
    }

    if (typeof module !== 'undefined' &&
        module.exports) {
        module.exports = {
            format,
            toISO
        };
    }

    if (!root.document) {
        return;
    }

    const doc = root.document;

    // Update the visible date representation.
    function updateInput(input) {
        if (!input || !input.isConnected) {
            return;
        }

        let wrapper = input.closest(
            '.date-display-control'
        );

        if (!wrapper) {
            wrapper = doc.createElement('span');
            wrapper.className = 'date-display-control';

            input.parentNode.insertBefore(
                wrapper, input
            );

            wrapper.appendChild(input);

            const label = doc.createElement('span');
            label.className = 'date-display-value';
            label.setAttribute(
                'aria-hidden', 'true'
            );

            wrapper.appendChild(label);

            input.addEventListener(
                'input',
                () => updateInput(input)
            );

            input.addEventListener(
                'change',
                () => updateInput(input)
            );
        }

        const display = wrapper.querySelector(
            '.date-display-value'
        );

        const formatted = input.value
            ? format(input.value)
            : 'dd-MMM-YYYY';

        if (
            display &&
            display.textContent !== formatted
        ) {
            display.textContent = formatted;
        }

        const title = input.value
            ? formatted
            : 'Select date (dd-MMM-YYYY)';

        if (input.title !== title) {
            input.title = title;
        }
    }

    // Refresh dates displayed as ordinary page text.
    function refreshTextDates() {
        if (!doc.body) {
            return;
        }

        const walker = doc.createTreeWalker(
            doc.body,
            root.NodeFilter.SHOW_TEXT
        );

        let node;

        while ((node = walker.nextNode())) {
            const parent = node.parentElement;

            if (!parent) {
                continue;
            }

            if (parent.closest(
                'script, style, textarea, ' +
                'select, option, [contenteditable], ' +
                '.date-display-value'
            )) {
                continue;
            }

            const original = node.nodeValue;
            const formatted = format(original);

            if (original !== formatted) {
                node.nodeValue = formatted;
            }
        }
    }

    function refresh() {
        if (!doc.body) {
            return;
        }

        doc.querySelectorAll(
            'input[type="date"]'
        ).forEach(updateInput);

        refreshTextDates();
    }

    let queued = false;

    function schedule() {
        if (queued) {
            return;
        }

        queued = true;

        queueMicrotask(function () {
            queued = false;
            refresh();
        });
    }

    // Handle dynamically generated form elements.
    function initialize() {
        refresh();

        const observer = new MutationObserver(
            schedule
        );

        observer.observe(doc.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['value']
        });

        doc.addEventListener(
            'reset',
            () => setTimeout(refresh, 0)
        );
    }

    root.TrainingDates = {
        format,
        toISO,
        refresh
    };

    if (doc.readyState === 'loading') {
        doc.addEventListener(
            'DOMContentLoaded',
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})(
    typeof window === 'undefined'
        ? globalThis
        : window
);
