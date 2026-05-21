import * as reducerType from '../../unit/reducerType';

const undo = (state = false, action) => {
  switch (action.type) {
    case reducerType.KEY_UNDO:
      return action.data;
    default:
      return state;
  }
};

export default undo;
