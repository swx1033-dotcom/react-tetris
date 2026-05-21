import left from './left';
import right from './right';
import down from './down';
import rotate from './rotate';
import space from './space';
import s from './s';
import r from './r';
import p from './p';
import states from '../states';

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

todo.dispatchWithGuard = (store, type) => {
  const state = store.getState();
  const isPause = state.get('pause');
  if (!isPause) {
    todo[type].down(store);
    return;
  }
  if (type === 'p' || type === 's') {
    todo[type].down(store);
    return;
  }
  if (type === 'r') {
    states.pause(false);
    todo[type].down(store);
  }
};

export default todo;
