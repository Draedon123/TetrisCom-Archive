// @ts-check

/** @typedef { RoomConnectClientMessage | ReadyClientMessage | TransformLivePieceMessage | LockPieceMessage | UpdateUsernameClientMessage | GetRoomsClientMessage | ScoreMessage } ClientMessage */
/** @typedef { { type: "roomConnect", room: string } } RoomConnectClientMessage */
/** @typedef { { type: "updateUsername", username: string } } UpdateUsernameClientMessage */
/** @typedef { { type: "ready", ready: boolean } } ReadyClientMessage */
/** @typedef { { type: "getRooms" } } GetRoomsClientMessage */

/** @typedef { StartGameServerMessage | SetSeedServerMessage | TransformLivePieceMessage | LockPieceMessage | SetUsernameResponseServerMessage | RoomListServerMessage | RoomConnectResponseServerMessage | ScoreMessage } ServerMessage */
/** @typedef { { type: "startGame" } } StartGameServerMessage */
/** @typedef { { type: "setSeed", seed: number } } SetSeedServerMessage */
/** @typedef { { type: "setUsernameResponse", ok: boolean, error?: string, username: string } } SetUsernameResponseServerMessage */
/** @typedef { { type: "roomList", rooms: { id: string, players: string[] }[] } } RoomListServerMessage */
/** @typedef { { type: "roomConnectResponse", ok: boolean, error?: string, room: string } } RoomConnectResponseServerMessage */

/** @typedef { { type: "movePiece", transform: [number, number, number] } } TransformLivePieceMessage */
/** @typedef { { type: "lockPiece" } } LockPieceMessage */
/** @typedef { { type: "score", score: number } } ScoreMessage */
