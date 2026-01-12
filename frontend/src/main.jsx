import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Suppress and sanitize malformed SVG <path> parse errors (some third-party SVGs may be corrupted)
const _seenSvgErrorMessages = new Set();
window.addEventListener(
  "error",
  function (event) {
    try {
      const msg = event && event.message;
      if (typeof msg === "string" && msg.includes("attribute d:")) {
        // Deduplicate identical messages so devtools aren't spammed
        if (!_seenSvgErrorMessages.has(msg)) {
          _seenSvgErrorMessages.add(msg);
          console.info("Suppressed malformed SVG path parse error:", msg);
        }
        // Prevent the runtime error from bubbling to the console repeatedly
        event.preventDefault();
      }
    } catch (e) {
      // ignore
    }
  },
  true
);

// Basic sanitizer: remove invisible characters and validate paths using Path2D.
// This attempts to fix common causes (zero-width characters) and only hides paths
// that still fail to be parsed by the browser (minimizes false-positives).
function sanitizeSvgPaths() {
  try {
    const paths = Array.from(document.querySelectorAll("path[d]") || []);
    paths.forEach((p) => {
      const orig = p.getAttribute("d") || "";
      // Remove zero-width and other invisible control characters that sometimes appear when copying SVGs
      let cleaned = orig
        .replace(/[\u200B\u200C\u200D\uFEFF\u200E\u200F]/g, "")
        .trim();
      // Also remove other invisible/control Unicode codepoints if supported (best-effort)
      try {
        cleaned = cleaned.replace(/\p{C}/gu, "").trim();
      } catch (e) {
        // older engines may not support \p{C}; ignore in that case
      }
      if (cleaned !== orig) {
        try {
          p.setAttribute("d", cleaned);
          console.info(
            "Sanitized SVG path attribute d (removed invisible chars)"
          );
        } catch (e) {
          // ignore attribute set errors
        }
      }

      // Heuristic: very long strings are suspicious; hide them to prevent expensive parsing
      if (cleaned.length > 200000 && !p.dataset._hiddenForSvgError) {
        p.dataset._hiddenForSvgError = "1";
        p.style.display = "none";
        console.warn("Hid malformed SVG path due to excessive length");
        return;
      }

      // Attempt to validate using Path2D - if the constructor throws, we hide the path
      try {
        // Path2D will throw on invalid path data in many browsers
        new Path2D(cleaned);
      } catch (err) {
        if (!p.dataset._hiddenForSvgError) {
          p.dataset._hiddenForSvgError = "1";
          p.style.display = "none";
          const snippet = String(cleaned).slice(0, 300).replace(/\s+/g, " ");
          // Diagnostic: include nearest SVG info and a short outerHTML of the path so we can find the source
          const svg = p.closest("svg");
          const svgHint = svg
            ? {
                id: svg.id || null,
                class: svg.getAttribute("class") || null,
                viewBox: svg.getAttribute("viewBox") || null,
              }
            : null;
          const elSnippet = String(p.outerHTML || "")
            .slice(0, 300)
            .replace(/\s+/g, " ");
          p.dataset._hiddenForSvgSource = "diagnostic";
          console.warn("Hid malformed SVG path to avoid parse error", {
            snippet,
            svgHint,
            elSnippet,
          });
        }
      }
    });
  } catch (e) {
    // ignore errors silently - sanitizer must not break app
  }
}

// Run sanitization after DOM is ready and periodically in case scripts insert SVG dynamically
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  sanitizeSvgPaths();
} else {
  window.addEventListener("DOMContentLoaded", sanitizeSvgPaths);
}
setInterval(sanitizeSvgPaths, 5000);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
