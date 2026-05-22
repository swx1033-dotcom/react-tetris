import * as reducerType from '../../unit/reducerType';

const initState = false;

const challenge = (state = initState, action) => {
  switch (action.type) {
    case reducerType.KEY_CHALLENGE:
      return action.data;
    default:
      return state;
  }
};

export default challenge;
