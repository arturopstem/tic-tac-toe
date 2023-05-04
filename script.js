/* eslint-disable no-use-before-define */
const Board = (() => {
  function init() {
    const cells = document.querySelectorAll('.board__cell');
    cells.forEach((cell) => {
      cell.classList.remove('circle', 'cross');
      cell.classList.add('empty');
      cell.replaceChildren();
    });
  }

  function getRandomEmptyCell() {
    const emptyCells = document.querySelectorAll('.empty');
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  function hasEmptyCells() {
    const numberOfEmptyCells = document.querySelectorAll('.empty').length;
    return numberOfEmptyCells !== 0;
  }

  function drawCircle(cell) {
    const cellElement = cell;
    cellElement.innerHTML =
      '<svg class="circleMark"><use href="#circle__path"></use></svg>';
  }

  function drawCross(cell) {
    const cellElement = cell;
    cellElement.innerHTML =
      '<div class="crossMark"><svg class="cross__left"><use href="#cross__left"></use></svg><svg class="cross__right"><use href="#cross__right"></use></svg></div>';
  }

  function drawMark(mark, cell) {
    if (mark === 'circle') drawCircle(cell);
    if (mark === 'cross') drawCross(cell);
    cell.classList.remove('empty');
    cell.classList.add(mark);
  }
  return { init, drawMark, getRandomEmptyCell, hasEmptyCells };
})();

const Game = (() => {
  const state = [];
  const userMark = 'cross';
  const machineMark = 'circle';
  let winner;
  let winningLine;

  function declareWinner() {
    if (winner) {
      console.log(`${winner} wins with line ${winningLine}`);
      console.log('Game ended');
    }
  }

  function hasWinner() {
    const winningLines = [
      '012',
      '345',
      '678',
      '036',
      '147',
      '258',
      '246',
      '048',
    ];
    winningLines.forEach((line) => {
      const indexList = line.split('');
      const lineArray = [];
      indexList.forEach((index) => {
        const cellState = state[index];
        if (cellState) lineArray.push(cellState);
      });
      const lineString = lineArray.join('');
      if (lineString === 'XXX' || lineString === 'OOO') {
        winner = lineString === 'XXX' ? 'cross' : 'circle';
        winningLine = line;
      }
    });
    return !!winner;
  }

  function fillState(mark, cell) {
    const stateIndex = cell.dataset.cell;
    state[stateIndex] = mark === 'cross' ? 'X' : 'O';
  }

  function cellClicked(e) {
    const cellSelected = e.target;
    if (cellSelected.classList.contains('empty')) {
      Board.drawMark(userMark, cellSelected);
      fillState(userMark, cellSelected);
      deactivateEmptyCells();
      if (hasWinner() || !Board.hasEmptyCells()) {
        declareWinner();
        return;
      }
      setTimeout(machineTurn, 1000);
    }
  }

  function machineTurn() {
    const cellChoice = Board.getRandomEmptyCell();
    Board.drawMark(machineMark, cellChoice);
    fillState(machineMark, cellChoice);
    if (hasWinner()) {
      declareWinner();
      return;
    }
    setTimeout(activateEmptyCells, 1000);
  }

  function activateEmptyCells() {
    const emptyCells = document.querySelectorAll('.empty');
    emptyCells.forEach((cell) => {
      cell.addEventListener('click', cellClicked);
    });
  }

  function deactivateEmptyCells() {
    const emptyCells = document.querySelectorAll('.empty');
    emptyCells.forEach((cell) => {
      cell.removeEventListener('click', cellClicked);
    });
  }

  function init() {
    winner = undefined;
    winningLine = undefined;
    state.splice(0);
    Board.init();
    activateEmptyCells();
  }
  return { init };
})();

Game.init();
