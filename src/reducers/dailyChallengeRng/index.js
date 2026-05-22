import * as reducerType from '../../unit/reducerType';

const initState = null;

const parse = (state = initState, action) => {
  switch (action.type) {
    case reducerType.DAILY_CHALLENGE_RNG:
      return action.data;
    default:
      return state;
  }
};

export default parse;