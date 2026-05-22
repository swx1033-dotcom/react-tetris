import * as reducerType from '../../unit/reducerType';

const initState = [];

const challengeSequence = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_SEQUENCE:
      return action.data;
    default:
      return state;
  }
};

export default challengeSequence;