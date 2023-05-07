/* eslint-disable no-use-before-define */
const Board = (() => {
  function init() {
    const cells = document.querySelectorAll('.board__cell');
    cells.forEach((cell) => {
      cell.classList.remove('circle', 'cross');
      cell.classList.add('empty');
      cell.replaceChildren();
    });
    const winningLineBox = document.querySelector('.winningLineBox');
    winningLineBox.replaceChildren();
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
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('circleMark');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#circle__path');
    svg.appendChild(use);
    cellElement.appendChild(svg);
  }

  function drawCross(cell) {
    const cellElement = cell;
    const div = document.createElement('div');
    div.classList.add('crossMark');
    const svgLeft = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    svgLeft.classList.add('cross__left');
    const useLeft = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'use'
    );
    useLeft.setAttribute('href', '#cross__left');
    svgLeft.appendChild(useLeft);
    const svgRight = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    svgRight.classList.add('cross__right');
    const useRight = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'use'
    );
    useRight.setAttribute('href', '#cross__right');
    svgRight.appendChild(useRight);

    div.appendChild(svgLeft);
    div.appendChild(svgRight);

    cellElement.appendChild(div);
  }

  function drawMark(mark, cell) {
    if (mark === 'circle') drawCircle(cell);
    if (mark === 'cross') drawCross(cell);
    cell.classList.remove('empty');
    cell.classList.add(mark);
  }

  function formatSVG(direction, color, distance, gridArea) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('winningMark');
    svg.style.setProperty('--distance', distance);
    svg.style.setProperty('--stroke', color);
    svg.style.setProperty('grid-area', gridArea);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${direction}`);
    svg.appendChild(use);
    return svg;
  }

  function drawWinningLine(winnerMark, winningLine) {
    const smallLine = 121.6552506059644;
    const longLine = 136.01470508735443;
    const color = winnerMark === 'cross' ? 'green' : 'red';
    let svgLine;
    switch (winningLine) {
      case '012':
        svgLine = formatSVG('horizontal__line', color, smallLine, '1/1/2/4');
        break;
      case '345':
        svgLine = formatSVG('horizontal__line', color, smallLine, '2/1/3/4');
        break;
      case '678':
        svgLine = formatSVG('horizontal__line', color, smallLine, '3/1/4/4');
        break;
      case '036':
        svgLine = formatSVG('vertical__line', color, smallLine, '1/1/4/2');
        break;
      case '147':
        svgLine = formatSVG('vertical__line', color, smallLine, '1/2/4/3');
        break;
      case '258':
        svgLine = formatSVG('vertical__line', color, smallLine, '1/3/4/4');
        break;
      case '246':
        svgLine = formatSVG('diagonal__right', color, longLine, '1/1/4/4');
        break;
      case '048':
        svgLine = formatSVG('diagonal__left', color, longLine, '1/1/4/4');
        break;
      default:
    }
    const winningLineBox = document.querySelector('.winningLineBox');
    winningLineBox.appendChild(svgLine);
  }

  return { init, drawMark, getRandomEmptyCell, hasEmptyCells, drawWinningLine };
})();

const Game = (() => {
  const state = [];
  const user = {};
  const machine = { name: 'Machine' };
  let winnerMark;
  let winningLine;

  function showResultModal() {
    const resultModal = document.querySelector('.resultModal');
    resultModal.showModal();
  }

  function declareWinner() {
    const resultMessage = document.querySelector('.result__message');
    if (winnerMark) {
      const winnerName = user.mark === winnerMark ? user.name : machine.name;
      resultMessage.textContent = `${winnerName} wins the game!`;
      const color = winnerMark === 'cross' ? 'green' : 'red';
      resultMessage.style.setProperty('--color', color);
      setTimeout(() => Board.drawWinningLine(winnerMark, winningLine), 1000);
    } else {
      resultMessage.textContent = 'It is a tie!';
      resultMessage.style.setProperty('--color', 'black');
    }
    setTimeout(() => showResultModal(), winnerMark ? 2000 : 1000);
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
        winnerMark = lineString === 'XXX' ? 'cross' : 'circle';
        winningLine = line;
      }
    });
    return !!winnerMark;
  }

  function fillState(mark, cell) {
    const stateIndex = cell.dataset.cell;
    state[stateIndex] = mark === 'cross' ? 'X' : 'O';
  }

  function cellClicked(e) {
    const cellSelected = e.target;
    if (cellSelected.classList.contains('empty')) {
      Board.drawMark(user.mark, cellSelected);
      fillState(user.mark, cellSelected);
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
    Board.drawMark(machine.mark, cellChoice);
    fillState(machine.mark, cellChoice);
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

  function setUserMachine(info) {
    user.name = info.name ? info.name : 'Human';
    user.mark = info.symbol;
    machine.mark = user.mark === 'cross' ? 'circle' : 'cross';
  }

  function removeCellsEventListeners() {
    const cells = document.querySelectorAll('.board__cell');
    cells.forEach((cell) => cell.removeEventListener('click', cellClicked));
  }

  function clearInfo() {
    delete user.name;
    delete user.mark;
    delete machine.mark;
    winnerMark = undefined;
    winningLine = undefined;
    state.splice(0);
  }
  function init() {
    removeCellsEventListeners();
    Board.init();
    activateEmptyCells();
  }
  return { init, setUserMachine, clearInfo };
})();

const modal = (() => {
  const userInfoModal = document.querySelector('.userInfoModal');

  function actionPlayAgain() {
    const modals = document.querySelectorAll('dialog');
    modals.forEach((dialog) => dialog.close());
    getUserInfo();
  }

  function activatePlayAgainBtns() {
    const playAgainBtns = document.querySelectorAll('.playAgainBtn');
    playAgainBtns.forEach((btn) => {
      btn.addEventListener('click', actionPlayAgain);
    });
  }
  function readUserInfo() {
    const formElements = document.querySelector('.form__user').elements;
    const name = formElements.name.value;
    const symbol = formElements.symbol.value;
    return { name, symbol };
  }

  function proceedToStart() {
    Game.clearInfo();
    const info = readUserInfo();
    Game.setUserMachine(info);
    Game.init();
    userInfoModal.close();
  }

  function getUserInfo() {
    userInfoModal.showModal();
    const startGameBtn = document.querySelector('#startGameBtn');
    startGameBtn.addEventListener('click', proceedToStart);
  }
  return { getUserInfo, activatePlayAgainBtns };
})();

(() => {
  modal.getUserInfo();
  modal.activatePlayAgainBtns();
})();
