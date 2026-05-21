import actions from '../../actions';
import states from '../states';

const down = (store) => {
  store.dispatch(actions.keyboard.undo(true));
  states.undo();
};

const up = (store) => {
  store.dispatch(actions.keyboard.undo(false));
};

export default {
  down,
  up,
};
