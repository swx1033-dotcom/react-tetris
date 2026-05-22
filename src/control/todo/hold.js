import event from '../../unit/event';
import actions from '../../actions';
import states from '../states';

const down = (store) => {
  store.dispatch(actions.keyboard.hold(true));
  event.down({
    key: 'hold',
    once: true,
    callback: () => {
      const state = store.getState();
      if (state.get('lock') || state.get('pause')) {
        return;
      }
      const cur = state.get('cur');
      const hold = state.get('hold');
      const canHold = state.get('canHold');
      if (cur !== null && canHold) {
        states.hold(store);
      }
    },
  });
};

const up = (store) => {
  store.dispatch(actions.keyboard.hold(false));
  event.up({
    key: 'hold',
  });
};

export default {
  down,
  up,
};
