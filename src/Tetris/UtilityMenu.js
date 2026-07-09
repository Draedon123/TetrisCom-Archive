// @ts-check

import { UIComponent } from "../js/UIComponent.js";
import { encode } from "../js/encodeDecode.js";

/** @typedef { { cheatsEnabled: boolean, toggleKeybind: string, restartKeybind: string } } Settings */

const IS_CHEATING = {
  seed: true,
  keybind: false,
  restartKeybind: false,
};

class UtilityMenu extends UIComponent {
  /** @readonly @type { Settings } */
  static DEFAULT_SETTINGS = {
    cheatsEnabled: true,
    toggleKeybind: "Backslash",
    restartKeybind: "KeyR",
  };

  /** @readonly @type { Settings } */
  settings;
  /** @private @readonly @type { string } */
  settingsKey;
  /** @private @readonly @type { HTMLElement } */
  container;
  /** @private @readonly @type { HTMLInputElement } */
  keybindInput;
  /** @private @readonly @type { HTMLInputElement } */
  restartKeybindInput;
  /** @private @readonly @type { HTMLInputElement } */
  seedInput;
  /** @private @readonly @type { HTMLButtonElement } */
  closeButton;
  /** @private @readonly @type { HTMLButtonElement } */
  toggleCheatsButton;
  /** @private @readonly @type { HTMLElement } */
  title;
  /** @private @readonly @type { HTMLIFrameElement } */
  iframe;
  /** @private @readonly @type { typeof IS_CHEATING } */
  enabledUtilities;
  /** @type { boolean } */
  isOpen;

  /** @private @type { number | null } */
  _seed;

  /**
   * @param { HTMLIFrameElement } iframe
   * @param { Partial<Settings> } settings
   * @param { string } settingsKey
   * @param { boolean } isMobile
   * @param { Partial<typeof IS_CHEATING & { toggleableCheats: boolean }> } overrides
   */

  constructor(iframe, settings, settingsKey, isMobile, overrides = {}) {
    super("utilityMenu");

    this.settings = Object.assign(
      structuredClone(UtilityMenu.DEFAULT_SETTINGS),
      settings
    );
    this.settingsKey = settingsKey;
    this.container = this.getElementById("utilityMenuContainer");
    this.keybindInput = /** @type { HTMLInputElement } */ (
      this.getElementById("keybindInput")
    );
    this.restartKeybindInput = /** @type { HTMLInputElement } */ (
      this.getElementById("restartKeybindInput")
    );
    this.seedInput = /** @type { HTMLInputElement } */ (
      this.getElementById("seedInput")
    );
    this.closeButton = /** @type { HTMLButtonElement } */ (
      this.getElementById("closeButton")
    );
    this.toggleCheatsButton = /** @type { HTMLButtonElement } */ (
      this.getElementById("toggleCheatsButton")
    );
    this.title = this.getElementById("utilityMenuTitle");

    this.iframe = iframe;
    this.isOpen = false;
    this._seed = null;

    this.enabledUtilities = {
      seed: overrides.seed ?? this.settings.cheatsEnabled,
      keybind: overrides.keybind ?? !isMobile,
      restartKeybind: overrides.restartKeybind ?? true,
    };

    for (const [utility, enabled] of Object.entries(this.enabledUtilities)) {
      if (enabled) {
        continue;
      }

      const utilityContainer = /** @type { HTMLElement } */ (
        this.getElementById(utility)
      );

      utilityContainer.style.display = "none";
    }

    if (!(overrides.toggleableCheats ?? true)) {
      const cheatToggleContainer = /** @type { HTMLElement } */ (
        this.getElementById("toggleCheats")
      );

      cheatToggleContainer.style.display = "none";
    }

    if (this.settings.cheatsEnabled) {
      this.toggleCheatsButton.textContent = "Disable Cheats";
      this.title.textContent = "Cheat Menu (Enabled)";
    } else {
      this.toggleCheatsButton.textContent = "Enable Cheats";
      this.title.textContent = "Cheat Menu (Disabled)";
    }

    if (isMobile) {
      this.container.style.width = "100%";
      this.container.style.height = "100%";
    }

    // this writes to localStorage and is used to determine whether or not
    // the user has used this custom client before
    this.saveSettings();

    // @ts-expect-error
    this.iframe.contentWindow.Math.random = () => this.seed;

    this.toggleCheatsButton.addEventListener("click", () => {
      this.settings.cheatsEnabled = !this.settings.cheatsEnabled;
      this.saveSettings();
      window.location.pathname = window.location.pathname;
    });

    this.closeButton.addEventListener("click", () => {
      this.close();
    });

    this.initialiseSeedInput();
    this.initialiseToggleMenuKeybindInput();
    this.initialiseRestartKeybind();

    this.close();

    const mountTarget = /** @type { HTMLElement } */ (
      // @ts-expect-error
      iframe.contentDocument.body
    );
    this.mount(mountTarget);
  }

