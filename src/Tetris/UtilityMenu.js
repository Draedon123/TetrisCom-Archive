// @ts-check

import { UIComponent } from "../js/UIComponent.js";
import { encode } from "../js/encodeDecode.js";

/** @typedef { { cheatsEnabled: boolean } } Settings */

const IS_CHEATING = {
  seed: true,
};

class UtilityMenu extends UIComponent {
  /** @readonly @type { Settings } */
  settings;
  /** @readonly @type { string } */
  settingsKey;
  /** @readonly @type { HTMLElement } */
  container;
  /** @readonly @type { HTMLInputElement } */
  seedInput;
  /** @readonly @type { HTMLButtonElement } */
  applyButton;
  /** @readonly @type { HTMLButtonElement } */
  closeButton;
  /** @readonly @type { HTMLElement } */
  appliedSettingsText;
  /** @readonly @type { HTMLButtonElement } */
  toggleCheatsButton;
  /** @readonly @type { HTMLElement } */
  title;
  /** @readonly @type { HTMLIFrameElement } */
  iframe;
  /** @type { boolean } */
  isOpen;

  /** @private @type { number | null } */
  _seed;

  /**
   * @param { HTMLIFrameElement } iframe
   * @param { Settings } settings
   * @param { string } settingsKey
   * @param { boolean } isMobile
   */

  constructor(iframe, settings, settingsKey, isMobile) {
    super("utilityMenu");

    this.settings = settings;
    this.settingsKey = settingsKey;
    this.container = this.getElementById("utilityMenuContainer");
    this.seedInput = /** @type { HTMLInputElement } */ (
      this.getElementById("seedInput")
    );
    this.applyButton = /** @type { HTMLButtonElement } */ (
      this.getElementById("applyButton")
    );
    this.closeButton = /** @type { HTMLButtonElement } */ (
      this.getElementById("closeButton")
    );
    this.appliedSettingsText = this.getElementById("appliedSettingsText");
    this.toggleCheatsButton = /** @type { HTMLButtonElement } */ (
      this.getElementById("toggleCheatsButton")
    );
    this.title = this.getElementById("utilityMenuTitle");

    this.iframe = iframe;
    this.isOpen = false;
    this._seed = null;

    if (this.settings.cheatsEnabled) {
      this.toggleCheatsButton.textContent = "Disable Cheats";
      this.title.textContent = "Cheat Menu (Enabled)";
    } else {
      this.toggleCheatsButton.textContent = "Enable Cheats";
      this.title.textContent = "Cheat Menu (Disabled)";

      for (const [id, isCheating] of Object.entries(IS_CHEATING)) {
        if (isCheating) {
          const cheatContainer = /** @type { HTMLElement } */ (
            this.getElementById(id)
          );

          cheatContainer.style.display = "none";
        }
      }
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
    this.hideAppliedSettingsText();

    this.toggleCheatsButton.addEventListener("click", () => {
      this.settings.cheatsEnabled = !this.settings.cheatsEnabled;
      this.saveSettings();
      window.location.pathname = window.location.pathname;
    });

    this.seedInput.addEventListener("change", () => {
      this.hideAppliedSettingsText();
    });

    this.closeButton.addEventListener("click", () => {
      this.close();
    });

    this.applyButton.addEventListener("click", () => {
      const seedInputValue = this.seedInput.value;
      const seed = seedInputValue === "" ? null : parseFloat(seedInputValue);
      this.seed = seed;

      this.showAppliedSettingsText();
    });

    this.container.addEventListener("click", () => console.log);

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
    this.isOpen = true;
    this.container.style.display = "flex";
  }

  close() {
    this.isOpen = false;
    this.container.style.display = "none";

    this.hideAppliedSettingsText();

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

  hideAppliedSettingsText() {
    this.appliedSettingsText.style.display = "none";
  }

  showAppliedSettingsText() {
    this.appliedSettingsText.style.display = "";
  }

  saveSettings() {
    localStorage.setItem(
      this.settingsKey,
      encode(JSON.stringify(this.settings), -1)
    );
  }
}

export { UtilityMenu };
