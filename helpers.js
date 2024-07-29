const readlineSync = require("readline-sync");
const Table = require("cli-table");
const chalk = require("chalk");
const { boardSizes, cellSymbols, isDebugOn } = require("./config");
const { empty, smallShip, largeShip } = cellSymbols;

function displayMenu() {
  console.log("Welcome to Battleship 🚢");
}

function gameBoard(size) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return Array.from({ length: size }, (_, i) => [
    letters[i],
    ...Array(size).fill(empty),
  ]);
}

function printBoard(board, isDebugOn) {
  const headers = [
    " ",
    ...Array.from({ length: board[0].length - 1 }, (_, i) =>
      (i + 1).toString()
    ),
  ];
  const table = new Table({ head: headers });

  board.forEach((row) => {
    const displayRow = row.map((cell, index) => {
      if (index === 0) return cell;
      if (cell === smallShip || cell === largeShip)
        return isDebugOn ? cell : empty;
      return cell;
    });
    table.push(displayRow);
  });

  console.log(table.toString());
}

function placeShips(board, size) {
  const directions = ["horizontal", "vertical"];
  placeShip(board, size, 2, smallShip, directions);
  placeShip(board, size, 3, largeShip, directions);
}

function placeShip(board, size, shipSize, hitMarker, directions) {
  let placed = false;

  while (!placed) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    if (
      (direction === "horizontal" && col + shipSize <= size) ||
      (direction === "vertical" && row + shipSize <= size)
    ) {
      if (canPlaceShip(board, row, col, shipSize, direction)) {
        for (let i = 0; i < shipSize; i++) {
          if (direction === "horizontal") board[row][col + i] = hitMarker;
          else board[row + i][col] = hitMarker;
        }
        placed = true;
      }
    }
  }
}

function canPlaceShip(board, row, col, shipSize, direction) {
  for (let i = 0; i < shipSize; i++) {
    if (
      (direction === "horizontal" && board[row][col + i] !== empty) ||
      (direction === "vertical" && board[row + i][col] !== empty)
    ) {
      return false;
    }
  }
  return true;
}

const handleAttackMessage = (board, row, col) => {
  if (board[row] && board[row][col] !== undefined) {
    if (board[row][col] === smallShip) {
      console.log("Hit!");
      board[row][col] = chalk.keyword("orange")("●");
      return "Hit!";
    } else if (board[row][col] === largeShip) {
      console.log("Hit!");
      board[row][col] = chalk.keyword("blue")("●");
      return "Hit!";
    } else if (board[row][col] === empty) {
      console.log("Miss!");
      board[row][col] = "!";
      return "Miss!";
    } else {
      console.log("Already guessed this location!");
      return "Already guessed this location!";
    }
  } else {
    console.log("Invalid guess. Try again.");
    return "Invalid guess. Try again.";
  }
};

const askForBoardSize = () => {
  return readlineSync.keyInSelect(
    ["4x4", "5x5", "6x6"],
    "Please select a board size: ",
    { cancel: false }
  );
};

function winCondition(board) {
  return !board.some(
    (row) => row.includes(smallShip) || row.includes(largeShip)
  );
}

function printWinMessage() {
  console.log(String.raw`
    
 _  _  _____  __  __    _    _  ____  _  _ 
 ( \/ )(  _  )(  )(  )  ( \/\/ )(_  _)( \( )
  \  /  )(_)(  )(__)(    )    (  _)(_  )  ( 
  (__) (_____)(______)  (__/\__)(____)(_)\_)
 
  `);
}

const checkForEndGame = (board) => {
  if (winCondition(board)) {
    console.clear();
    printWinMessage();
    return true;
  }
  return false;
};

const handleGamePlay = (boardSize) => {
  if (boardSize) {
    const board = gameBoard(boardSize);
    placeShips(board, boardSize);
    printBoard(board, isDebugOn);

    console.log("Press 'Q' or 'q' to quit.");

    while (true) {
      const attack = handleAttack(board);
      if (attack) break;
    }
  } else {
    console.log("Invalid choice. Please try again.");
  }
};

const handleAttack = (board) => {
  const guess = readlineSync
    .question("Make a guess (e.g., A1, B2, etc.): ")
    .toUpperCase();

  if (guess.toLowerCase() === "q") {
    console.log("Game ended by player.");
    return true;
  }

  const row = guess.charCodeAt(0) - 65;
  const col = parseInt(guess.slice(1)) - 0;

  const message = handleAttackMessage(board, row, col);

  console.clear();
  console.log(message);
  printBoard(board, isDebugOn);

  if (checkForEndGame(board)) return true;
};

module.exports = {
  displayMenu,
  handleAttackMessage,
  handleAttack,
  handleGamePlay,
  askForBoardSize,
};
