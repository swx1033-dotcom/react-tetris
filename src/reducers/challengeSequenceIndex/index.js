import * as reducerType from '../../unit/reducerType';

const initState = 0;

const challengeSequenceIndex = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_SEQUENCE_INDEX:
      return action.data;
    default:
      return state;
  }
};

export default challengeSequenceIndex;