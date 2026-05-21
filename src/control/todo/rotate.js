import { want } from '../../unit/';
import event from '../../unit/event';
import actions from '../../actions';
import states from '../states';
import { music } from '../../unit/music';

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
        const next = cur.rotate();
        const matrix = state.get('matrix');
        if (want(next, matrix)) {
          store.dispatch(actions.moveBlock(next));
        } else {
          const offsets = [1, -1, 2, -2];
          for (let i = 0; i < offsets.length; i++) {
            const kickedNext = {
              ...next,
              xy: [next.xy[0], next.xy[1] + offsets[i]],
            };
            if (want(kickedNext, matrix)) {
              store.dispatch(actions.moveBlock(kickedNext));
              break;
            }
          }
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
