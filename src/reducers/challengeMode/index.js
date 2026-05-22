import * as reducerType from '../../unit/reducerType';

const initState = false;

const challengeMode = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_MODE:
      return action.data;
    default:
      return state;
  }
};

export default challengeMode;