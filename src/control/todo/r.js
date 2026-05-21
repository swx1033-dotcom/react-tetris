import event from '../../unit/event';
import states from '../states';
import actions from '../../actions';

const down = (store) => {
  store.dispatch(actions.keyboard.reset(true));
  const state = store.getState();
  if (state.get('lock')) {
    return;
  }
  if (state.get('cur') !== null) {
    event.down({
      key: 'r',
      once: true,
      callback: () => {
        // 如果当前处于暂停状态，先解暂停
        if (store.getState().get('pause')) {
          states.pause(false);
        }
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
        // 如果当前处于暂停状态，先解暂停
        if (store.getState().get('pause')) {
          states.pause(false);
        }
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
