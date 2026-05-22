import * as reducerType from '../../unit/reducerType';

const initState = 0;

const challengePosition = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_POSITION:
      return action.data;
    default:
      return state;
  }
};

export default challengePosition;