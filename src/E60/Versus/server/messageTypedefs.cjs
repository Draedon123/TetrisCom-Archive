// @ts-check

/** @typedef { RoomConnectClientMessage | ReadyClientMessage | TransformLivePieceMessage | LockPieceMessage | UpdateUsernameMessage } ClientMessage */
/** @typedef { { type: "roomConnect", room: string } } RoomConnectClientMessage */
/** @typedef { { type: "updateUsername", username: string } } UpdateUsernameMessage */
/** @typedef { { type: "ready", ready: boolean } } ReadyClientMessage */

/** @typedef { StartGameServerMessage | SetSeedServerMessage | TransformLivePieceMessage | LockPieceMessage | SetUsernameResponseMessage } ServerMessage */
/** @typedef { { type: "startGame" } } StartGameServerMessage */
/** @typedef { { type: "setSeed", seed: number } } SetSeedServerMessage */
/** @typedef { { type: "setUsernameResponse", ok: boolean, error?: string, username: string } } SetUsernameResponseMessage */

/** @typedef { { type: "movePiece", transform: [number, number, number] } } TransformLivePieceMessage */
/** @typedef { { type: "lockPiece" } } LockPieceMessage */
