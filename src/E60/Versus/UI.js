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
      const username = this.usernameInput.value;

      this.usernameInput.disabled = true;
      serverConnection.username = username;
    });
  }

  /**
   * @param { import("./server/messageTypedefs.cjs").SetUsernameResponseMessage } response
   */
  handleSetUsernameResponse(response) {
    this.usernameInput.disabled = false;

    if (response.ok) {
      this.usernameInputError.style.display = "none";
      this.usernameInputError.textContent = "";
      return;
    }

    this.usernameInputError.textContent = /** @type { string } */ (
      response.error
    );

    this.usernameInputError.style.display = "";
    this.usernameInput.value = this.serverConnection.username;
  }
}

export { UI };

