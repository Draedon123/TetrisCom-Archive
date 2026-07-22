// @ts-check

/** @typedef { RoomConnectClientMessage | ReadyClientMessage | InputMessage } ClientMessage */
/** @typedef { { type: "roomConnect", room: string } } RoomConnectClientMessage */
/** @typedef { { type: "ready", ready: boolean } } ReadyClientMessage */

/** @typedef { StartGameServerMessage | SetSeedServerMessage | InputMessage } ServerMessage */
/** @typedef { { type: "startGame" } } StartGameServerMessage */
/** @typedef { { type: "setSeed", seed: number } } SetSeedServerMessage */
/** @typedef { { type: "input", inputId: number, inputType: "on" | "off" } } InputMessage */
