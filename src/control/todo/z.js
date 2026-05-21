import actions from '../../actions';
import states from '../states';

const down = (store) => {
  store.dispatch(actions.keyboard.z(true));
  
  const past = store.getState().get('past');
  if (past && past.size > 0) {
    store.dispatch(actions.undo());
    // After undoing, we need to restart the auto fall timer if the game is active
    // But if paused, we don't start auto.
    // If the game was over, undoing will make it not over, so we need to start auto.
    const state = store.getState();
    if (!state.get('pause')) {
      states.auto();
    }
  }
};

const up = (store) => {
  store.dispatch(actions.keyboard.z(false));
};

export default {
  down,
  up,
};
