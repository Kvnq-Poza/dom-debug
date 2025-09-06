/**
 * DOM Debug Tool
 * A self-contained, vanilla JavaScript tool for live DOM inspection and style prototyping.
 * To use, simply include this script file in your HTML.
 * <script src="dom-debug.js"></script>
 */
(function () {
  "use strict";

  // Prevent the script from running multiple times
  if (window.__DOM_DEBUG_ACTIVE__) return;
  window.__DOM_DEBUG_ACTIVE__ = true;

  // ---------- Config & Helpers ----------
  const UI_PREFIX = "dom-debug";
  const UI_CLASS = `${UI_PREFIX}-ui`;
  const STYLE_ID = `${UI_PREFIX}-styles`;

  /** Checks if an element is part of the debugger's UI. */
  const isInUI = (el) => !!(el && el.closest && el.closest(`.${UI_CLASS}`));

  /** Creates a DOM element with specified attributes and content. */
  const createEl = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) =>
      el.setAttribute(key, value)
    );
    children.forEach((child) => el.appendChild(child));
    return el;
  };

  /**
   * Main initialization function.
   * Sets up the tool's UI, styles, and event listeners.
   */
  function initializeDomDebug() {
    // 1. Inject CSS Styles
    const css = `
      .${UI_PREFIX}-highlight, .${UI_PREFIX}-active-highlight, .${UI_PREFIX}-panel, .${UI_PREFIX}-toggle {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .${UI_PREFIX}-highlight {
        position: absolute; background: #3b82f6; opacity: 0.1; border: 2px solid #3b82f6;
        pointer-events: none; z-index: 999998; transition: all 0.1s ease; border-radius: 3px; display: none;
      }
      .${UI_PREFIX}-active-highlight {
        position: absolute; background: transparent; border: 2px dashed #10b981;
        pointer-events: none; z-index: 999998; border-radius: 3px; display: none;
      }
      .${UI_PREFIX}-panel {
        position: fixed; top: 20px; right: -400px; width: 350px; height: calc(100vh - 40px);
        background: #1f2937; color: #f9fafb; border-radius: 8px; box-shadow: -5px 0 20px rgba(0,0,0,0.3);
        z-index: 1000000; transition: right 0.2s ease; overflow: hidden; display: flex; flex-direction: column;
      }
      .${UI_PREFIX}-panel.active { right: 20px; }
      .${UI_PREFIX}-panel * { box-sizing: border-box; }
      .${UI_PREFIX}-panel .panel-header {
        padding: 20px; border-bottom: 1px solid #374151; display: flex; justify-content: space-between; align-items: center;
      }
      .${UI_PREFIX}-panel .panel-title { font-size: 1.2rem; font-weight: 600; margin: 0; }
      .${UI_PREFIX}-panel .panel-close {
        background: none; border: none; color: #f9fafb; font-size: 1.5rem; cursor: pointer; padding: 0;
        width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
      }
      .${UI_PREFIX}-panel .panel-close:hover { background: #374151; }
      .${UI_PREFIX}-panel .panel-content { flex: 1; overflow-y: auto; padding: 20px; }
      .${UI_PREFIX}-panel .element-info h3 {
        margin: 0 0 10px 0; font-size: 1rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;
      }
      .${UI_PREFIX}-panel .element-tag {
        background: #374151; padding: 8px 12px; border-radius: 4px; font-family: "Monaco", "Menlo", monospace;
        font-size: 0.9rem; word-break: break-all;
      }
      .${UI_PREFIX}-panel .style-editor { margin-top: 20px; display: none; }
      .${UI_PREFIX}-panel .style-group { margin-bottom: 15px; }
      .${UI_PREFIX}-panel .style-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #9ca3af; }
      .${UI_PREFIX}-panel .style-input {
        width: 100%; padding: 8px 12px; background: #374151; border: 1px solid #4b5563; border-radius: 4px;
        color: #f9fafb; font-family: "Monaco", "Menlo", monospace; font-size: 0.85rem;
      }
      .${UI_PREFIX}-panel .style-input:focus { outline: none; border-color: #3b82f6; }
      .${UI_PREFIX}-toggle {
        position: fixed; top: 20px; right: 20px; background: #1f2937; color: #f9fafb;
        border: none; border-radius: 50%; cursor: pointer; font-size: 1.2rem;
        z-index: 1000000; box-shadow: 0 5px 15px rgba(0,0,0,0.2); transition: all 0.2s;
        width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
      }
      .${UI_PREFIX}-toggle:hover { transform: scale(1.1); background: #374151; }
      .${UI_PREFIX}-toggle.active { background: #3b82f6; }
      .${UI_PREFIX}-panel .panel-button {
        background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px;
        cursor: pointer; font-weight: 500; transition: all 0.2s; width: 100%;
      }
      .${UI_PREFIX}-panel .panel-button:hover { background: #2563eb; }
    `;
    const styleSheet = createEl("style", { id: STYLE_ID });
    styleSheet.textContent = css;
    document.head.appendChild(styleSheet);

    // 2. Create and Inject UI Elements
    const toggleBtn = createEl("button", {
      class: `${UI_PREFIX}-toggle ${UI_CLASS}`,
      title: "Toggle DOM Inspector",
    });
    toggleBtn.textContent = "🔍";

    const panel = createEl("div", { class: `${UI_PREFIX}-panel ${UI_CLASS}` });

    const highlight = createEl("div", { class: `${UI_PREFIX}-highlight` });

    const activeHighlight = createEl("div", {
      class: `${UI_PREFIX}-active-highlight`,
    });

    // Build panel internals
    panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">DOM Inspector</h2>
        <button class="panel-close">×</button>
      </div>
      <div class="panel-content">
        <div class="element-info">
          <h3>Selected Element</h3>
          <div class="element-tag">Click an element to inspect</div>
        </div>
        <div class="style-editor">
          <h3>Live Style Editor</h3>
          ${[
            "backgroundColor",
            "color",
            "fontSize",
            "padding",
            "border",
            "borderRadius",
          ]
            .map(
              (prop) => `
              <div class="style-group">
                <label>${prop
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}</label>
                <input type="text" class="style-input" data-property="${prop}" placeholder="e.g., 1rem, #fff, etc." />
              </div>
            `
            )
            .join("")}
          <div style="margin-top: 20px;">
            <button class="panel-button copy-styles-btn">📋 Copy Applied Styles</button>
          </div>
        </div>
      </div>
    `;
    document.body.append(toggleBtn, panel, highlight, activeHighlight);

    // 3. Setup Logic & Event Handlers
    const panelClose = panel.querySelector(".panel-close");
    const elementTag = panel.querySelector(".element-tag");
    const styleEditor = panel.querySelector(".style-editor");
    const styleInputs = panel.querySelectorAll(".style-input");
    const copyBtn = panel.querySelector(".copy-styles-btn");

    let isActive = false;
    let selectedEl = null;

    const updateHighlightPosition = (highlighter, el) => {
      if (!el || !isActive) {
        highlighter.style.display = "none";
        return;
      }
      const rect = el.getBoundingClientRect();
      highlighter.style.display = "block";
      highlighter.style.top = `${rect.top + window.scrollY}px`;
      highlighter.style.left = `${rect.left + window.scrollX}px`;
      highlighter.style.width = `${rect.width}px`;
      highlighter.style.height = `${rect.height}px`;
    };

    const selectElement = (el) => {
      selectedEl = el;
      let tag = el.tagName.toLowerCase();
      let id = el.id ? "#" + el.id : "";
      let classes = el.classList.length
        ? "." + [...el.classList].join(".")
        : "";
      elementTag.textContent = tag + id + classes;

      styleEditor.style.display = "block";
      styleInputs.forEach((input) => {
        const prop = input.dataset.property;
        input.value = el.style[prop] || window.getComputedStyle(el)[prop];
      });
      updateHighlightPosition(activeHighlight, el);
    };

    const deactivate = () => {
      isActive = false;
      toggleBtn.classList.remove("active");
      panel.classList.remove("active");
      document.body.style.cursor = "";
      selectedEl = null;
      styleEditor.style.display = "none";
      highlight.style.display = "none";
      activeHighlight.style.display = "none";
      elementTag.textContent = "Click an element to inspect";
    };

    // --- Event Listeners ---
    toggleBtn.addEventListener("click", () => {
      isActive = !isActive;
      toggleBtn.classList.toggle("active", isActive);
      document.body.style.cursor = isActive ? "crosshair" : "";
      if (!isActive) deactivate();
    });

    panelClose.addEventListener("click", deactivate);

    document.addEventListener("mousemove", (e) => {
      if (!isActive) return;
      isInUI(e.target)
        ? (highlight.style.display = "none")
        : updateHighlightPosition(highlight, e.target);
    });

    document.addEventListener(
      "click",
      (e) => {
        if (!isActive || isInUI(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        panel.classList.add("active");
        selectElement(e.target);
      },
      true
    );

    styleInputs.forEach((input) => {
      input.addEventListener("input", () => {
        if (selectedEl) {
          selectedEl.style[input.dataset.property] = input.value;
          updateHighlightPosition(activeHighlight, selectedEl);
        }
      });
    });

    copyBtn.addEventListener("click", () => {
      if (!selectedEl) return;
      navigator.clipboard
        .writeText(selectedEl.getAttribute("style") || "")
        .then(() => {
          copyBtn.textContent = "✅ Copied!";
          setTimeout(
            () => (copyBtn.textContent = "📋 Copy Applied Styles"),
            1500
          );
        });
    });

    const onResizeOrScroll = () => {
      updateHighlightPosition(highlight, null);
      updateHighlightPosition(activeHighlight, selectedEl);
    };
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll);
  }

  // Wait for the DOM to be ready before initializing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDomDebug);
  } else {
    initializeDomDebug();
  }
})();
