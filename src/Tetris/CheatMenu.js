import { UIComponent } from "/js/UIComponent.js";
import { encode } from "/js/encodeDecode.js";

class CheatMenu extends UIComponent {
  /**
   * @param { HTMLIFrameElement } iframe
   */

  constructor(iframe, settings, settingsKey) {
    super("cheatMenu");

    this.settingsKey = settingsKey;
    this.settings = settings;
    this.container = this.getElementById("cheatMenuContainer");
    this.cheats = this.getElementById("cheats");
    this.seedInput = this.getElementById("seedInput");
    this.applyButton = this.getElementById("applyButton");
    this.closeButton = this.getElementById("closeButton");
    this.appliedSettingsText = this.getElementById("appliedSettingsText");
    this.toggleCheatsButton = this.getElementById("toggleCheatsButton");
    this.title = this.getElementById("cheatMenuTitle");

    this.iframe = iframe;
    this.isOpen = false;
    this._seed = null;

    if (this.settings.enabled) {
      this.toggleCheatsButton.textContent = "Disable Cheats";
      this.title.textContent = "Cheat Menu (Enabled)";
    } else {
      this.toggleCheatsButton.textContent = "Enable Cheats";
      this.title.textContent = "Cheat Menu (Disabled)";
      this.cheats.style.display = "none";
    }

    // this writes to localStorage and is used to determine whether or not
    // the user has used this custom client before
    this.saveSettings();

    this.iframe.contentWindow.Math.random = () => this.seed;
    this.hideAppliedSettingsText();

    this.toggleCheatsButton.addEventListener("click", () => {
      this.settings.enabled = !this.settings.enabled;
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
    this.mount(iframe.contentDocument.body);
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
    this.iframe.contentDocument.getElementById("GameCanvas").focus();
  }

  get seed() {
    return this._seed === null ? Math.random() : this._seed;
  }

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

export { CheatMenu };
