
/* CIPHER // ZERO — Mobile & Tablet Controls */

(() => {
  "use strict";

  // Change these selectors if your HTML uses different IDs.
  const INPUT_SELECTOR =
    "#commandInput, #terminalInput, #command-input, #terminal-input, input[type='text']";

  const EXECUTE_SELECTOR =
    "#executeBtn, #execute, #submitCommand, #submit-command, button[data-action='execute']";

  const input = document.querySelector(INPUT_SELECTOR);
  if (!input) {
    console.warn("CIPHER ZERO: Terminal input was not found.");
    return;
  }

  // ---------- RESPONSIVE STYLES ----------
  const style = document.createElement("style");

  style.textContent = `
    * {
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    body {
      -webkit-text-size-adjust: 100%;
      touch-action: manipulation;
    }

    input, button, textarea {
      font-size: 16px !important;
    }

    #cz-mobile-controls {
      display: none;
    }

    @media (max-width: 900px) {
      body {
        padding: 10px !important;
      }

      .container, .game-container, main, #game {
        width: 100% !important;
        max-width: 100% !important;
      }

      .panels, .main-layout, .game-layout {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
      }

      .panel, .console, .terminal, .puzzle-panel {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
      }

      input[type="text"], input[type="password"], textarea {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        min-height: 48px !important;
        padding: 12px !important;
        border-radius: 6px !important;
        margin: 8px 0 !important;
        font-size: 16px !important;
        touch-action: manipulation;
      }

      button {
        min-height: 44px;
        padding: 10px 14px;
        touch-action: manipulation;
        cursor: pointer;
      }

      #cz-mobile-controls {
        display: block;
        width: 100%;
        margin-top: 12px;
        font-family: monospace;
      }

      #cz-keyboard-toggle {
        width: 100%;
        background: #07120a;
        color: #00ff66;
        border: 1px solid #00ff66;
        border-radius: 6px;
        padding: 12px;
        margin: 8px 0;
      }

      #cz-virtual-keyboard {
        display: none;
        background: #050a06;
        border: 1px solid #00ff66;
        border-radius: 8px;
        padding: 8px;
        width: 100%;
      }

      #cz-virtual-keyboard.open {
        display: block;
      }

      .cz-key-row {
        display: flex;
        gap: 5px;
        margin: 5px 0;
      }

      .cz-key {
        flex: 1;
        min-width: 0;
        min-height: 46px;
        color: #00ff66;
        background: #0a160c;
        border: 1px solid #176b34;
        border-radius: 5px;
        font-family: monospace;
        font-size: 15px;
        font-weight: bold;
        padding: 6px 2px;
      }

      .cz-key:active {
        background: #00ff66;
        color: #001a08;
      }

      .cz-key.special {
        background: #10251a;
      }

      .cz-key.wide {
        flex: 1.8;
      }

      #cz-keyboard-status {
        color: #00ff66;
        opacity: .7;
        font-size: 12px;
        padding: 5px 2px;
      }
    }

    @media (min-width: 600px) and (max-width: 900px) {
      .cz-key {
        min-height: 52px;
        font-size: 18px;
      }
    }
  `;

  document.head.appendChild(style);

  // ---------- MOBILE CONTROLS ----------
  const controls = document.createElement("div");
  controls.id = "cz-mobile-controls";

  controls.innerHTML = `
    <button id="cz-keyboard-toggle" type="button">
      [ + ] OPEN / CLOSE HACKER KEYBOARD
    </button>

    <div id="cz-virtual-keyboard">
      <div id="cz-keyboard-status">TERMINAL INPUT // TOUCH MODE</div>
      <div class="cz-key-row">
        ${"QWERTYUIOP".split("").map(k => key(k)).join("")}
      </div>
      <div class="cz-key-row">
        ${"ASDFGHJKL".split("").map(k => key(k)).join("")}
      </div>
      <div class="cz-key-row">
        ${"ZXCVBNM".split("").map(k => key(k)).join("")}
      </div>
      <div class="cz-key-row">
        ${key("SPACE", "wide")}
        ${key("DEL", "special")}
        ${key("CLEAR", "special")}
      </div>
      <div class="cz-key-row">
        ${key("ENTER", "wide special")}
      </div>
    </div>
  `;

  // Place controls immediately after the terminal input.
  input.insertAdjacentElement("afterend", controls);

  const keyboard = controls.querySelector("#cz-virtual-keyboard");
  const toggle = controls.querySelector("#cz-keyboard-toggle");

  function key(label, classes = "") {
    return `<button type="button" class="cz-key ${classes}" data-key="${label}">${label}</button>`;
  }

  // Rebuild keyboard because the helper above is used in template generation.
  controls.querySelectorAll(".cz-key").forEach((button) => {
    button.addEventListener("click", () => pressKey(button.dataset.key));
  });

  // ---------- KEY ACTIONS ----------
  function pressKey(key) {
    input.focus();

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const value = input.value;

    if (key === "ENTER") {
      executeCommand();
      return;
    }

    if (key === "CLEAR") {
      input.value = "";
    } else if (key === "DEL") {
      if (start === end && start > 0) {
        input.value = value.slice(0, start - 1) + value.slice(end);
        input.setSelectionRange(start - 1, start - 1);
      } else {
        input.value = value.slice(0, start) + value.slice(end);
        input.setSelectionRange(start, start);
      }
    } else {
      const text = key === "SPACE" ? " " : key;
      input.value = value.slice(0, start) + text + value.slice(end);
      const cursor = start + text.length;
      input.setSelectionRange(cursor, cursor);
    }

    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // ---------- EXECUTE ----------
  function executeCommand() {
    const executeButton = document.querySelector(EXECUTE_SELECTOR);

    if (executeButton) {
      executeButton.click();
    } else {
      input.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true
      }));
    }
  }

  // Enter key works on mobile and desktop.
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      executeCommand();
    }
  });

  // Native phone/tablet keyboard appears when the user taps the input.
  input.addEventListener("focus", () => {
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocapitalize", "characters");
    input.setAttribute("spellcheck", "false");
  });

  // Toggle the custom keyboard.
  toggle.addEventListener("click", () => {
    keyboard.classList.toggle("open");

    toggle.textContent = keyboard.classList.contains("open")
      ? "[ - ] CLOSE HACKER KEYBOARD"
      : "[ + ] OPEN / CLOSE HACKER KEYBOARD";
  });

  console.log("CIPHER ZERO mobile controls loaded.");
})();
