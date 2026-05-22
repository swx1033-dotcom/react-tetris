import * as reducerType from '../../unit/reducerType';

const initState = false;
const hold = (state = initState, action) => {
  switch (action.type) {
    case reducerType.KEY_HOLD:
      return action.data;
    default:
      return state;
  }
};

export default hold;
