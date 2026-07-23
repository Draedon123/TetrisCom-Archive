// @ts-check

/** @typedef { RoomConnectClientMessage | ReadyClientMessage | TransformLivePieceMessage | LockPieceMessage } ClientMessage */
/** @typedef { { type: "roomConnect", room: string } } RoomConnectClientMessage */
/** @typedef { { type: "ready", ready: boolean } } ReadyClientMessage */

/** @typedef { StartGameServerMessage | SetSeedServerMessage | TransformLivePieceMessage | LockPieceMessage } ServerMessage */
/** @typedef { { type: "startGame" } } StartGameServerMessage */
/** @typedef { { type: "setSeed", seed: number } } SetSeedServerMessage */

/** @typedef { { type: "movePiece", transform: [number, number, number] } } TransformLivePieceMessage */
/** @typedef { { type: "lockPiece" } } LockPieceMessage */
