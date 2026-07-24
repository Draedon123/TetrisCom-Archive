// @ts-check

class UI {
  /** @type { import("./ServerConnection").ServerConnection } */
  serverConnection;
  /** @type { HTMLInputElement } */
  usernameInput;
  /** @type { HTMLElement } */
  usernameInputError;

  /**
   * @param { import("./ServerConnection").ServerConnection } serverConnection
   */
  constructor(serverConnection) {
    this.serverConnection = serverConnection;

    this.usernameInput = /** @type { HTMLInputElement } */ (
      document.getElementById("username")
    );
    this.usernameInputError = /** @type { HTMLElement } */ (
      document.getElementById("username-input-error")
    );

    this.usernameInput.addEventListener("change", () => {
      this.usernameInputError.style.display = "none";

      const username = this.usernameInput.value;

      serverConnection.username = username;
      this.usernameInput.disabled = true;
    });
  }

  /**
   * @param { import("./server/messageTypedefs.cjs").SetUsernameResponseMessage } response
   */
  handleSetUsernameResponse(response) {
    this.usernameInput.disabled = false;

    if (response.ok) {
      return;
    }

    this.usernameInputError.textContent = /** @type { string } */ (
      response.error
    );
    this.usernameInput.style.display = "unset";

    this.usernameInput.value = this.serverConnection.username;
  }
}

export { UI };

