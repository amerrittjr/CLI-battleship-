const chalk = require("chalk");
const { displayMenu, askForBoardSize, handleGamePlay } = require("./helpers");
const { boardSizes } = require("./config");

function startGame() {
  displayMenu();
  const choice = askForBoardSize();
  const boardSize = boardSizes[choice + 1];
  handleGamePlay(boardSize);
}

startGame();
