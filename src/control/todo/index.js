import left from './left';
import right from './right';
import down from './down';
import rotate from './rotate';
import space from './space';
import s from './s';
import r from './r';
import p from './p';

const todos = {
  left,
  down,
  rotate,
  right,
  space,
  r,
  p,
  s,
};

// 需要在暂停时被拦截的操作
const interceptWhenPaused = ['left', 'right', 'down', 'rotate', 'space'];

const wrappedTodos = {};

Object.keys(todos).forEach((key) => {
  wrappedTodos[key] = {
    down: (store) => {
      if (interceptWhenPaused.includes(key)) {
        const state = store.getState();
        if (state.get('pause')) {
          return;
        }
      }
      todos[key].down(store);
    },
    up: (store) => {
      if (interceptWhenPaused.includes(key)) {
        const state = store.getState();
        if (state.get('pause')) {
          return;
        }
      }
      todos[key].up(store);
    },
  };
});

export default wrappedTodos;
