import store from '../store';
import { controlDown, controlUp } from './todo';

const keyboard = {
  37: 'left',
  38: 'rotate',
  39: 'right',
  40: 'down',
  32: 'space',
  83: 's',
  82: 'r',
  80: 'p',
};

let keydownActive;

const boardKeys = Object.keys(keyboard).map(e => parseInt(e, 10));

const keyDown = (e) => {
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  const type = keyboard[e.keyCode];
  if (type === keydownActive) {
    return;
  }
  if (controlDown(type, store)) {
    keydownActive = type;
  }
};

const keyUp = (e) => {
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  const type = keyboard[e.keyCode];
  if (type === keydownActive) {
    keydownActive = '';
  }
  controlUp(type, store);
};

document.addEventListener('keydown', keyDown, true);
document.addEventListener('keyup', keyUp, true);
