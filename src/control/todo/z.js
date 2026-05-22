import event from '../../unit/event';
import actions from '../../actions';
import states from '../states';

const down = (store) => {
  event.down({
    key: 'z',
    once: true,
    callback: () => {
      const state = store.getState();
      if (state.get('lock') || state.get('pause') || state.get('reset')) {
        return;
      }
      if (state.get('cur') === null) {
        return;
      }
      store.dispatch(actions.undo());
      states.auto();
    },
  });
};

const up = () => {};

export default {
  down,
  up,
};