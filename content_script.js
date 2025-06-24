// Content script for Selector Verifier extension
// This script runs on all web pages and provides communication between the extension and the page

(function() {
    'use strict';

    // Namespace for our extension to avoid conflicts
    const SELECTOR_VERIFIER = {
        highlightClass: 'selector-verifier-highlight',
        labelClass: 'selector-verifier-label'
    };

    // Listen for messages from the extension
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            switch (request.action) {
                case 'testSelector':
                    sendResponse(testSelector(request.selector));
                    break;

                case 'highlightElements':
                    sendResponse(highlightElements(request.selector));
                    break;

                case 'clearHighlights':
                    sendResponse(clearHighlights());
                    break;

                case 'getPageInfo':
                    sendResponse(getPageInfo());
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }

        return true; // Will respond asynchronously
    });

    function testSelector(selector) {
        try {
            const elements = document.querySelectorAll(selector);
            const elementInfo = Array.from(elements).map((el, index) => {
                const rect = el.getBoundingClientRect();
                return {
                    index: index,
                    tagName: el.tagName.toLowerCase(),
                    id: el.id || '',
                    className: el.className || '',
                    textContent: el.textContent ? el.textContent.trim().substring(0, 100) : '',
                    attributes: getElementAttributes(el),
                    position: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    },
                    visible: isElementVisible(el)
                };
            });

            return {
                success: true,
                count: elements.length,
                elements: elementInfo,
                selector: selector
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                selector: selector
            };
        }
    }

    function highlightElements(selector) {
        try {
            // Clear previous highlights first
            clearHighlights();

            const elements = document.querySelectorAll(selector);
            let highlightedCount = 0;

            elements.forEach((el, index) => {
                if (isElementVisible(el)) {
                    // Add highlight styles
                    el.classList.add(SELECTOR_VERIFIER.highlightClass);
                    el.style.setProperty('outline', '3px solid #ff6b6b', 'important');
                    el.style.setProperty('background-color', 'rgba(255, 107, 107, 0.1)', 'important');

                    // Create and add index label
                    const label = createIndexLabel(index + 1);
                    el.appendChild(label);

                    highlightedCount++;
                }
            });

            // Add CSS for highlights if not already present
            injectHighlightStyles();

            return {
                success: true,
                count: elements.length,
                highlightedCount: highlightedCount,
                selector: selector
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                selector: selector
            };
        }
    }

    function clearHighlights() {
        try {
            // Remove all highlight classes and labels
            const highlightedElements = document.querySelectorAll(`.${SELECTOR_VERIFIER.highlightClass}`);
            highlightedElements.forEach(el => {
                el.classList.remove(SELECTOR_VERIFIER.highlightClass);
                el.style.removeProperty('outline');
                el.style.removeProperty('background-color');
            });

            // Remove all labels
            const labels = document.querySelectorAll(`.${SELECTOR_VERIFIER.labelClass}`);
            labels.forEach(label => label.remove());

            return {
                success: true,
                message: 'All highlights cleared'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    function getPageInfo() {
        try {
            return {
                success: true,
                url: window.location.href,
                title: document.title,
                domain: window.location.hostname,
                elementCounts: {
                    total: document.querySelectorAll('*').length,
                    divs: document.querySelectorAll('div').length,
                    spans: document.querySelectorAll('span').length,
                    links: document.querySelectorAll('a').length,
                    images: document.querySelectorAll('img').length,
                    forms: document.querySelectorAll('form').length,
                    inputs: document.querySelectorAll('input').length,
                    buttons: document.querySelectorAll('button').length
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Helper functions
    function getElementAttributes(element) {
        const attributes = {};
        for (let attr of element.attributes) {
            attributes[attr.name] = attr.value;
        }
        return attributes;
    }

    function isElementVisible(element) {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            rect.width > 0 &&
            rect.height > 0
        );
    }

    function createIndexLabel(index) {
        const label = document.createElement('div');
        label.className = SELECTOR_VERIFIER.labelClass;
        label.textContent = index;
        label.style.cssText = `
            position: absolute !important;
            top: -25px !important;
            left: 0 !important;
            background: #ff6b6b !important;
            color: white !important;
            padding: 2px 6px !important;
            font-size: 12px !important;
            font-weight: bold !important;
            font-family: Arial, sans-serif !important;
            border-radius: 3px !important;
            z-index: 999999 !important;
            pointer-events: none !important;
            line-height: 1 !important;
            min-width: 16px !important;
            text-align: center !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
        `;
        return label;
    }

    function injectHighlightStyles() {
        if (document.getElementById('selector-verifier-styles')) {
            return; // Already injected
        }

        const style = document.createElement('style');
        style.id = 'selector-verifier-styles';
        style.textContent = `
            .${SELECTOR_VERIFIER.highlightClass} {
                position: relative !important;
            }

            .${SELECTOR_VERIFIER.labelClass} {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Clean up when page unloads
    window.addEventListener('beforeunload', () => {
        clearHighlights();
    });

    // Initialize
    console.log('Selector Verifier content script loaded');

})();
