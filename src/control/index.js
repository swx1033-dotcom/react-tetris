import store from '../store';
import todo from './todo';
import actions from '../actions';
import { canUndo } from '../reducers/undo';
import states from './states';

const keyboard = {
  37: 'left',
  38: 'rotate',
  39: 'right',
  40: 'down',
  32: 'space',
  83: 's',
  82: 'r',
  80: 'p',
  67: 'hold', // C key
  16: 'hold', // Shift key
};

let keydownActive;

const boardKeys = Object.keys(keyboard).map(e => parseInt(e, 10));

const keyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
    e.preventDefault();
    if (!canUndo()) {
      return;
    }
    store.dispatch(actions.keyboard.keyUndo(true));
    store.dispatch(actions.undo());
    const newState = store.getState();
    clearTimeout(states.fallInterval);
    if (newState.get('cur') && !newState.get('reset') && !newState.get('pause')) {
      states.auto();
    }
    return;
  }
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
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
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
    store.dispatch(actions.keyboard.keyUndo(false));
    return;
  }
  if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  const type = keyboard[e.keyCode];
  if (type === keydownActive) {
    keydownActive = '';
  }
  todo[type].up(store);
};

document.addEventListener('keydown', keyDown, true);
document.addEventListener('keyup', keyUp, true);

