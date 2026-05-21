import store from '../store';
import todo from './todo';

const keyboard = {
  37: 'left',
  38: 'rotate',
  39: 'right',
  40: 'down',
  32: 'space',
  83: 's',
  82: 'r',
  80: 'p',
  90: 'undo',
};

let keydownActive;

const boardKeys = Object.keys(keyboard).map(e => parseInt(e, 10));

const isUndoEvent = e => e.keyCode === 90 && (e.ctrlKey === true || e.metaKey === true);

const keyDown = (e) => {
  if ((e.metaKey === true || e.ctrlKey === true) && !isUndoEvent(e)) {
    return;
  }
  if (!isUndoEvent(e) && (e.keyCode === 90 || boardKeys.indexOf(e.keyCode) === -1)) {
    return;
  }
  const type = keyboard[e.keyCode];
  if (!type) {
    return;
  }
  if (type === 'undo' && e.preventDefault) {
    e.preventDefault();
  }
  if (type === keydownActive) {
    return;
  }
  keydownActive = type;
  todo[type].down(store);
};

const keyUp = (e) => {
  if ((e.metaKey === true || e.ctrlKey === true) && e.keyCode !== 90) {
    return;
  }
  if (e.keyCode !== 90 && boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  const type = keyboard[e.keyCode];
  if (!type) {
    return;
  }
  if (type === keydownActive) {
    keydownActive = '';
  }
  todo[type].up(store);
};

document.addEventListener('keydown', keyDown, true);
document.addEventListener('keyup', keyUp, true);
