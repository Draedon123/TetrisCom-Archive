// @ts-check

const { log } = require("./log.cjs");

class Room {
  /** @readonly @type { Map<string, Room> } */
  static rooms = new Map();
  /** @readonly @type { import("./Player.cjs").Player[] } */
  players;
  /** @readonly @type { string }  */
  id;
  /** @readonly @type { number }  */
  maxPlayers;
  /** @private @type { number } */
  // @ts-expect-error set in constructor via `seed` setter
  _seed;
  /** @private @type { () => void } */
  onPlayerReady;

  /**
   * @param { string } id
   * @param { number } maxPlayers
   */
  constructor(id, maxPlayers = 2) {
    this.players = [];
    this.id = id;
    this.maxPlayers = maxPlayers;
    this.seed = this.getRandomSeed();
    this.onPlayerReady = this._onPlayerReady.bind(this);

    log(`Opening room ${id}`);
    Room.rooms.set(id, this);
  }

  /**
   * @param { import("./Player.cjs").Player } player
   * @returns { boolean }
   */
  addPlayer(player) {
    if (this.players.includes(player)) {
      log(`Player ${player.id} aleady in room ${this.id}`);
      return false;
    }

    if (this.players.length >= this.maxPlayers) {
      log(
        `Room ${this.id} has no more room for player ${player.id} (max player count is ${this.maxPlayers})`
      );
      return false;
    }

    this.players.push(player);
    log(`Added player ${player.id} to room ${this.id}`);

    player.sendSeed(this.seed);
    player.addListener("ready", this.onPlayerReady);

    return true;
  }

  _onPlayerReady() {
    const numReadyPlayers = this.players.reduce(
      (count, player) => (player.ready ? count + 1 : count),
      0
    );

    if (numReadyPlayers === this.players.length) {
      setTimeout(() => this.startGame(), 2000);
    }
  }

  destroy() {
    if (Room.rooms.has(this.id)) {
      log(`Closing room ${this.id}`);
    }

    Room.rooms.delete(this.id);
  }

  /**
   * @param { import("./Player.cjs").Player } player
   */
  removePlayer(player) {
    if (!this.players.includes(player)) {
      log(
        `Could not find player ${player.id} to remove them from room ${this.id}`
      );
      return;
    }

    this.players.splice(this.players.indexOf(player), 1);
    player.removeListener("ready", this.onPlayerReady);
    log(`Removed player ${player.id} from room ${this.id}`);

    if (this.players.length === 0) {
      this.destroy();
    }
  }

  startGame() {
    if (this.players.some((player) => !player.ready)) {
      log(
        `Could not start game in room ${this.id} since not all players are ready`
      );

      return;
    }

    log(`Starting game in room ${this.id} with seed ${this.seed}`);

    for (const player of this.players) {
      player.sendStartGameMessage();
    }
  }

  /**
   * @returns { number }
   */
  getRandomSeed() {
    return Math.floor(Math.random() * 2 ** 31);
  }

  /**
   * @returns { number }
   */
  get seed() {
    return this._seed;
  }

  /**
   * @param { number } seed
   */
  set seed(seed) {
    this._seed = seed;

    for (const player of this.players) {
      player.sendSeed(seed);
    }
  }

  /**
   * @param { import("./Player.cjs").Player } player
   * @param { string } roomId
   * @returns { Room }
   */
  static addPlayerToRoom(player, roomId) {
    if (Room.rooms.has(roomId)) {
      const room = /** @type { Room } */ (Room.rooms.get(roomId));
      room.addPlayer(player);

      return room;
    }

    const room = new Room(roomId);
    room.addPlayer(player);

    return room;
  }
}

module.exports = { Room };
