import left from './left';
import right from './right';
import down from './down';
import rotate from './rotate';
import space from './space';
import s from './s';
import r from './r';
import p from './p';

const todo = {
  left,
  down,
  rotate,
  right,
  space,
  r,
  p,
  s,
};

const pauseBlocked = {
  left: true,
  down: true,
  rotate: true,
  right: true,
  space: true,
};

const activeTodo = {};

const isPauseBlocked = (type, store) => {
  const state = store.getState();
  return pauseBlocked[type] === true && state.get('pause') === true && state.get('cur') !== null;
};

export const controlDown = (type, store) => {
  if (!todo[type] || isPauseBlocked(type, store)) {
    return false;
  }
  activeTodo[type] = true;
  todo[type].down(store);
  return true;
};

export const controlUp = (type, store) => {
  if (!todo[type] || activeTodo[type] !== true) {
    return false;
  }
  activeTodo[type] = false;
  todo[type].up(store);
  return true;
};

export default todo;
