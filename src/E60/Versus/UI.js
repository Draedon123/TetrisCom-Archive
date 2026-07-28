// @ts-check

class UI {
  /** @type { import("./ServerConnection").ServerConnection } */
  serverConnection;
  /** @type { HTMLInputElement } */
  usernameInput;
  /** @type { HTMLElement } */
  usernameInputError;
  /** @type { HTMLButtonElement } */
  searchRoomsButton;
  /** @type { HTMLElement } */
  roomListings;
  /** @type { HTMLInputElement } */
  joinRoomInput;
  /** @type { HTMLButtonElement } */
  joinRoomButton;
  /** @type { HTMLElement } */
  joinRoomMessage;

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
    this.searchRoomsButton = /** @type { HTMLButtonElement } */ (
      document.getElementById("room-search")
    );
    this.roomListings = /** @type { HTMLElement } */ (
      document.getElementById("room-listings")
    );
    this.joinRoomInput = /** @type { HTMLInputElement } */ (
      document.getElementById("join-room")
    );
    this.joinRoomButton = /** @type { HTMLButtonElement } */ (
      document.getElementById("join-room-button")
    );
    this.joinRoomMessage = /** @type { HTMLElement } */ (
      document.getElementById("room-join-message")
    );

    this.usernameInput.disabled = false;
    this.searchRoomsButton.disabled = false;
    this.joinRoomInput.disabled = false;
    this.joinRoomButton.disabled = false;

    this.usernameInput.addEventListener("change", () => {
      const username = this.usernameInput.value;

      this.usernameInput.disabled = true;
      serverConnection.username = username;
    });

    this.searchRoomsButton.addEventListener("click", () => {
      /** @type { import("./server/messageTypedefs.cjs").GetRoomsClientMessage } */
      const message = { type: "getRooms" };

      this.serverConnection.sendMessage(JSON.stringify(message));
    });

    this.joinRoomButton.addEventListener("click", () => {
      const roomId = this.joinRoomInput.value;

      if (roomId === "") {
        return;
      }

      if (this.serverConnection.username === "") {
        this.joinRoomMessage.textContent = "Set a username first!";
        this.joinRoomMessage.classList.add("error");

        return;
      }

      this.joinRoomInput.disabled = true;

      /** @type { import("./server/messageTypedefs.cjs").RoomConnectClientMessage } */
      const message = { type: "roomConnect", room: roomId };
      this.serverConnection.sendMessage(JSON.stringify(message));
    });
  }

  /**
   * @param { import("./server/messageTypedefs.cjs").SetUsernameResponseServerMessage } response
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

  /**
   * @param { { id: string, players: string[] }[] } rooms
   */
  setRoomList(rooms) {
    while (this.roomListings.children.length > 0) {
      this.roomListings.children[0].remove();
    }

    if (rooms.length === 0) {
      const text = document.createElement("span");
      text.textContent = "No rooms found";

      this.roomListings.appendChild(text);
    }

    for (const room of rooms) {
      const listElement = document.createElement("li");

      const roomNameElement = document.createElement("span");
      roomNameElement.textContent = room.id;
      listElement.appendChild(roomNameElement);

      const playerListElement = document.createElement("ol");

      for (const player of room.players) {
        const listElement = document.createElement("li");
        listElement.textContent = player;
        playerListElement.appendChild(listElement);
      }

      listElement.appendChild(playerListElement);

      this.roomListings.appendChild(listElement);
    }
  }

  /**
   * @param { import("./server/messageTypedefs.cjs").RoomConnectResponseServerMessage } message
   */
  handleRoomConnectResponse(message) {
    this.joinRoomInput.disabled = false;

    if (message.ok) {
      this.joinRoomMessage.textContent = `Joined room ${message.room}`;
      this.joinRoomMessage.classList.remove("error");

      return;
    }

    this.joinRoomMessage.textContent = /** @type { string } */ (message.error);
    this.joinRoomMessage.classList.add("error");
  }
}

export { UI };