  static async appendTemplate() {
    const templateContents = await (
      await fetch("./UtilityMenuTemplate.html")
    ).text();
    const template = /** @type { HTMLTemplateElement } */ (
      new DOMParser()
        .parseFromString(templateContents, "text/html")
        .querySelector("template")
    );

    document.body.appendChild(template);
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    const iframeDocument = /** @type { Document } */ (
      this.iframe.contentDocument
    );
    if (iframeDocument.activeElement === this.keybindInput) {
      return;
    }

    this.isOpen = true;
    this.container.style.display = "flex";
  }

  close() {
    const iframeDocument = /** @type { Document } */ (
      this.iframe.contentDocument
    );
    if (iframeDocument.activeElement === this.keybindInput) {
      return;
    }

    this.isOpen = false;
    this.container.style.display = "none";

    const canvas = /** @type { HTMLCanvasElement } */ (
      // @ts-expect-error
      this.iframe.contentDocument.getElementById("GameCanvas")
    );
    canvas.focus();
  }

  get seed() {
    return this._seed === null ? Math.random() : this._seed;
  }

  /**
   * @param { number | null } seed
   */
  set seed(seed) {
    this._seed = seed;
  }

  /**
   * @private
   */
  saveSettings() {
    localStorage.setItem(
      this.settingsKey,
      encode(JSON.stringify(this.settings), -1)
    );
  }

  initialiseSeedInput() {
    this.seedInput.addEventListener("change", () => {
      if (!this.enabledUtilities.seed) {
        return;
      }

      const seedInputValue = this.seedInput.value;
      const seed = seedInputValue === "" ? null : parseFloat(seedInputValue);

      this.seed = seed;
    });
  }

  /**
   * @private
   */
  initialiseToggleMenuKeybindInput() {
    this.keybindInput.value = this.settings.toggleKeybind
      .replace("Key", "")
      .replace("Digit", "");
    this.keybindInput.addEventListener("keydown", (event) => {
      event.preventDefault();

      this.settings.toggleKeybind = event.code;
      this.keybindInput.value = event.code
        .replace("Key", "")
        .replace("Digit", "");

      this.saveSettings();
    });
  }

  /**
   * @private
   */
  initialiseRestartKeybind() {
    this.restartKeybindInput.value = this.settings.restartKeybind
      .replace("Key", "")
      .replace("Digit", "");
    this.restartKeybindInput.addEventListener("keydown", (event) => {
      event.preventDefault();

      this.settings.restartKeybind = event.code;
      this.restartKeybindInput.value = event.code
        .replace("Key", "")
        .replace("Digit", "");

      this.saveSettings();
    });

    /**
     * @param { KeyboardEvent} event
     */
    const eventListener = (event) => {
      if (event.code === this.settings.restartKeybind) {
        // @ts-expect-error
        const mBPSApp = this.iframe.contentWindow.mBPSApp;
        mBPSApp.mSceneMgr.getManagedScene("mainMenu").performPlay();
      }
    };

    const gameCanvas = /** @type { HTMLCanvasElement } */ (
      // @ts-expect-error
      this.iframe.contentWindow.document.getElementById("GameCanvas")
    );

    document.addEventListener("keydown", eventListener);
    gameCanvas.addEventListener("keydown", eventListener);
  }
}

export { UtilityMenu };
