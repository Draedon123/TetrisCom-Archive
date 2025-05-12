// @ts-check

import { GameRow } from "./GameRow.js";
import { isMobileOrTablet } from "./isMobile.js";
import { parseSaveString, SCORE_KEYS } from "./parseSaveString.js";

const isMobile = isMobileOrTablet();

const mainGameScores = parseSaveString(
  localStorage.getItem(SCORE_KEYS[isMobile ? "MAIN" : "MAIN_MOBILE"]) ?? ""
);
const mindBenderScores = parseSaveString(
  localStorage.getItem(
    SCORE_KEYS[isMobile ? "MIND_BENDER" : "MIND_BENDER_MOBILE"]
  ) ?? ""
);

new GameRow(
  "Main Game",
  "#2c9bfa",
  "/TetrisCom-Archive/Tetris",
  "/TetrisCom-Archive/games-content/play-tetris-content/resources/project-tetriscom/game/game-698B044815E60783/Tetrion-resources/project-Marathon/art/logos/main-logo-small.png",
  "Tetris Logo",
  Math.max(...mainGameScores),
  isMobile,
  true
).mount(document.body);

new GameRow(
  "Mind Bender",
  "#69bbf5",
  "/TetrisCom-Archive/MindBender",
  "/TetrisCom-Archive/games-content/tetrismindbender/resources/project-tetriscom-mindbender/game/game-101B2723A94C0CC3/Tetrion-resources/project-MindBender/MindBender/art/main-logo-small.png",
  "Tetris Mind Bender Logo",
  Math.max(...mindBenderScores),
  isMobile,
  true
).mount(document.body);

new GameRow(
  "E60",
  "#3b3",
  "/TetrisCom-Archive/E60",
  "/TetrisCom-Archive/games-content/e60/resources/project-tetriscom-e60/game/game-C3592CBD4B5BDD84/Tetrion-resources/project-Movie/project-E60/art/minos/size-24/mino-E60-v3-normal-~size-24~.png",
  "Tetris E60 Mino",
  undefined,
  isMobile,
  false
).mount(document.body);
