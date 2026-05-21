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
  90: 'z',
};

let keydownActive;

const boardKeys = Object.keys(keyboard).map(e => parseInt(e, 10));

const keyDown = (e) => {
  if (e.keyCode === 90 && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    // Allow Ctrl+Z to work, fall through to keyboard[90]
  } else if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  } else if (e.keyCode === 90) {
    // If just Z is pressed without Ctrl, ignore it (optional, but requested is Ctrl+Z)
    return;
  }
  
  const type = keyboard[e.keyCode];
  if (type === keydownActive) {
    return;
  }
  keydownActive = type;
  todo[type].down(store);
};

const keyUp = (e) => {
  if (e.keyCode === 90 && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
  } else if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  } else if (e.keyCode === 90) {
    // let it pass
  }
  
  const type = keyboard[e.keyCode];
  if (type === keydownActive) {
    keydownActive = '';
  }
  todo[type].up(store);
};

document.addEventListener('keydown', keyDown, true);
document.addEventListener('keyup', keyUp, true);

