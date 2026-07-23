// @ts-check

/** @typedef { RoomConnectClientMessage | ReadyClientMessage | TransformLivePieceMessage } ClientMessage */
/** @typedef { { type: "roomConnect", room: string } } RoomConnectClientMessage */
/** @typedef { { type: "ready", ready: boolean } } ReadyClientMessage */

/** @typedef { StartGameServerMessage | SetSeedServerMessage | TransformLivePieceMessage } ServerMessage */
/** @typedef { { type: "startGame" } } StartGameServerMessage */
/** @typedef { { type: "setSeed", seed: number } } SetSeedServerMessage */

/** @typedef { { type: "movePiece", transform: [number, number, number] } } TransformLivePieceMessage */
