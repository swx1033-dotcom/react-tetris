import event from '../../unit/event';
import actions from '../../actions';
import states from '../states';
import { canUndo } from '../../reducers/undo';

const down = (store) => {
  store.dispatch(actions.keyboard.keyUndo(true));
  event.down({
    key: 'z',
    once: true,
    callback: () => {
      if (!canUndo()) {
        return;
      }
      store.dispatch(actions.undo());
      const newState = store.getState();
      clearTimeout(states.fallInterval);
      if (newState.get('cur') && !newState.get('reset') && !newState.get('pause')) {
        states.auto();
      }
    },
  });
};

const up = (store) => {
  store.dispatch(actions.keyboard.keyUndo(false));
  event.up({
    key: 'z',
  });
};

export default {
  down,
  up,
};
