import store from '../../store';
import actions from '../../actions';
import states from '../states';
import event from '../../unit/event';

const down = () => {
  store.dispatch(actions.keyboard.challenge(true));
  if (store.getState().get('lock')) {
    return;
  }
  event.down({
    key: 'c',
    once: true,
    callback: () => {
      const state = store.getState();
      if (state.get('lock')) {
        return;
      }
      const isChallenge = state.get('challengeMode');
      store.dispatch(actions.challengeMode(!isChallenge));
      
      if (state.get('cur') !== null) {
        states.overStart(); // Stop current game if toggled
      }
    },
  });
};

const up = () => {
  store.dispatch(actions.keyboard.challenge(false));
  event.up({
    key: 'c',
  });
};

export default {
  down,
  up,
};
