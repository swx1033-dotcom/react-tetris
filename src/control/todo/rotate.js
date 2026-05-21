import { want } from '../../unit/';
import event from '../../unit/event';
import actions from '../../actions';
import states from '../states';
import { music } from '../../unit/music';

const getRotateBlock = (cur, matrix) => {
  const rotated = cur.rotate();
  const offsets = [0, 1, -1, 2, -2];
  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];
    const next = offset === 0 ? rotated : {
      ...rotated,
      xy: [rotated.xy[0], rotated.xy[1] + offset],
    };
    if (want(next, matrix)) {
      return next;
    }
  }
  return null;
};

const down = (store) => {
  store.dispatch(actions.keyboard.rotate(true));
  if (store.getState().get('cur') !== null) {
    event.down({
      key: 'rotate',
      once: true,
      callback: () => {
        const state = store.getState();
        if (state.get('lock')) {
          return;
        }
        if (state.get('pause')) {
          states.pause(false);
        }
        const cur = state.get('cur');
        if (cur === null) {
          return;
        }
        if (music.rotate) {
          music.rotate();
        }
        const next = getRotateBlock(cur, state.get('matrix'));
        if (next) {
          store.dispatch(actions.moveBlock(next));
        }
      },
    });
  } else {
    event.down({
      key: 'rotate',
      begin: 200,
      interval: 100,
      callback: () => {
        if (store.getState().get('lock')) {
          return;
        }
        if (music.move) {
          music.move();
        }
        const state = store.getState();
        const cur = state.get('cur');
        if (cur) {
          return;
        }
        let startLines = state.get('startLines');
        startLines = startLines + 1 > 10 ? 0 : startLines + 1;
        store.dispatch(actions.startLines(startLines));
      },
    });
  }
};

const up = (store) => {
  store.dispatch(actions.keyboard.rotate(false));
  event.up({
    key: 'rotate',
  });
};

export default {
  down,
  up,
};
