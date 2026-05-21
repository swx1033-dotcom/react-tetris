import event from '../../unit/event';
import states from '../states';
import actions from '../../actions';

const resumeFromPause = (store) => {
  if (store.getState().get('pause')) {
    states.pause(false);
  }
};

const down = (store) => {
  store.dispatch(actions.keyboard.reset(true));
  if (store.getState().get('lock')) {
    return;
  }
  if (store.getState().get('cur') !== null) {
    event.down({
      key: 'r',
      once: true,
      callback: () => {
        if (store.getState().get('lock')) {
          return;
        }
        resumeFromPause(store);
        states.overStart();
      },
    });
  } else {
    event.down({
      key: 'r',
      once: true,
      callback: () => {
        if (store.getState().get('lock')) {
          return;
        }
        resumeFromPause(store);
        states.start();
      },
    });
  }
};

const up = (store) => {
  store.dispatch(actions.keyboard.reset(false));
  event.up({
    key: 'r',
  });
};

export default {
  down,
  up,
};
