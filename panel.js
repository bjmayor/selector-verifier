// Panel script for Selector Verifier extension
// This script handles the DevTools panel functionality

document.addEventListener("DOMContentLoaded", function () {
  const selectorInput = document.getElementById("selectorInput");
  const testBtn = document.getElementById("testBtn");
  const highlightBtn = document.getElementById("highlightBtn");
  const clearBtn = document.getElementById("clearBtn");
  const compactToggle = document.getElementById("compactToggle");
  const results = document.getElementById("results");
  const status = document.getElementById("status");

  let currentTabId = null;
  let lastClipboardContent = "";
  let autoTestEnabled = true;
  let isCompactMode = false;

  // Get current tab ID
  chrome.devtools.inspectedWindow.eval(
    "window.location.href",
    function (result, isException) {
      if (!isException) {
        currentTabId = chrome.devtools.inspectedWindow.tabId;
      }
    },
  );

  // Test selector functionality
  testBtn.addEventListener("click", function () {
    const selector = selectorInput.value.trim();
    if (!selector) {
      showStatus("Please enter a CSS selector", "error");
      return;
    }

    testSelector(selector);
  });

  // Highlight elements functionality
  highlightBtn.addEventListener("click", function () {
    const selector = selectorInput.value.trim();
    if (!selector) {
      showStatus("Please enter a CSS selector", "error");
      return;
    }

    highlightElements(selector);
  });

  // Clear highlights functionality
  clearBtn.addEventListener("click", function () {
    clearHighlights();
  });

  // Compact mode toggle
  compactToggle.addEventListener("click", function () {
    toggleCompactMode();
  });

  // Enter key support
  selectorInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      testBtn.click();
    }
  });

  // Auto-test when input changes (with debounce)
  let inputTimeout;
  selectorInput.addEventListener("input", function () {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
      const selector = selectorInput.value.trim();
      if (selector && autoTestEnabled) {
        testSelector(selector);
      }
    }, 500);
  });

  // Monitor clipboard for CSS selectors
  setInterval(checkClipboard, 1000);

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl/Cmd + Enter: Test selector
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      testBtn.click();
    }
    // Ctrl/Cmd + Shift + H: Highlight elements
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "H") {
      e.preventDefault();
      highlightBtn.click();
    }
    // Escape: Clear highlights
    if (e.key === "Escape") {
      e.preventDefault();
      clearBtn.click();
    }
  });

  function testSelector(selector) {
    const code = `
            (function() {
                try {
                    const elements = document.querySelectorAll('${selector}');
                    const elementInfo = Array.from(elements).map((el, index) => {
                        return {
                            index: index,
                            tagName: el.tagName.toLowerCase(),
                            id: el.id || 'no-id',
                            className: el.className || 'no-class',
                            textContent: el.textContent ? el.textContent.substring(0, 100) + '...' : 'no-text',
                            attributes: Array.from(el.attributes).map(attr => attr.name + '="' + attr.value + '"').join(' ')
                        };
                    });

                    return {
                        success: true,
                        count: elements.length,
                        elements: elementInfo
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            })()
        `;

    chrome.devtools.inspectedWindow.eval(code, function (result, isException) {
      if (isException) {
        showStatus("Error executing selector test", "error");
        results.textContent = "Exception: " + JSON.stringify(result);
        return;
      }

      if (result.success) {
        showStatus(
          `Found ${result.count} element(s)`,
          result.count > 0 ? "success" : "info",
        );

        if (result.count > 0) {
          let output = `Selector: ${selector}\nFound ${result.count} element(s):\n\n`;
          result.elements.forEach((el, index) => {
            output += `[${index + 1}] <${el.tagName}`;
            if (el.id !== "no-id") output += ` id="${el.id}"`;
            if (el.className !== "no-class")
              output += ` class="${el.className}"`;
            if (el.attributes) output += ` ${el.attributes}`;
            output += `>\n`;
            if (el.textContent !== "no-text") {
              output += `    Text: ${el.textContent}\n`;
            }
            output += "\n";
          });
          results.textContent = output;
        } else {
          results.textContent = `Selector: ${selector}\nNo elements found matching this selector.`;
        }
      } else {
        showStatus("Invalid selector", "error");
        results.textContent = `Error: ${result.error}`;
      }
    });
  }

  function highlightElements(selector) {
    const code = `
            (function() {
                try {
                    // Clear previous highlights
                    document.querySelectorAll('[data-selector-verifier-highlight]').forEach(el => {
                        el.style.outline = '';
                        el.style.backgroundColor = '';
                        el.removeAttribute('data-selector-verifier-highlight');
                    });

                    const elements = document.querySelectorAll('${selector}');
                    elements.forEach((el, index) => {
                        el.style.outline = '3px solid #ff6b6b';
                        el.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                        el.setAttribute('data-selector-verifier-highlight', 'true');

                        // Add a label showing the element index
                        const label = document.createElement('div');
                        label.textContent = index + 1;
                        label.style.cssText = \`
                            position: absolute;
                            top: -25px;
                            left: 0;
                            background: #ff6b6b;
                            color: white;
                            padding: 2px 6px;
                            font-size: 12px;
                            font-weight: bold;
                            border-radius: 3px;
                            z-index: 10000;
                            pointer-events: none;
                        \`;
                        label.setAttribute('data-selector-verifier-highlight', 'true');

                        if (el.style.position === '' || el.style.position === 'static') {
                            el.style.position = 'relative';
                        }
                        el.appendChild(label);
                    });

                    return {
                        success: true,
                        count: elements.length
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            })()
        `;

    chrome.devtools.inspectedWindow.eval(code, function (result, isException) {
      if (isException) {
        showStatus("Error highlighting elements", "error");
        return;
      }

      if (result.success) {
        showStatus(
          `Highlighted ${result.count} element(s)`,
          result.count > 0 ? "success" : "info",
        );
      } else {
        showStatus("Error highlighting elements: " + result.error, "error");
      }
    });
  }

  function clearHighlights() {
    const code = `
            (function() {
                try {
                    document.querySelectorAll('[data-selector-verifier-highlight]').forEach(el => {
                        if (el.tagName === 'DIV' && el.textContent.match(/^\\d+$/)) {
                            // Remove number labels
                            el.remove();
                        } else {
                            // Clear highlighting styles
                            el.style.outline = '';
                            el.style.backgroundColor = '';
                            el.removeAttribute('data-selector-verifier-highlight');
                        }
                    });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })()
        `;

    chrome.devtools.inspectedWindow.eval(code, function (result, isException) {
      if (!isException && result.success) {
        showStatus("Highlights cleared", "info");
        results.textContent = "";
      } else {
        showStatus("Error clearing highlights", "error");
      }
    });
  }

  function checkClipboard() {
    chrome.devtools.inspectedWindow.eval(
      `
            (async function() {
                try {
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        const clipText = await navigator.clipboard.readText();
                        return { success: true, text: clipText };
                    }
                    return { success: false, error: 'Clipboard API not available' };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })()
        `,
      function (result, isException) {
        if (!isException && result.success && result.text) {
          const clipText = result.text.trim();

          // Check if it looks like a CSS selector and is different from last check
          if (
            clipText !== lastClipboardContent &&
            looksLikeCSSSelector(clipText)
          ) {
            lastClipboardContent = clipText;

            if (selectorInput.value !== clipText) {
              selectorInput.value = clipText;
              showStatus("📋 Detected CSS selector from clipboard", "info");

              // Auto-test the detected selector
              setTimeout(() => {
                testSelector(clipText);
              }, 500);
            }
          }
        }
      },
    );
  }

  function looksLikeCSSSelector(text) {
    // Basic heuristics to detect CSS selectors
    if (!text || text.length > 200) return false;

    // Common CSS selector patterns
    const selectorPatterns = [
      /^[.#][\w-]+/, // .class or #id
      /^[\w-]+\s*[>.+~]/, // element with combinator
      /\[[\w-]+(=|~=|\|=|\^=|\$=|\*=)/, // attribute selector
      /:(hover|focus|active|visited|first-child|last-child|nth-child)/, // pseudo-classes
      /^[\w-]+$/, // simple element selector
      /^[\w-]+\.[\w-]+/, // element.class
      /^[\w-]+#[\w-]+/, // element#id
    ];

    return selectorPatterns.some((pattern) => pattern.test(text));
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;

    // Auto-clear status after 5 seconds for success/info messages
    if (type === "success" || type === "info") {
      setTimeout(() => {
        status.textContent = "";
        status.className = "";
      }, 5000);
    }
  }

  // Get currently selected element in DevTools
  function getCurrentSelectedElement() {
    chrome.devtools.inspectedWindow.eval(
      `
            (function() {
                if (window.$0) {
                    // Generate selector for currently selected element
                    function generateSelector(element) {
                        if (element.id) {
                            return '#' + element.id;
                        }

                        if (element.className) {
                            const classes = element.className.split(' ').filter(c => c.trim());
                            if (classes.length > 0) {
                                return '.' + classes.join('.');
                            }
                        }

                        // Fallback to tag name
                        return element.tagName.toLowerCase();
                    }

                    return {
                        success: true,
                        selector: generateSelector(window.$0),
                        element: {
                            tagName: window.$0.tagName,
                            id: window.$0.id,
                            className: window.$0.className
                        }
                    };
                }
                return { success: false, error: 'No element selected in DevTools' };
            })()
        `,
      function (result, isException) {
        if (!isException && result.success) {
          selectorInput.value = result.selector;
          showStatus("🎯 Loaded selector from selected element", "success");
          testSelector(result.selector);
        }
      },
    );
  }

  // Add button to get current selected element
  const getCurrentBtn = document.createElement("button");
  getCurrentBtn.textContent = "Use Selected Element";
  getCurrentBtn.title =
    "Get selector for currently selected element in DevTools (Ctrl+Shift+S)";
  getCurrentBtn.style.backgroundColor = "#2196F3";
  getCurrentBtn.addEventListener("click", getCurrentSelectedElement);

  // Add the button to button group
  const buttonGroup = document.querySelector(".button-group");
  buttonGroup.appendChild(getCurrentBtn);

  // Add keyboard shortcut for getting selected element
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
      e.preventDefault();
      getCurrentSelectedElement();
    }
  });

  function toggleCompactMode() {
    isCompactMode = !isCompactMode;
    const body = document.body;
    const shortcutsInfo = document.getElementById("shortcutsInfo");

    if (isCompactMode) {
      body.classList.add("compact-mode");
      compactToggle.textContent = "🖥️ Full Mode";
      compactToggle.title = "Switch to full mode";
      shortcutsInfo.style.display = "none";
      showStatus("Switched to compact mode", "info");
    } else {
      body.classList.remove("compact-mode");
      compactToggle.textContent = "📱 Compact Mode";
      compactToggle.title =
        "Switch to compact mode for sidebar-like experience";
      shortcutsInfo.style.display = "block";
      showStatus("Switched to full mode", "info");
    }
  }

  // Initialize with some example selectors
  const examples = [
    "div",
    ".container",
    "#main",
    'a[href*="example"]',
    "p:first-child",
    'input[type="text"]',
  ];

  selectorInput.placeholder = `Try: ${examples[Math.floor(Math.random() * examples.length)]} or copy a selector`;

  // Set initial compact mode button title
  compactToggle.title = "Switch to compact mode for sidebar-like experience";

  // Initial clipboard check
  setTimeout(checkClipboard, 1000);
});
