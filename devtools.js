// DevTools script for Selector Verifier extension
// This script creates a main panel in Chrome DevTools

console.log("DevTools script loaded");

// Create main panel
chrome.devtools.panels.create(
  "Selector Verifier",
  "icons/icon48.png",
  "panel.html",
  function (panel) {
    if (chrome.runtime.lastError) {
      console.error("Error creating main panel:", chrome.runtime.lastError);
      return;
    }

    console.log("Selector Verifier main panel created successfully");

    // Handle panel events
    panel.onShown.addListener(function (panelWindow) {
      console.log("Selector Verifier main panel shown");

      // Panel is ready for interaction
      if (panelWindow && panelWindow.document) {
        console.log("Panel window is ready");
      }
    });

    panel.onHidden.addListener(function () {
      console.log("Selector Verifier main panel hidden");
    });
  },
);
